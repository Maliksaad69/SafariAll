import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { completeElapsedTrips } from '@/lib/trips';

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'You must be signed in to view reservations.' }, { status: 401 });
  }

  // Lazily conclude any trips whose final day has passed, so status and
  // traveller/agency notifications are always current without a scheduler.
  await completeElapsedTrips().catch(() => {});

  try {
    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get('status');

    if (session.role === 'OPERATOR' || session.role === 'ADMIN') {
      // Agency (or admin) view: full traveler contact info so the agency can follow up directly
      let operatorId = session.operatorId;
      if (!operatorId) {
        const op = await prisma.operator.findUnique({ where: { userId: session.userId } });
        operatorId = op?.id;
      }
      if (!operatorId) {
        return NextResponse.json({ reservations: [], unreadBookings: 0 });
      }

      const reservations = await prisma.reservation.findMany({
        where: {
          operatorId,
          ...(statusFilter && ['PENDING', 'APPROVED', 'DECLINED', 'CANCELLED'].includes(statusFilter)
            ? { status: statusFilter as any }
            : {}),
        },
        orderBy: { createdAt: 'desc' },
        include: {
          traveler: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              country: true,
            },
          },
          tour: { select: { id: true, title: true, slug: true, durationDays: true } },
          messages: { select: { id: true, isRead: true, senderId: true } },
        },
      });

      // Unread booking alerts: new traveler requests whose first message is unread by the agency
      const travelerIds = new Set(reservations.filter((r) => r.travelerId).map((r) => r.travelerId));
      const unreadBookings = reservations.filter(
        (r) => r.messages.some((m) => !m.isRead && travelerIds.has(m.senderId))
      ).length;

      const serialized = reservations.map((r) => ({
        id: r.id,
        reference: r.reference,
        startDate: r.startDate.toISOString(),
        adultsCount: r.adultsCount,
        childrenCount: r.childrenCount,
        specialRequests: r.specialRequests,
        estimatedTotalUsd: r.estimatedTotalUsd,
        status: r.status,
        operatorNote: r.operatorNote,
        slotId: r.slotId,
        decidedAt: r.decidedAt ? r.decidedAt.toISOString() : null,
        createdAt: r.createdAt.toISOString(),
        traveler: {
          firstName: r.traveler.firstName,
          lastName: r.traveler.lastName,
          email: r.traveler.email,
          phone: r.traveler.phone,
          country: r.traveler.country,
        },
        tour: r.tour,
      }));

      return NextResponse.json({ reservations: serialized, unreadBookings });
    }

    // Traveler view: only their own reservations (contact info belongs to them)
    const reservations = await prisma.reservation.findMany({
      where: {
        travelerId: session.userId,
        ...(statusFilter && ['PENDING', 'APPROVED', 'DECLINED', 'CANCELLED', 'COMPLETED'].includes(statusFilter)
          ? { status: statusFilter as any }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        tour: { select: { id: true, title: true, slug: true, durationDays: true } },
        operator: {
          select: {
            id: true,
            companyName: true,
            slug: true,
            isVerified: true,
            headquartersAddress: true,
            user: { select: { email: true, phone: true } },
          },
        },
      },
    });

    const serialized = reservations.map((r) => {
      // Agency contact details are released to the traveller once the booking is
      // confirmed (APPROVED or COMPLETED) so they can reach their operator directly.
      const contactUnlocked = r.status === 'APPROVED' || r.status === 'COMPLETED';
      return {
        id: r.id,
        reference: r.reference,
        startDate: r.startDate.toISOString(),
        adultsCount: r.adultsCount,
        childrenCount: r.childrenCount,
        specialRequests: r.specialRequests,
        estimatedTotalUsd: r.estimatedTotalUsd,
        status: r.status,
        operatorNote: r.operatorNote,
        slotId: r.slotId,
        decidedAt: r.decidedAt ? r.decidedAt.toISOString() : null,
        completedAt: r.completedAt ? r.completedAt.toISOString() : null,
        createdAt: r.createdAt.toISOString(),
        tour: r.tour,
        operator: {
          id: r.operator.id,
          companyName: r.operator.companyName,
          slug: r.operator.slug,
          isVerified: r.operator.isVerified,
          contact: contactUnlocked
            ? { email: r.operator.user.email, phone: r.operator.user.phone, address: r.operator.headquartersAddress }
            : null,
        },
      };
    });

    return NextResponse.json({ reservations: serialized });
  } catch (error: any) {
    console.error('List reservations error:', error);
    return NextResponse.json({ error: 'Failed to load reservations.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'You must be signed in to request a reservation.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { tourId, startDate, adultsCount, childrenCount, specialRequests, slotId } = body;

    if (!tourId || !startDate || !adultsCount) {
      return NextResponse.json({ error: 'Tour, start date and number of adults are required.' }, { status: 400 });
    }

    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
      include: {
        operator: { select: { id: true, companyName: true, slug: true, isVerified: true } },
      },
    });
    if (!tour) {
      return NextResponse.json({ error: 'Tour not found.' }, { status: 404 });
    }

    const start = new Date(startDate);
    if (Number.isNaN(start.getTime())) {
      return NextResponse.json({ error: 'Invalid start date.' }, { status: 400 });
    }

    const adults = Math.max(1, parseInt(adultsCount, 10) || 1);
    const children = Math.max(0, parseInt(childrenCount, 10) || 0);
    const estimatedTotal = tour.minPriceUsd * adults + tour.minPriceUsd * 0.5 * children;
    const totalPax = adults + children;

    // Slot capacity enforcement
    let usedSlotId = slotId || null;
    let foundSlot = null;

    if (!usedSlotId) {
      // Check if tour uses fixed-date slots
      const slotCount = await prisma.tourSlot.count({ where: { tourId: tour.id } });

      if (slotCount > 0) {
        // Fixed-dates mode: find the specific slot for this date
        foundSlot = await prisma.tourSlot.findFirst({
          where: {
            tourId: tour.id,
            startDate: { gte: start, lt: new Date(start.getTime() + 86400000) },
          },
          include: {
            _count: { select: { reservations: { where: { status: { in: ['PENDING', 'APPROVED'] } } } } },
          },
        });

        if (foundSlot) {
          const booked = foundSlot._count.reservations;
          if (booked >= foundSlot.maxTravelers) {
            return NextResponse.json({
              error: `This departure is fully booked. ${booked} of ${foundSlot.maxTravelers} travelers already have this date and there are no other slots available for this tour. Try a different date or contact the agency directly.`,
              status: 'fully_booked',
            }, { status: 409 });
          }
          if (totalPax > foundSlot.maxTravelers - booked) {
            const have = foundSlot.maxTravelers - booked;
            return NextResponse.json({
              error: `Not enough capacity on this departure. There are only ${have} spot${have === 1 ? '' : 's'} left and you are requesting ${totalPax} travelers.`,
              status: 'capacity_exceeded',
            }, { status: 409 });
          }
          usedSlotId = foundSlot.id;
        } else {
          return NextResponse.json({
            error: `This tour departs on fixed dates only and there is no departure slot for ${startDate}. Choose one of the available departure dates.`,
            status: 'no_slot',
          }, { status: 409 });
        }
      }
    }

    if (!usedSlotId) {
      // Open-dated tour without fixed slots: accept any date but still enforce optional per-tour total capacity
      const availability = await prisma.tourAvailability.findUnique({ where: { tourId: tour.id } });
      if (availability && availability.totalCapacity) {
        const booked = await prisma.reservation.count({
          where: {
            tourId: tour.id,
            status: { in: ['PENDING', 'APPROVED'] },
            startDate: {
              gte: start,
              lt: new Date(start.getTime() + 86400000),
            },
          },
        });
        const spotsLeft = availability.totalCapacity - booked;
        if (spotsLeft < totalPax) {
          return NextResponse.json({
            error: `Not enough capacity on this date. There are only ${spotsLeft} spot${spotsLeft === 1 ? '' : 's'} left and you are requesting ${totalPax} travelers.`,
            status: 'capacity_exceeded',
          }, { status: 409 });
        }
      }
    }

    // Race-safe capacity + create: serialize against other concurrent bookings for the same slot/date.
    // Without this, 10 simultaneous requests could all pass the read-then-write check and overbook.
    let serializedSlot: { id: string; maxTravelers: number } | null = null;
    const reservation = await prisma.$transaction(async (tx) => {
      let slotForThisBooking: { id: string; maxTravelers: number } | null = null;

      if (usedSlotId) {
        // Re-read the slot INSIDE the transaction and lock it so concurrent bookings queue up.
        const slot = await tx.$queryRaw<{ id: string; max_travelers: number }[]>`
          SELECT id, max_travelers FROM "tour_slots" WHERE id = ${usedSlotId} FOR UPDATE
        `;
        if (slot.length === 0) {
          throw new Error('SLOT_GONE');
        }
        slotForThisBooking = { id: slot[0].id, maxTravelers: slot[0].max_travelers };

        const active = await tx.reservation.aggregate({
          where: { slotId: usedSlotId, status: { in: ['PENDING', 'APPROVED'] } },
          _sum: { adultsCount: true, childrenCount: true },
        });
        const bookedPax = (active._sum.adultsCount ?? 0) + (active._sum.childrenCount ?? 0);
        const spotsLeft = slotForThisBooking.maxTravelers - bookedPax;

        if (spotsLeft <= 0) {
          throw new Error('SLOT_FULL');
        }
        if (totalPax > spotsLeft) {
          throw new Error(`CAPACITY:${spotsLeft}`);
        }
      } else {
        // Open-dated tour: enforce optional per-tour total capacity for this date
        const availability = await tx.tourAvailability.findUnique({ where: { tourId: tour.id } });
        if (availability && availability.totalCapacity) {
          const agg = await tx.reservation.aggregate({
            where: {
              tourId: tour.id,
              status: { in: ['PENDING', 'APPROVED'] },
              startDate: { gte: start, lt: new Date(start.getTime() + 86400000) },
            },
            _sum: { adultsCount: true, childrenCount: true },
          });
          const bookedPax = (agg._sum.adultsCount ?? 0) + (agg._sum.childrenCount ?? 0);
          const spotsLeft = availability.totalCapacity - bookedPax;
          if (totalPax > spotsLeft) {
            throw new Error(`CAPACITY:${Math.max(0, spotsLeft)}`);
          }
        }
      }

      serializedSlot = slotForThisBooking;

      const created = await tx.reservation.create({
        data: {
          travelerId: session.userId,
          tourId: tour.id,
          operatorId: tour.operatorId,
          startDate: start,
          adultsCount: adults,
          childrenCount: children,
          specialRequests: specialRequests || null,
          estimatedTotalUsd: estimatedTotal,
          status: 'PENDING',
          slotId: usedSlotId,
        },
      });

      // Log the request in the shared thread so the agency sees it immediately
      try {
        await tx.reservationMessage.create({
          data: {
            reservationId: created.id,
            senderId: session.userId,
            body: `Reservation request: ${adults} adult${adults !== 1 ? 's' : ''}${children ? `, ${children} children` : ''} · ${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · ${tour.title}. Estimated total $${estimatedTotal.toFixed(2)}.${specialRequests ? ` Special requests: ${specialRequests}` : ''}`,
          },
        });
      } catch {
        // best-effort — booking itself must still succeed
      }

      return created;
    }, { isolationLevel: 'Serializable' });

    return NextResponse.json({
      success: true,
      reservation: {
        id: reservation.id,
        reference: reservation.reference,
        startDate: reservation.startDate.toISOString(),
        adultsCount: reservation.adultsCount,
        childrenCount: reservation.childrenCount,
        specialRequests: reservation.specialRequests,
        estimatedTotalUsd: reservation.estimatedTotalUsd,
        status: reservation.status,
        slotId: reservation.slotId,
        createdAt: reservation.createdAt.toISOString(),
        operatorName: tour.operator?.companyName ?? 'Unknown',
        operatorId: tour.operatorId,
        slug: tour.slug,
        title: tour.title,
      },
      operatorNote: null,
    }, { status: 201 });
  } catch (error: any) {
    // Translate capacity signals from the transaction into traveler-friendly errors
    const msg: string = error?.message ?? '';
    if (msg === 'SLOT_FULL') {
      return NextResponse.json({
        error: 'This departure is now fully booked — every seat on this date is taken. Please choose a different date or a similar package.',
        status: 'fully_booked',
      }, { status: 409 });
    }
    if (msg.startsWith('CAPACITY:')) {
      const have = parseInt(msg.slice('CAPACITY:'.length), 10);
      return NextResponse.json({
        error: `Not enough capacity left. Only ${have} spot${have === 1 ? '' : 's'} remain${have === 1 ? 's' : ''} for this date. Reduce the group size or pick another date.`,
        status: 'capacity_exceeded',
      }, { status: 409 });
    }
    if (msg === 'SLOT_GONE') {
      return NextResponse.json({ error: 'This departure is no longer available. Please pick another date.' }, { status: 409 });
    }

    console.error('Create reservation error:', error);
    return NextResponse.json({ error: 'Failed to create reservation. Please try again.' }, { status: 500 });
  }
}
