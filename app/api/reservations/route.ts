import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { completeElapsedTrips } from '@/lib/trips';
import { BookingError, getTourAvailability, isSeatRuleViolation, reserveSeats, toUtcDay } from '@/lib/booking';
import { notifyChange } from '@/lib/live';

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
          ...(statusFilter && ['PENDING', 'APPROVED', 'DECLINED', 'CANCELLED', 'COMPLETED'].includes(statusFilter)
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
          slot: { select: { departureTime: true, route: true } },
          vehicle: { select: { name: true, vehicleType: true, plateNumber: true } },
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
        departureTime: r.slot?.departureTime ?? null,
        route: r.slot?.route ?? null,
        vehicle: r.vehicle,
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
        slot: { select: { departureTime: true, route: true } },
        vehicle: { select: { name: true, vehicleType: true } },
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
        departureTime: r.slot?.departureTime ?? null,
        route: r.slot?.route ?? null,
        vehicle: r.vehicle,
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

  let requestedTourId: string | undefined;
  try {
    const body = await req.json();
    const { tourId, startDate, adultsCount, childrenCount, specialRequests, slotId } = body;
    requestedTourId = tourId;

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

    const adults = Math.max(1, parseInt(adultsCount, 10) || 1);
    const children = Math.max(0, parseInt(childrenCount, 10) || 0);
    const estimatedTotal = tour.minPriceUsd * adults + tour.minPriceUsd * 0.5 * children;
    const totalPax = adults + children;
    if (totalPax > 60) {
      return NextResponse.json({ error: 'For groups larger than 60 travelers please contact the agency directly.' }, { status: 400 });
    }

    // Which departure is being booked? Tours with scheduled departures only accept those.
    let usedSlotId: string | null = null;
    const slotCount = await prisma.tourSlot.count({ where: { tourId: tour.id } });
    if (slotId) {
      const slot = await prisma.tourSlot.findFirst({ where: { id: slotId, tourId: tour.id }, select: { id: true } });
      if (!slot) {
        return NextResponse.json({ error: 'This departure is no longer available. Please pick another date.', status: 'no_slot' }, { status: 409 });
      }
      usedSlotId = slot.id;
    } else if (slotCount > 0) {
      const day = toUtcDay(startDate);
      const sameDay = day
        ? await prisma.tourSlot.findMany({ where: { tourId: tour.id, startDate: day }, select: { id: true } })
        : [];
      if (sameDay.length !== 1) {
        return NextResponse.json({
          error: sameDay.length === 0
            ? 'This tour runs on scheduled departures only. Choose one of the available departures.'
            : 'There are several departures on this date. Choose a departure time.',
          status: 'no_slot',
        }, { status: 409 });
      }
      usedSlotId = sameDay[0].id;
    }
    if (!usedSlotId) {
      // Seats are only sold on scheduled departures, so capacity is always enforced.
      return NextResponse.json({
        error: 'This tour has no scheduled departures yet. Request a quote and the operator will propose dates.',
        status: 'no_slot',
      }, { status: 409 });
    }

    const start = (await prisma.tourSlot.findUnique({ where: { id: usedSlotId }, select: { startDate: true } }))!.startDate;
    const startDay = start;

    // Take the seats and create the request in one transaction. reserveSeats locks the
    // departure row, so simultaneous requests for the last seats are handled one at a time.
    const reservation = await prisma.$transaction(async (tx) => {
      const { vehicleId } = await reserveSeats(tx, usedSlotId, totalPax);

      const created = await tx.reservation.create({
        data: {
          travelerId: session.userId,
          tourId: tour.id,
          operatorId: tour.operatorId,
          startDate: startDay,
          adultsCount: adults,
          childrenCount: children,
          specialRequests: specialRequests || null,
          estimatedTotalUsd: estimatedTotal,
          status: 'PENDING',
          slotId: usedSlotId,
          vehicleId,
        },
      });

      // Log the request in the shared thread so the agency sees it immediately
      await tx.reservationMessage.create({
        data: {
          reservationId: created.id,
          senderId: session.userId,
          body: `Reservation request: ${adults} adult${adults !== 1 ? 's' : ''}${children ? `, ${children} children` : ''} · ${startDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })} · ${tour.title}. Estimated total $${estimatedTotal.toFixed(2)}.${specialRequests ? ` Special requests: ${specialRequests}` : ''}`,
        },
      });

      return created;
    });

    notifyChange(`tour:${tour.id}`, `operator:${tour.operatorId}`, `user:${session.userId}`);

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
    if (error instanceof BookingError) {
      // Send the fresh availability back so the booking form can update without another request.
      const availability = requestedTourId ? await getTourAvailability(requestedTourId).catch(() => null) : null;
      return NextResponse.json({
        error: error.message,
        status: error.code === 'SLOT_FULL' ? 'fully_booked' : error.code === 'CAPACITY' || error.code === 'NO_VEHICLE_FIT' ? 'capacity_exceeded' : 'unavailable',
        code: error.code,
        spotsLeft: error.spotsLeft,
        availability,
      }, { status: 409 });
    }

    if (isSeatRuleViolation(error)) {
      // Last line of defence: the database refused to oversell.
      const availability = requestedTourId ? await getTourAvailability(requestedTourId).catch(() => null) : null;
      return NextResponse.json({ error: 'This departure is now fully booked. Please choose another departure.', status: 'fully_booked', code: 'SLOT_FULL', availability }, { status: 409 });
    }
    console.error('Create reservation error:', error);
    return NextResponse.json({ error: 'Failed to create reservation. Please try again.' }, { status: 500 });
  }
}
