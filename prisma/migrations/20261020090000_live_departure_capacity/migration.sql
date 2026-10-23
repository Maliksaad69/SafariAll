-- CreateEnum
CREATE TYPE "SlotStatus" AS ENUM ('OPEN', 'CLOSED');

-- DropIndex
DROP INDEX "tour_slots_tour_id_start_date_key";

-- AlterTable
ALTER TABLE "reservations" ADD COLUMN     "vehicle_id" TEXT;

-- AlterTable
ALTER TABLE "tour_slots" ADD COLUMN     "booked_seats" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "departure_time" TEXT NOT NULL DEFAULT '08:00',
ADD COLUMN     "route" TEXT,
ADD COLUMN     "status" "SlotStatus" NOT NULL DEFAULT 'OPEN';

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "operator_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "vehicle_type" TEXT NOT NULL DEFAULT '4x4 Safari Vehicle',
    "seats" INTEGER NOT NULL,
    "plate_number" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "slot_vehicles" (
    "slot_id" TEXT NOT NULL,
    "vehicle_id" TEXT NOT NULL,
    "seats" INTEGER NOT NULL,
    "booked_seats" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "slot_vehicles_pkey" PRIMARY KEY ("slot_id","vehicle_id")
);

-- CreateIndex
CREATE INDEX "vehicles_operator_id_idx" ON "vehicles"("operator_id");

-- CreateIndex
CREATE UNIQUE INDEX "tour_slots_tour_id_start_date_departure_time_key" ON "tour_slots"("tour_id", "start_date", "departure_time");

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "operators"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slot_vehicles" ADD CONSTRAINT "slot_vehicles_slot_id_fkey" FOREIGN KEY ("slot_id") REFERENCES "tour_slots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slot_vehicles" ADD CONSTRAINT "slot_vehicles_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- Backfill: departure dates are stored as UTC midnight; the time lives in departure_time.
UPDATE "tour_slots" SET "start_date" = date_trunc('day', "start_date" + interval '12 hours');

-- Backfill: seat counters from active (pending + approved) reservations.
UPDATE "tour_slots" s SET "booked_seats" = COALESCE((
  SELECT SUM(r."adults_count" + r."children_count") FROM "reservations" r
  WHERE r."slot_id" = s."id" AND r."status" IN ('PENDING', 'APPROVED')
), 0);
UPDATE "tour_slots" SET "max_travelers" = "booked_seats" WHERE "booked_seats" > "max_travelers";

-- Database-level guarantees: a departure or vehicle can never be oversold.
ALTER TABLE "tour_slots" ADD CONSTRAINT "tour_slots_seats_check" CHECK ("booked_seats" >= 0 AND "booked_seats" <= "max_travelers");
ALTER TABLE "slot_vehicles" ADD CONSTRAINT "slot_vehicles_seats_check" CHECK ("seats" > 0 AND "booked_seats" >= 0 AND "booked_seats" <= "seats");
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_seats_check" CHECK ("seats" > 0 AND "seats" <= 100);
