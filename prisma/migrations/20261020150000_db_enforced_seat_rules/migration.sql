-- Seat inventory and fleet rules enforced by the database itself, so every
-- current and future code path (and any direct SQL) follows them.

-- 1. Seat counters follow reservations automatically.
--    A reservation holds seats while PENDING, APPROVED or COMPLETED, and gives
--    them back when DECLINED or CANCELLED. Counters are guarded by the CHECK
--    constraints on tour_slots and slot_vehicles, so an insert or status change
--    that would oversell a departure or a vehicle fails.
CREATE OR REPLACE FUNCTION reservation_seats_sync() RETURNS trigger AS $$
DECLARE
  old_holds boolean := false;
  new_holds boolean := false;
BEGIN
  IF TG_OP IN ('UPDATE', 'DELETE') THEN
    old_holds := OLD.slot_id IS NOT NULL AND OLD.status IN ('PENDING', 'APPROVED', 'COMPLETED');
  END IF;
  IF TG_OP IN ('INSERT', 'UPDATE') THEN
    new_holds := NEW.slot_id IS NOT NULL AND NEW.status IN ('PENDING', 'APPROVED', 'COMPLETED');
  END IF;

  IF TG_OP = 'UPDATE' AND old_holds AND new_holds
     AND OLD.slot_id = NEW.slot_id
     AND OLD.vehicle_id IS NOT DISTINCT FROM NEW.vehicle_id
     AND OLD.adults_count + OLD.children_count = NEW.adults_count + NEW.children_count THEN
    RETURN NEW; -- e.g. PENDING -> APPROVED: seats stay held
  END IF;

  IF old_holds THEN
    UPDATE tour_slots SET booked_seats = booked_seats - (OLD.adults_count + OLD.children_count), updated_at = now()
      WHERE id = OLD.slot_id;
    IF OLD.vehicle_id IS NOT NULL THEN
      UPDATE slot_vehicles SET booked_seats = booked_seats - (OLD.adults_count + OLD.children_count)
        WHERE slot_id = OLD.slot_id AND vehicle_id = OLD.vehicle_id;
    END IF;
  END IF;

  IF new_holds THEN
    UPDATE tour_slots SET booked_seats = booked_seats + (NEW.adults_count + NEW.children_count), updated_at = now()
      WHERE id = NEW.slot_id;
    IF NEW.vehicle_id IS NOT NULL THEN
      IF NOT EXISTS (SELECT 1 FROM slot_vehicles WHERE slot_id = NEW.slot_id AND vehicle_id = NEW.vehicle_id) THEN
        RAISE EXCEPTION 'Vehicle % is not assigned to departure %', NEW.vehicle_id, NEW.slot_id USING ERRCODE = '23514';
      END IF;
      UPDATE slot_vehicles SET booked_seats = booked_seats + (NEW.adults_count + NEW.children_count)
        WHERE slot_id = NEW.slot_id AND vehicle_id = NEW.vehicle_id;
    END IF;
  END IF;

  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reservations_seats_sync
  AFTER INSERT OR UPDATE OR DELETE ON reservations
  FOR EACH ROW EXECUTE FUNCTION reservation_seats_sync();

-- 2. New reservations must be for a scheduled departure (that is what carries capacity).
CREATE OR REPLACE FUNCTION reservation_requires_departure() RETURNS trigger AS $$
BEGIN
  IF NEW.slot_id IS NULL THEN
    RAISE EXCEPTION 'A reservation must be for a scheduled departure' USING ERRCODE = '23502';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reservations_require_departure
  BEFORE INSERT ON reservations
  FOR EACH ROW EXECUTE FUNCTION reservation_requires_departure();

-- 3. A vehicle can only be on one trip at a time.
CREATE OR REPLACE FUNCTION slot_vehicle_no_overlap() RETURNS trigger AS $$
DECLARE
  v_start timestamp;
  v_days integer;
BEGIN
  -- Serialise concurrent assignments of the same vehicle.
  PERFORM 1 FROM vehicles WHERE id = NEW.vehicle_id FOR UPDATE;
  SELECT s.start_date, GREATEST(t.duration_days, 1) INTO v_start, v_days
    FROM tour_slots s JOIN tours t ON t.id = s.tour_id WHERE s.id = NEW.slot_id;
  IF EXISTS (
    SELECT 1 FROM slot_vehicles sv
      JOIN tour_slots s2 ON s2.id = sv.slot_id
      JOIN tours t2 ON t2.id = s2.tour_id
    WHERE sv.vehicle_id = NEW.vehicle_id
      AND sv.slot_id <> NEW.slot_id
      AND s2.start_date < v_start + v_days * interval '1 day'
      AND v_start < s2.start_date + GREATEST(t2.duration_days, 1) * interval '1 day'
  ) THEN
    RAISE EXCEPTION 'VEHICLE_OVERLAP: vehicle % is already on a departure that overlaps these dates', NEW.vehicle_id
      USING ERRCODE = '23P01';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER slot_vehicles_no_overlap
  BEFORE INSERT OR UPDATE OF vehicle_id, slot_id ON slot_vehicles
  FOR EACH ROW EXECUTE FUNCTION slot_vehicle_no_overlap();
