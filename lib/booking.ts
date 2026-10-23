import type { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';

/**
 * Seat inventory for departures.
 *
 * The seat counters (tour_slots.booked_seats, slot_vehicles.booked_seats) are
 * maintained by a database trigger on reservations (see migration
 * 20261020150000_db_enforced_seat_rules) and bounded by CHECK constraints, so
 * no code path can oversell. reserveSeats() locks the departure row first, so
 * concurrent bookings for the same departure queue up, checks the request and
 * picks a vehicle; inserting the reservation in the same transaction then takes
 * the seats.
 */

type Tx = Prisma.TransactionClient;

export type BookingErrorCode = 'SLOT_GONE' | 'SLOT_CLOSED' | 'DEPARTED' | 'SLOT_FULL' | 'CAPACITY' | 'NO_VEHICLE_FIT';

export class BookingError extends Error {
  constructor(public code: BookingErrorCode, message: string, public spotsLeft = 0) {
    super(message);
  }
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

/** Start of today in UTC; departures are stored as UTC midnight. */
export const todayUtc = () => {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};

/** Parse "YYYY-MM-DD" (or any date) to UTC midnight of that calendar day. */
export function toUtcDay(value: string | Date): Date | null {
  const s = typeof value === 'string' ? value.slice(0, 10) : value.toISOString().slice(0, 10);
  const d = new Date(`${s}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Take `pax` seats on a departure. Must run inside a transaction.
 * Returns the vehicle the group was placed in (null when the departure has no fleet assigned).
 */
export async function reserveSeats(tx: Tx, slotId: string, pax: number): Promise<{ vehicleId: string | null }> {
  const slots = await tx.$queryRaw<{ max_travelers: number; booked_seats: number; status: string; start_date: Date }[]>`
    SELECT max_travelers, booked_seats, status::text AS status, start_date
    FROM tour_slots WHERE id = ${slotId} FOR UPDATE`;
  const slot = slots[0];
  if (!slot) throw new BookingError('SLOT_GONE', 'This departure is no longer available. Please pick another date.');
  if (slot.status !== 'OPEN') throw new BookingError('SLOT_CLOSED', 'The operator has closed this departure. Please pick another date.');
  if (slot.start_date < todayUtc()) throw new BookingError('DEPARTED', 'This departure has already left. Please pick another date.');

  const left = slot.max_travelers - slot.booked_seats;
  if (left <= 0) throw new BookingError('SLOT_FULL', 'This departure is now fully booked. Every seat has been taken. Please choose another departure.');
  if (pax > left) {
    throw new BookingError('CAPACITY', `Only ${plural(left, 'seat')} left on this departure, and your group needs ${pax}. Reduce the group or pick another departure.`, left);
  }

  // Fleet allocation: put the whole group in one vehicle, choosing the tightest fit.
  let vehicleId: string | null = null;
  const vehicles = await tx.$queryRaw<{ vehicle_id: string; seats: number; booked_seats: number }[]>`
    SELECT vehicle_id, seats, booked_seats FROM slot_vehicles WHERE slot_id = ${slotId}
    ORDER BY (seats - booked_seats) ASC, vehicle_id FOR UPDATE`;
  if (vehicles.length > 0) {
    const fit = vehicles.find((v) => v.seats - v.booked_seats >= pax);
    if (!fit) {
      const biggest = Math.max(...vehicles.map((v) => v.seats - v.booked_seats));
      throw new BookingError(
        'NO_VEHICLE_FIT',
        `There are ${plural(left, 'seat')} left, but no single vehicle has room for ${pax} together (the most in one vehicle is ${biggest}). Book a smaller group or pick another departure.`,
        biggest,
      );
    }
    vehicleId = fit.vehicle_id;
  }

  return { vehicleId };
}

/** True when a database error is one of the seat/fleet guards (CHECK, overlap or departure rules). */
export function isSeatRuleViolation(error: unknown): boolean {
  const e = error as { code?: string; meta?: { code?: string }; message?: string };
  const pg = e?.meta?.code ?? '';
  return ['23514', '23P01', '23502'].includes(pg) || /seats_check|VEHICLE_OVERLAP|scheduled departure/.test(e?.message ?? '');
}

export interface SlotAvailability {
  slotId: string;
  startDate: string; // YYYY-MM-DD
  departureTime: string; // HH:MM
  route: string | null;
  maxTravelers: number;
  bookedTravelers: number;
  spotsLeft: number;
  /** Largest group that can still book together (one vehicle), or spotsLeft without a fleet */
  maxGroup: number;
  isFull: boolean;
  status: 'OPEN' | 'CLOSED';
  note: string | null;
  vehicles: { vehicleId: string; name: string; vehicleType: string; seats: number; bookedSeats: number; plateNumber?: string | null }[];
  updatedAt: string;
}

/** Departures of a tour with live seat counts. Public callers get upcoming departures only. */
export async function getTourAvailability(tourId: string, opts: { includePast?: boolean; includePlates?: boolean } = {}): Promise<SlotAvailability[]> {
  const slots = await prisma.tourSlot.findMany({
    where: { tourId, ...(opts.includePast ? {} : { startDate: { gte: todayUtc() } }) },
    orderBy: [{ startDate: 'asc' }, { departureTime: 'asc' }],
    include: { vehicles: { include: { vehicle: true }, orderBy: { vehicle: { name: 'asc' } } } },
  });
  return slots.map((s) => {
    const spotsLeft = Math.max(0, s.maxTravelers - s.bookedSeats);
    const vehicles = s.vehicles.map((v) => ({
      vehicleId: v.vehicleId,
      name: v.vehicle.name,
      vehicleType: v.vehicle.vehicleType,
      seats: v.seats,
      bookedSeats: v.bookedSeats,
      ...(opts.includePlates ? { plateNumber: v.vehicle.plateNumber } : {}),
    }));
    const maxGroup = vehicles.length ? Math.min(spotsLeft, Math.max(0, ...vehicles.map((v) => v.seats - v.bookedSeats))) : spotsLeft;
    return {
      slotId: s.id,
      startDate: s.startDate.toISOString().slice(0, 10),
      departureTime: s.departureTime,
      route: s.route,
      maxTravelers: s.maxTravelers,
      bookedTravelers: s.bookedSeats,
      spotsLeft,
      maxGroup,
      isFull: spotsLeft <= 0 || s.status !== 'OPEN',
      status: s.status,
      note: s.note,
      vehicles,
      updatedAt: s.updatedAt.toISOString(),
    };
  });
}
