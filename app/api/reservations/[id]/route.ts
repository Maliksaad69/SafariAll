import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

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
        slot: true,
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
        slot: reservation.slot,
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

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || (session.role !== 'OPERATOR' && session.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Operator authentication required.' }, { status: 401 });
  }

  const { id } = await params;
  try {
    const body = await req.json();
    const { status, note } = body;

    if (!['APPROVED', 'DECLINED'].includes(status)) {
      return NextResponse.json({ error: 'Status must be APPROVED or DECLINED.' }, { status: 400 });
    }

    const where: any = { id };
    if (session.role === 'OPERATOR') {
      let operatorId = session.operatorId;
      if (!operatorId) {
        const op = await prisma.operator.findUnique({ where: { userId: session.userId } });
        operatorId = op?.id;
      }
      where.operatorId = operatorId;
    }

    const reservation = await prisma.reservation.findFirst({ where });

    if (!reservation) {
      return NextResponse.json({ error: 'Reservation not found.' }, { status: 404 });
    }

    if (reservation.status !== 'PENDING') {
      return NextResponse.json({ error: `Reservation has already been ${reservation.status.toLowerCase()}.` }, { status: 409 });
    }

    // If approving, ensure the slot still has room (safety net for race condition)
    if (status === 'APPROVED' && reservation.slotId) {
      const slot = await prisma.tourSlot.findUnique({
        where: { id: reservation.slotId },
      });
      if (slot) {
        const active = await prisma.reservation.aggregate({
          where: {
            slotId: reservation.slotId,
            id: { not: reservation.id },
            status: { in: ['PENDING', 'APPROVED'] },
          },
          _sum: { adultsCount: true, childrenCount: true },
        });
        const otherBooked = (active._sum.adultsCount ?? 0) + (active._sum.childrenCount ?? 0);
        const thisPax = reservation.adultsCount + reservation.childrenCount;
        if (otherBooked + thisPax > slot.maxTravelers) {
          const spotsLeft = Math.max(0, slot.maxTravelers - otherBooked);
          return NextResponse.json({
            error: `This departure has only ${spotsLeft} spot${spotsLeft === 1 ? '' : 's'} remaining, which cannot accommodate this group of ${thisPax}.`,
          }, { status: 409 });
        }
      }
    }

    const updated = await prisma.reservation.update({
      where: { id: reservation.id },
      data: {
        status,
        operatorNote: note || null,
        decidedAt: new Date(),
      },
    });

    // Confirm message in the thread
    try {
      await prisma.reservationMessage.create({
        data: {
          reservationId: id,
          senderId: session.userId,
          body: `Agency: ${status === 'APPROVED' ? 'approved' : 'declined'} your reservation ${reservation.reference}. ${note ? `Note: ${note}` : 'No further details.'}`,
        },
      });
    } catch {
      // best-effort
    }

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
    console.error('Reservation decision error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update reservation.' }, { status: 500 });
  }
}
