import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { notifyChange } from '@/lib/live';

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function getOperatorContext() {
  const session = await getSession();
  if (!session || (session.role !== 'OPERATOR' && session.role !== 'ADMIN')) {
    return { error: 'Operator authentication required.', status: 401 };
  }

  let operatorId = session.operatorId;
  if (!operatorId) {
    const op = await prisma.operator.findUnique({ where: { userId: session.userId } });
    operatorId = op?.id;
  }

  if (!operatorId && session.role !== 'ADMIN') {
    return { error: 'No agency profile linked to this account.', status: 404 };
  }

  return { session, operatorId, isAdmin: session.role === 'ADMIN' };
}

/**
 * GET /api/operator/tours/[id]
 * Fetch a single tour package with all details for the operator to view/edit.
 */
export async function GET(_req: Request, { params }: RouteContext) {
  const ctx = await getOperatorContext();
  if ('error' in ctx) {
    return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  }

  const { id } = await params;

  try {
    const tour = await prisma.tour.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
        ...(ctx.isAdmin ? {} : { operatorId: ctx.operatorId }),
      },
      include: {
        itineraries: { orderBy: { dayNumber: 'asc' } },
        destinations: { include: { destination: { select: { id: true, name: true, slug: true, country: true } } } },
        media: { select: { id: true, filename: true, mimeType: true, sizeBytes: true, isCover: true, sortOrder: true } },
        _count: { select: { reservations: true, slots: true } },
      },
    });

    if (!tour) {
      return NextResponse.json({ error: 'Tour package not found.' }, { status: 404 });
    }

    return NextResponse.json({ tour });
  } catch (error: any) {
    console.error('Get operator tour error:', error);
    return NextResponse.json({ error: 'Failed to load tour package.' }, { status: 500 });
  }
}

/**
 * PATCH /api/operator/tours/[id]
 * Update a tour package and its itineraries.
 */
export async function PATCH(req: Request, { params }: RouteContext) {
  const ctx = await getOperatorContext();
  if ('error' in ctx) {
    return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  }

  const { id } = await params;

  try {
    const existingTour = await prisma.tour.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
        ...(ctx.isAdmin ? {} : { operatorId: ctx.operatorId }),
      },
    });

    if (!existingTour) {
      return NextResponse.json({ error: 'Tour package not found.' }, { status: 404 });
    }

    const body = await req.json();
    const {
      title,
      durationDays,
      durationNights,
      minPriceUsd,
      maxPriceUsd,
      comfortLevel,
      tourType,
      primaryCountry,
      startLocation,
      endLocation,
      inclusions,
      exclusions,
      isPublished,
      itineraries,
    } = body;

    const tourId = existingTour.id;

    const updated = await prisma.$transaction(async (tx) => {
      // 1. Update basic tour attributes
      const tour = await tx.tour.update({
        where: { id: tourId },
        data: {
          ...(title !== undefined ? { title: String(title).trim() } : {}),
          ...(durationDays !== undefined ? { durationDays: Math.max(1, parseInt(durationDays, 10) || 1) } : {}),
          ...(durationNights !== undefined
            ? { durationNights: Math.max(0, parseInt(durationNights, 10) || 0) }
            : durationDays !== undefined
            ? { durationNights: Math.max(0, parseInt(durationDays, 10) - 1) }
            : {}),
          ...(minPriceUsd !== undefined ? { minPriceUsd: Math.max(0, parseFloat(minPriceUsd) || 0) } : {}),
          ...(maxPriceUsd !== undefined ? { maxPriceUsd: maxPriceUsd ? Math.max(0, parseFloat(maxPriceUsd) || 0) : null } : {}),
          ...(comfortLevel !== undefined ? { comfortLevel } : {}),
          ...(tourType !== undefined ? { tourType } : {}),
          ...(primaryCountry !== undefined ? { primaryCountry: String(primaryCountry).trim() } : {}),
          ...(startLocation !== undefined ? { startLocation: startLocation ? String(startLocation).trim() : null } : {}),
          ...(endLocation !== undefined ? { endLocation: endLocation ? String(endLocation).trim() : null } : {}),
          ...(inclusions !== undefined
            ? { inclusions: Array.isArray(inclusions) ? inclusions : inclusions ? String(inclusions).split('\n').map(s => s.trim()).filter(Boolean) : [] }
            : {}),
          ...(exclusions !== undefined
            ? { exclusions: Array.isArray(exclusions) ? exclusions : exclusions ? String(exclusions).split('\n').map(s => s.trim()).filter(Boolean) : [] }
            : {}),
          ...(typeof isPublished === 'boolean' ? { isPublished } : {}),
        },
      });

      // 2. Update itineraries if provided
      if (Array.isArray(itineraries)) {
        await tx.tourItinerary.deleteMany({ where: { tourId } });
        if (itineraries.length > 0) {
          await tx.tourItinerary.createMany({
            data: itineraries.map((day: any, idx: number) => ({
              tourId,
              dayNumber: day.dayNumber || idx + 1,
              title: day.title || `Day ${idx + 1}`,
              description: day.description || '',
              accommodationName: day.accommodationName || null,
              mealsIncluded: day.mealsIncluded || 'Breakfast, Lunch, Dinner',
            })),
          });
        }
      }

      return tx.tour.findUnique({
        where: { id: tourId },
        include: { itineraries: { orderBy: { dayNumber: 'asc' } } },
      });
    });

    notifyChange(`tour:${tourId}`, `operator:${existingTour.operatorId}`);

    return NextResponse.json({
      success: true,
      tour: updated,
    });
  } catch (error: any) {
    console.error('Update operator tour error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update tour package.' }, { status: 500 });
  }
}

/**
 * DELETE /api/operator/tours/[id]
 * Delete a tour package if it has no active (PENDING or APPROVED) reservations.
 */
export async function DELETE(_req: Request, { params }: RouteContext) {
  const ctx = await getOperatorContext();
  if ('error' in ctx) {
    return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  }

  const { id } = await params;

  try {
    const existingTour = await prisma.tour.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
        ...(ctx.isAdmin ? {} : { operatorId: ctx.operatorId }),
      },
      include: {
        _count: {
          select: {
            reservations: {
              where: { status: { in: ['PENDING', 'APPROVED'] } },
            },
          },
        },
      },
    });

    if (!existingTour) {
      return NextResponse.json({ error: 'Tour package not found.' }, { status: 404 });
    }

    if (existingTour._count.reservations > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete "${existingTour.title}" because it has ${existingTour._count.reservations} active or upcoming reservation(s). You can toggle it to "Draft" to hide it from new bookings instead.`,
        },
        { status: 409 }
      );
    }

    const tourId = existingTour.id;

    // Delete the tour package (itineraries, destinations, media, availability cascade delete via Prisma schema)
    await prisma.tour.delete({
      where: { id: tourId },
    });

    notifyChange(`tour:${tourId}`, `operator:${existingTour.operatorId}`);

    return NextResponse.json({
      success: true,
      message: `Tour package "${existingTour.title}" was successfully deleted.`,
    });
  } catch (error: any) {
    console.error('Delete operator tour error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete tour package.' }, { status: 500 });
  }
}
