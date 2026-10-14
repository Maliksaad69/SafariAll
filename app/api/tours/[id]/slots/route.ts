import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

async function resolveOperatorId(session: any): Promise<string | null> {
  if (session.operatorId) return session.operatorId;
  const op = await prisma.operator.findUnique({ where: { userId: session.userId } });
  return op?.id ?? null;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const tour = await prisma.tour.findUnique({ where: { id } });
    if (!tour) {
      return NextResponse.json({ error: 'Tour not found.' }, { status: 404 });
    }

    const slots = await prisma.tourSlot.findMany({
      where: { tourId: id },
      orderBy: { startDate: 'asc' },
      include: {
        reservations: {
          where: { status: { in: ['PENDING', 'APPROVED'] } },
          select: { adultsCount: true, childrenCount: true },
        },
      },
    });

    const availability = slots.map((s) => {
      const bookedTravelers = s.reservations.reduce(
        (sum, r) => sum + r.adultsCount + (r.childrenCount || 0),
        0
      );
      const spotsLeft = Math.max(0, s.maxTravelers - bookedTravelers);
      return {
        slotId: s.id,
        startDate: s.startDate.toISOString(),
        maxTravelers: s.maxTravelers,
        bookedTravelers,
        spotsLeft,
        isFull: spotsLeft <= 0,
        note: s.note,
      };
    });

    return NextResponse.json({ availability });
  } catch (error: any) {
    console.error('Slots availability error:', error);
    return NextResponse.json({ error: 'Failed to load slots.' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || (session.role !== 'OPERATOR' && session.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Operator authentication required.' }, { status: 401 });
  }

  const { id } = await params;
  try {
    const tour = await prisma.tour.findUnique({ where: { id } });
    if (!tour) return NextResponse.json({ error: 'Tour not found.' }, { status: 404 });

    if (session.role === 'OPERATOR') {
      const operatorId = await resolveOperatorId(session);
      if (tour.operatorId !== operatorId) {
        return NextResponse.json({ error: 'This package belongs to another agency.' }, { status: 403 });
      }
    }

    const body = await req.json();
    const { startDate, maxTravelers, note } = body;

    if (!startDate || !maxTravelers || maxTravelers < 1) {
      return NextResponse.json({ error: 'A departure date and maximum travelers are required.' }, { status: 400 });
    }

    const start = new Date(startDate);
    if (Number.isNaN(start.getTime())) {
      return NextResponse.json({ error: 'Invalid start date.' }, { status: 400 });
    }

    const slot = await prisma.tourSlot.upsert({
      where: { tourId_startDate: { tourId: id, startDate: start } },
      update: { maxTravelers: maxTravelers, note: note || null },
      create: { tourId: id, startDate: start, maxTravelers, note: note || null },
    });

    return NextResponse.json({ success: true, slot }, { status: 201 });
  } catch (error: any) {
    console.error('Create slot error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create slot.' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || (session.role !== 'OPERATOR' && session.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Operator authentication required.' }, { status: 401 });
  }

  const { id } = await params;
  try {
    const { slotId } = await req.json();
    if (!slotId) {
      return NextResponse.json({ error: 'slotId is required.' }, { status: 400 });
    }

    const slot = await prisma.tourSlot.findUnique({
      where: { id: slotId },
      include: { tour: { select: { operatorId: true } } },
    });
    if (!slot) return NextResponse.json({ error: 'Slot not found.' }, { status: 404 });

    if (session.role === 'OPERATOR') {
      const operatorId = await resolveOperatorId(session);
      if (slot.tour.operatorId !== operatorId) {
        return NextResponse.json({ error: 'This departure belongs to another agency.' }, { status: 403 });
      }
    }

    const active = await prisma.reservation.count({
      where: { slotId, status: { in: ['PENDING', 'APPROVED'] } },
    });
    if (active > 0) {
      return NextResponse.json({ error: 'This departure has active bookings. Decide on those reservations first.' }, { status: 409 });
    }

    await prisma.tourSlot.delete({ where: { id: slotId } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete slot error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete slot.' }, { status: 500 });
  }
}
