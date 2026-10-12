import prisma from '@/lib/prisma';

export interface SlotAvailability {
  slotId: string;
  startDate: string;
  maxTravelers: number;
  bookedTravelers: number;
  spotsLeft: number;
  isFull: boolean;
  note: string | null;
}

const ACTIVE_STATUSES = ['PENDING', 'APPROVED'] as const;

/** Count active (pending + approved) travelers for a slot */
export async function bookedTravelersForSlot(slotId: string): Promise<number> {
  const agg = await prisma.reservation.aggregate({
    where: { slotId, status: { in: [...ACTIVE_STATUSES] } },
    _sum: { adultsCount: true, childrenCount: true },
  });
  return (agg._sum.adultsCount ?? 0) + (agg._sum.childrenCount ?? 0);
}

/** Availability for every open slot of a tour (upcoming, sorted by date) */
export async function getTourAvailability(tourId: string): Promise<SlotAvailability[]> {
  const slots = await prisma.tourSlot.findMany({
    where: { tourId, startDate: { gte: new Date() } },
    orderBy: { startDate: 'asc' },
  });

  return Promise.all(
    slots.map(async (slot) => {
      const booked = await bookedTravelersForSlot(slot.id);
      const spotsLeft = Math.max(0, slot.maxTravelers - booked);
      return {
        slotId: slot.id,
        startDate: slot.startDate.toISOString(),
        maxTravelers: slot.maxTravelers,
        bookedTravelers: booked,
        spotsLeft,
        isFull: spotsLeft === 0,
        note: slot.note,
      };
    })
  );
}

/**
 * Resolve capacity for a booking attempt.
 * Returns the slotId to attach, or an error string when the requested date cannot
 * accommodate the requested group size.
 */
export async function resolveSlotForBooking(
  tourId: string,
  startDate: Date,
  requestedPax: number
): Promise<{ slotId: string | null; error: string | null }> {
  // Find a slot matching this exact tour + start date
  const slot = await prisma.tourSlot.findFirst({
    where: {
      tourId,
      startDate: {
        gte: new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()),
        lt: new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 1),
      },
    },
  });

  if (!slot) {
    // No fixed slot for this date. If the tour runs at least one slot, it is slots-only.
    const anySlot = await prisma.tourSlot.findFirst({ where: { tourId } });
    if (anySlot) {
      return {
        slotId: null,
        error: 'This tour departs on fixed dates only. Please choose one of the available departure dates.',
      };
    }
    // Open-dated tour: no capacity management configured.
    return { slotId: null, error: null };
  }

  const booked = await bookedTravelersForSlot(slot.id);
  const spotsLeft = slot.maxTravelers - booked;

  if (requestedPax > spotsLeft) {
    return {
      slotId: slot.id,
      error:
        spotsLeft <= 0
          ? 'This departure is fully booked. Please choose another date.'
          : `Only ${spotsLeft} spot${spotsLeft === 1 ? '' : 's'} left on this departure — your group of ${requestedPax} exceeds capacity.`,
    };
  }

  return { slotId: slot.id, error: null };
}
