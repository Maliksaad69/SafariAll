import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  try {
    if (session.role === 'OPERATOR') {
      let operatorId = session.operatorId;
      if (!operatorId) {
        const op = await prisma.operator.findUnique({ where: { userId: session.userId } });
        operatorId = op?.id;
      }
      if (!operatorId) return NextResponse.json({ reservations: [] });

      const reservations = await prisma.reservation.findMany({
        where: { operatorId },
        orderBy: { createdAt: 'desc' },
        include: {
          traveler: { select: { firstName: true, lastName: true, email: true, phone: true, country: true } },
          tour: { select: { title: true, slug: true, durationDays: true } },
        },
      });
      return NextResponse.json({ reservations });
    }

    if (session.role === 'ADMIN') {
      const reservations = await prisma.reservation.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: {
          traveler: { select: { firstName: true, lastName: true, email: true } },
          tour: { select: { title: true, slug: true, durationDays: true } },
          operator: { select: { companyName: true, slug: true } },
        },
      });
      return NextResponse.json({ reservations });
    }

    // Traveler view: own reservations
    const reservations = await prisma.reservation.findMany({
      where: { travelerId: session.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        tour: { select: { title: true, slug: true, durationDays: true } },
        operator: { select: { companyName: true, slug: true } },
      },
    });
    return NextResponse.json({ reservations });
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
    const { tourId, startDate, adultsCount, childrenCount, specialRequests } = body;

    if (!tourId || !startDate || !adultsCount) {
      return NextResponse.json({ error: 'Tour, start date and number of adults are required.' }, { status: 400 });
    }

    const tour = await prisma.tour.findUnique({ where: { id: tourId } });
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

    const reservation = await prisma.reservation.create({
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
      },
    });

    return NextResponse.json({ success: true, reservation }, { status: 201 });
  } catch (error: any) {
    console.error('Create reservation error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create reservation.' }, { status: 500 });
  }
}
