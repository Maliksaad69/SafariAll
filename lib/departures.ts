import type { Prisma } from '@prisma/client';

/**
 * Creating and scheduling departures for a tour, shared by the departures API and
 * the tour builder. Capacity always comes from the vehicles assigned (or a manual
 * group size when the agency has no fleet), and the database refuses to put a
 * vehicle on two overlapping trips.
 */

export class SlotError extends Error {
  constructor(message: string, public status = 409) {
    super(message);
  }
}

export const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

/**
 * Set the vehicles serving a departure and recompute its capacity, inside a locked transaction.
 * Vehicles that already carry travellers cannot be removed, and bookings made before a fleet
 * was assigned are placed into the new vehicles.
 */
export async function applyFleet(
  tx: Prisma.TransactionClient,
  slotId: string,
  operatorId: string,
  vehicleIds: string[] | undefined,
  manualCapacity: number | undefined,
) {
  const [slot] = await tx.$queryRaw<{ max_travelers: number; booked_seats: number }[]>`
    SELECT max_travelers, booked_seats FROM tour_slots WHERE id = ${slotId} FOR UPDATE`;
  if (!slot) throw new SlotError('Departure not found.', 404);

  let current = await tx.slotVehicle.findMany({ where: { slotId } });

  if (vehicleIds) {
    const wanted = Array.from(new Set(vehicleIds));
    const fleet = await tx.vehicle.findMany({ where: { id: { in: wanted }, operatorId, isActive: true } });
    if (fleet.length !== wanted.length) throw new SlotError('One or more vehicles are not part of your active fleet.', 400);

    const removed = current.filter((sv) => !wanted.includes(sv.vehicleId));
    const busy = removed.find((sv) => sv.bookedSeats > 0);
    if (busy) {
      const v = await tx.vehicle.findUnique({ where: { id: busy.vehicleId } });
      throw new SlotError(`${v?.name ?? 'A vehicle'} already carries ${busy.bookedSeats} booked traveller(s) on this departure and cannot be removed.`);
    }
    if (removed.length) await tx.slotVehicle.deleteMany({ where: { slotId, vehicleId: { in: removed.map((r) => r.vehicleId) } } });
    const added = fleet.filter((v) => !current.some((sv) => sv.vehicleId === v.id));
    if (added.length) {
      // A vehicle can only be on the road for one trip at a time.
      const me = await tx.tourSlot.findUniqueOrThrow({ where: { id: slotId }, include: { tour: { select: { durationDays: true } } } });
      const clash = await findVehicleClash(tx, added.map((v) => v.id), me.startDate, me.tour.durationDays, slotId);
      if (clash) throw new SlotError(clash);
      await tx.slotVehicle.createMany({ data: added.map((v) => ({ slotId, vehicleId: v.id, seats: v.seats })) });
    }
    current = await tx.slotVehicle.findMany({ where: { slotId } });
  }

  // Place bookings that have no vehicle yet (made before a fleet was assigned).
  if (current.length) {
    const unplaced = await tx.reservation.findMany({
      where: { slotId, vehicleId: null, status: { in: ['PENDING', 'APPROVED'] } },
      orderBy: { createdAt: 'asc' },
    });
    for (const r of unplaced) {
      const pax = r.adultsCount + r.childrenCount;
      const fit = current
        .filter((sv) => sv.seats - sv.bookedSeats >= pax)
        .sort((a, b) => a.seats - a.bookedSeats - (b.seats - b.bookedSeats))[0];
      if (!fit) throw new SlotError(`The selected vehicles cannot seat the existing booking of ${pax} traveller(s) together. Add a larger vehicle.`);
      fit.bookedSeats += pax;
      // The reservations trigger moves the seats onto the vehicle's counter.
      await tx.reservation.update({ where: { id: r.id }, data: { vehicleId: fit.vehicleId } });
    }
  }

  const capacity = current.length ? current.reduce((sum, sv) => sum + sv.seats, 0) : manualCapacity ?? slot.max_travelers;
  if (!Number.isInteger(capacity) || capacity < 1) throw new SlotError('Capacity must be at least 1 seat.', 400);
  if (capacity < slot.booked_seats) {
    throw new SlotError(`This departure already has ${slot.booked_seats} booked seats, so capacity cannot go below that.`);
  }
  await tx.$executeRaw`UPDATE tour_slots SET max_travelers = ${capacity}, updated_at = now() WHERE id = ${slotId}`;
}

const DAY_MS = 86_400_000;

/** Returns a message when one of the vehicles is already out on another departure in this date range. */
async function findVehicleClash(tx: Prisma.TransactionClient, vehicleIds: string[], start: Date, days: number, exceptSlotId: string) {
  const end = new Date(start.getTime() + Math.max(days, 1) * DAY_MS);
  const others = await tx.slotVehicle.findMany({
    where: { vehicleId: { in: vehicleIds }, slotId: { not: exceptSlotId }, slot: { startDate: { gt: new Date(start.getTime() - 60 * DAY_MS), lt: end } } },
    include: { vehicle: { select: { name: true } }, slot: { include: { tour: { select: { title: true, durationDays: true } } } } },
  });
  const hit = others.find((o) => new Date(o.slot.startDate.getTime() + Math.max(o.slot.tour.durationDays, 1) * DAY_MS) > start);
  return hit
    ? `${hit.vehicle.name} is already out on "${hit.slot.tour.title}" departing ${hit.slot.startDate.toISOString().slice(0, 10)}, which overlaps these dates.`
    : null;
}

/** Create one departure inside a transaction and assign its vehicles. */
export async function createDeparture(
  tx: Prisma.TransactionClient,
  d: { tourId: string; operatorId: string; startDate: Date; departureTime: string; route?: string | null; note?: string | null; vehicleIds?: string[]; maxTravelers?: number },
) {
  if (!TIME_RE.test(d.departureTime)) throw new SlotError('Departure time must be in HH:MM format.', 400);
  if (!d.vehicleIds?.length && !(d.maxTravelers && d.maxTravelers >= 1)) {
    throw new SlotError('Assign at least one vehicle or set a maximum group size.', 400);
  }
  const created = await tx.tourSlot.create({
    data: {
      tourId: d.tourId,
      startDate: d.startDate,
      departureTime: d.departureTime,
      route: d.route ? d.route.slice(0, 200) : null,
      note: d.note ? d.note.slice(0, 500) : null,
      maxTravelers: d.maxTravelers && d.maxTravelers >= 1 ? Math.floor(d.maxTravelers) : 1,
    },
  });
  await applyFleet(tx, created.id, d.operatorId, d.vehicleIds, d.maxTravelers);
  return created;
}

const DAY = 86_400_000;

/**
 * Create a repeating schedule: a departure every `everyDays` days from `firstDate` to `until`.
 * Each departure gets `vehiclesPerDeparture` vehicles from `vehicleIds` that are free for the
 * whole trip; dates where not enough vehicles are free are skipped and reported.
 */
export async function scheduleDepartures(
  tx: Prisma.TransactionClient,
  s: {
    tourId: string; operatorId: string; durationDays: number; firstDate: Date; until: Date; everyDays: number;
    departureTime: string; route?: string | null; vehicleIds: string[]; vehiclesPerDeparture: number; maxTravelers?: number;
  },
) {
  if (s.everyDays < 1 || s.everyDays > 90) throw new SlotError('Repeat interval must be between 1 and 90 days.', 400);
  if (s.until < s.firstDate) throw new SlotError('The schedule end date must be after the first departure.', 400);
  if ((s.until.getTime() - s.firstDate.getTime()) / DAY / s.everyDays > 104) throw new SlotError('At most 104 departures can be scheduled at once.', 400);
  const created: string[] = [];
  const skipped: string[] = [];
  for (let t = s.firstDate.getTime(); t <= s.until.getTime(); t += s.everyDays * DAY) {
    const start = new Date(t);
    let vehicles: string[] = [];
    if (s.vehicleIds.length) {
      const end = new Date(t + Math.max(s.durationDays, 1) * DAY);
      const busy = await tx.slotVehicle.findMany({
        where: { vehicleId: { in: s.vehicleIds }, slot: { startDate: { gt: new Date(t - 60 * DAY), lt: end } } },
        include: { slot: { include: { tour: { select: { durationDays: true } } } } },
      });
      const isBusy = (id: string) => busy.some((b) => b.vehicleId === id && b.slot.startDate.getTime() + Math.max(b.slot.tour.durationDays, 1) * DAY > t);
      vehicles = s.vehicleIds.filter((id) => !isBusy(id)).slice(0, s.vehiclesPerDeparture);
      if (vehicles.length < s.vehiclesPerDeparture) {
        skipped.push(start.toISOString().slice(0, 10));
        continue;
      }
    }
    const exists = await tx.tourSlot.findFirst({ where: { tourId: s.tourId, startDate: start, departureTime: s.departureTime } });
    if (exists) {
      skipped.push(start.toISOString().slice(0, 10));
      continue;
    }
    const slot = await createDeparture(tx, {
      tourId: s.tourId, operatorId: s.operatorId, startDate: start, departureTime: s.departureTime, route: s.route,
      vehicleIds: vehicles.length ? vehicles : undefined, maxTravelers: vehicles.length ? undefined : s.maxTravelers,
    });
    created.push(slot.id);
  }
  return { created: created.length, skipped };
}
