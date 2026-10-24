import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { notifyChange } from '@/lib/live';
import { emitToReservation } from '@/lib/realtime';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  const { id } = await params;
  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id },
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
        tour: {
          select: {
            id: true,
            title: true,
            slug: true,
            durationDays: true,
            durationNights: true,
            minPriceUsd: true,
          },
        },
        operator: {
          select: {
            id: true,
            companyName: true,
            slug: true,
            countryOfOrigin: true,
            isVerified: true,
          },
        },
        slot: { include: { vehicles: { include: { vehicle: { select: { name: true, vehicleType: true } } } } } },
        vehicle: { select: { name: true, vehicleType: true, plateNumber: true } },
      },
    });

    if (!reservation) {
      return NextResponse.json({ error: 'Reservation not found.' }, { status: 404 });
    }

    const isTraveler = session.userId === reservation.travelerId;
    let operatorId = session.operatorId;
    if (!operatorId && (session.role === 'OPERATOR' || session.role === 'ADMIN')) {
      const op = await prisma.operator.findUnique({ where: { userId: session.userId } });
      operatorId = op?.id;
    }
    const isAgency = (session.role === 'OPERATOR' && operatorId === reservation.operatorId) || session.role === 'ADMIN';

    if (!isTraveler && !isAgency) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
    }

    return NextResponse.json({
      reservation: {
        id: reservation.id,
        reference: reservation.reference,
        startDate: reservation.startDate.toISOString(),
        adultsCount: reservation.adultsCount,
        childrenCount: reservation.childrenCount,
        specialRequests: reservation.specialRequests,
        estimatedTotalUsd: reservation.estimatedTotalUsd,
        status: reservation.status,
        operatorNote: reservation.operatorNote,
        slotId: reservation.slotId,
        slot: reservation.slot
          ? {
              id: reservation.slot.id,
              startDate: reservation.slot.startDate.toISOString(),
              departureTime: reservation.slot.departureTime,
              route: reservation.slot.route,
              status: reservation.slot.status,
              maxTravelers: reservation.slot.maxTravelers,
              bookedSeats: reservation.slot.bookedSeats,
              spotsLeft: Math.max(0, reservation.slot.maxTravelers - reservation.slot.bookedSeats),
            }
          : null,
        vehicle: reservation.vehicle
          ? { ...reservation.vehicle, plateNumber: isAgency ? reservation.vehicle.plateNumber : undefined }
          : null,
        updatedAt: reservation.updatedAt.toISOString(),
        decidedAt: reservation.decidedAt ? reservation.decidedAt.toISOString() : null,
        createdAt: reservation.createdAt.toISOString(),
        traveler: reservation.traveler,
        tour: reservation.tour,
        operator: reservation.operator,
      },
    });
  } catch (error: any) {
    console.error('Fetch reservation error:', error);
    return NextResponse.json({ error: 'Failed to fetch reservation.' }, { status: 500 });
  }
}

/**
 * Change a reservation's status.
 *   Agency (operator/admin): PENDING -> APPROVED | DECLINED
 *   Traveller:               PENDING | APPROVED -> CANCELLED (before departure)
 * Declining or cancelling gives the seats back to the departure in the same transaction.
 * The status change is a guarded update (WHERE status = expected), so two clicks or two
 * staff members acting at once cannot apply it twice.
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  const { id } = await params;
  try {
    const body = await req.json();
    const status: string = body.status;
    const note: string | undefined = typeof body.note === 'string' ? body.note.trim().slice(0, 2000) : undefined;

    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: { tour: { select: { title: true } } },
    });
    if (!reservation) return NextResponse.json({ error: 'Reservation not found.' }, { status: 404 });

    let operatorId = session.operatorId;
    if (!operatorId && session.role === 'OPERATOR') {
      operatorId = (await prisma.operator.findUnique({ where: { userId: session.userId } }))?.id;
    }
    const isAgency = session.role === 'ADMIN' || (session.role === 'OPERATOR' && operatorId === reservation.operatorId);
    const isTraveler = session.userId === reservation.travelerId;

    let from: ('PENDING' | 'APPROVED')[];
    if (status === 'APPROVED' || status === 'DECLINED') {
      if (!isAgency) return NextResponse.json({ error: 'Only the agency can approve or decline this request.' }, { status: 403 });
      from = ['PENDING'];
    } else if (status === 'COMPLETED') {
      if (!isTraveler && !isAgency) return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
      from = ['APPROVED'];
    } else if (status === 'CANCELLED') {
      if (!isTraveler && !isAgency) return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
      const today = new Date();
      if (reservation.startDate.getTime() < Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())) {
        return NextResponse.json({ error: 'This trip has already started and can no longer be cancelled online.' }, { status: 409 });
      }
      from = ['PENDING', 'APPROVED'];
    } else {
      return NextResponse.json({ error: 'Status must be APPROVED, DECLINED, COMPLETED or CANCELLED.' }, { status: 400 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      // Automatic or manual vehicle assignment for APPROVED reservations
      let assignedVehicleId = reservation.vehicleId;
      if (status === 'APPROVED') {
        if (body.vehicleId && isAgency) {
          assignedVehicleId = String(body.vehicleId);
        } else if (!assignedVehicleId) {
          const totalPax = reservation.adultsCount + reservation.childrenCount;
          // Automatically pick an available active vehicle from the operator's fleet fitting the group
          const fitVehicle = await tx.vehicle.findFirst({
            where: {
              operatorId: reservation.operatorId,
              isActive: true,
              seats: { gte: totalPax },
            },
            orderBy: { seats: 'asc' },
          }) || await tx.vehicle.findFirst({
            where: {
              operatorId: reservation.operatorId,
              isActive: true,
            },
            orderBy: { seats: 'desc' },
          });

          if (fitVehicle) {
            assignedVehicleId = fitVehicle.id;
          }
        }
      }

      const res = await tx.reservation.updateMany({
        where: { id, status: { in: from } },
        data: {
          status: status as 'APPROVED' | 'DECLINED' | 'CANCELLED' | 'COMPLETED',
          ...(status === 'COMPLETED' ? { completedAt: new Date() } : {}),
          ...(assignedVehicleId ? { vehicleId: assignedVehicleId } : {}),
          ...(isAgency && status !== 'CANCELLED' && status !== 'COMPLETED' ? { operatorNote: note || null, decidedAt: new Date() } : {}),
        },
      });
      if (res.count !== 1) return null;

      // Declined/cancelled seats are returned by the reservations trigger in the database.

      const who = isAgency && !isTraveler ? 'Agency' : 'Traveller';
      const verb = status === 'APPROVED' ? 'approved' : status === 'DECLINED' ? 'declined' : status === 'COMPLETED' ? 'completed' : 'cancelled';
      await tx.reservationMessage.create({
        data: {
          reservationId: id,
          senderId: session.userId,
          body: `${who} ${verb} reservation ${reservation.reference.slice(-8).toUpperCase()} (${reservation.tour.title}).${note ? ` Note: ${note}` : ''}`,
        },
      });

      if (status === 'COMPLETED') {
        // Notifications for completion & review invitation
        await tx.notification.createMany({
          data: [
            {
              userId: reservation.travelerId,
              type: 'TRIP_COMPLETED',
              title: `Safari Concluded — ${reservation.tour.title}`,
              body: `Your safari trip (${reservation.reference.slice(-8).toUpperCase()}) is now marked as complete. Thank you for booking with us!`,
              link: '/my-trips',
            },
            {
              userId: reservation.travelerId,
              type: 'REVIEW_INVITE',
              title: 'Review your Safari Experience',
              body: `We hope your tour was exceptional! Please take a moment to rate and review your safari.`,
              link: '/my-trips',
            },
            {
              userId: (await tx.operator.findUniqueOrThrow({ where: { id: reservation.operatorId }, select: { userId: true } })).userId,
              type: 'TRIP_COMPLETED',
              title: `Trip Completed — ${reservation.tour.title}`,
              body: `Reservation ${reservation.reference.slice(-8).toUpperCase()} has concluded and is marked as completed.`,
              link: '/operator-portal',
            },
          ],
        });
      } else {
        await tx.notification.create({
          data: {
            userId: isAgency && !isTraveler ? reservation.travelerId : (await tx.operator.findUniqueOrThrow({ where: { id: reservation.operatorId }, select: { userId: true } })).userId,
            type: `RESERVATION_${status}`,
            title: `Reservation ${verb}`,
            body: `${reservation.tour.title}: reservation ${reservation.reference.slice(-8).toUpperCase()} was ${verb}.`,
            link: isAgency && !isTraveler ? '/my-trips' : `/operator-portal/reservations/${id}`,
          },
        });
      }
      return tx.reservation.findUnique({ where: { id }, include: { vehicle: true } });
    });

    if (!updated) {
      const current = await prisma.reservation.findUnique({ where: { id }, select: { status: true } });
      return NextResponse.json({
        error: `This reservation is already ${current?.status.toLowerCase() ?? 'changed'}. The page has been refreshed.`,
        currentStatus: current?.status,
      }, { status: 409 });
    }

    notifyChange(`tour:${reservation.tourId}`, `operator:${reservation.operatorId}`, `user:${reservation.travelerId}`);
    await emitToReservation(id, 'chat:status', { reservationId: id, status: updated.status });

    return NextResponse.json({
      success: true,
      reservation: {
        id: updated.id,
        reference: updated.reference,
        status: updated.status,
        operatorNote: updated.operatorNote,
        decidedAt: updated.decidedAt?.toISOString() ?? null,
      },
    });
  } catch (error: any) {
    console.error('Reservation status error:', error);
    return NextResponse.json({ error: 'Failed to update reservation.' }, { status: 500 });
  }
}
