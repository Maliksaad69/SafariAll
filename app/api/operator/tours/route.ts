import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { ComfortLevel, TourType } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const session = await getSession();

    if (!session || (session.role !== 'OPERATOR' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized. Operator authentication required.' }, { status: 401 });
    }

    let operatorId = session.operatorId;

    // Fallback: find operator by userId if not directly on session
    if (!operatorId) {
      const operatorRecord = await prisma.operator.findUnique({
        where: { userId: session.userId },
      });
      if (!operatorRecord) {
        return NextResponse.json({ error: 'No operator agency profile linked to this account.' }, { status: 404 });
      }
      operatorId = operatorRecord.id;
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
      itineraries,
    } = body;

    if (!title || !durationDays || !minPriceUsd || !primaryCountry) {
      return NextResponse.json(
        { error: 'Missing required tour fields (title, durationDays, minPriceUsd, primaryCountry).' },
        { status: 400 }
      );
    }

    // Generate unique slug
    const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    const tour = await prisma.tour.create({
      data: {
        operatorId,
        title,
        slug,
        durationDays: parseInt(durationDays, 10),
        durationNights: durationNights ? parseInt(durationNights, 10) : parseInt(durationDays, 10) - 1,
        minPriceUsd: parseFloat(minPriceUsd),
        maxPriceUsd: maxPriceUsd ? parseFloat(maxPriceUsd) : null,
        comfortLevel: (comfortLevel as ComfortLevel) || ComfortLevel.MID_RANGE,
        tourType: (tourType as TourType) || TourType.PRIVATE,
        primaryCountry,
        startLocation: startLocation || null,
        endLocation: endLocation || null,
        inclusions: Array.isArray(inclusions) ? inclusions : inclusions ? inclusions.split('\n').filter(Boolean) : [],
        exclusions: Array.isArray(exclusions) ? exclusions : exclusions ? exclusions.split('\n').filter(Boolean) : [],
        isPublished: true,
        itineraries: {
          create: Array.isArray(itineraries)
            ? itineraries.map((day: any, idx: number) => ({
                dayNumber: day.dayNumber || idx + 1,
                title: day.title || `Day ${idx + 1}`,
                description: day.description || '',
                accommodationName: day.accommodationName || null,
                mealsIncluded: day.mealsIncluded || 'Breakfast, Lunch, Dinner',
              }))
            : [],
        },
      },
      include: {
        itineraries: true,
      },
    });

    return NextResponse.json({ success: true, tour }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating operator tour:', error);
    return NextResponse.json({ error: error.message || 'Failed to create tour package.' }, { status: 500 });
  }
}
