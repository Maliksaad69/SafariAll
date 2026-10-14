import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || (session.role !== 'OPERATOR' && session.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Operator authentication required.' }, { status: 401 });
  }

  try {
    let operatorId = session.operatorId;
    if (!operatorId) {
      const op = await prisma.operator.findUnique({ where: { userId: session.userId } });
      operatorId = op?.id;
    }
    if (!operatorId) {
      return NextResponse.json({ error: 'No agency profile linked to this account.' }, { status: 404 });
    }

    const body = await req.json();
    const { title, durationDays, durationNights, minPriceUsd, maxPriceUsd, comfortLevel, tourType, primaryCountry, startLocation, endLocation, inclusions, exclusions, itineraries, slots } = body;

    if (!title || !durationDays || !minPriceUsd || !primaryCountry) {
      return NextResponse.json({ error: 'Title, duration, minimum price and country are required.' }, { status: 400 });
    }

    const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 80);
    let slug = baseSlug;
    let n = 1;
    while (await prisma.tour.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${++n}`;
    }

    const tour = await prisma.tour.create({
      data: {
        operatorId,
        title,
        slug,
        durationDays: parseInt(durationDays, 10) || 1,
        durationNights: durationNights ? parseInt(durationNights, 10) : parseInt(durationDays, 10) - 1,
        minPriceUsd: parseFloat(minPriceUsd) || 0,
        maxPriceUsd: maxPriceUsd ? parseFloat(maxPriceUsd) : null,
        comfortLevel: (comfortLevel as any) || 'MID_RANGE',
        tourType: (tourType as any) || 'PRIVATE',
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
      include: { itineraries: true },
    });

    return NextResponse.json({ success: true, tour }, { status: 201 });
  } catch (error: any) {
    console.error('Create tour error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create tour package.' }, { status: 500 });
  }
}

export async function GET() {
  const session = await getSession();
  if (!session || (session.role !== 'OPERATOR' && session.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Operator authentication required.' }, { status: 401 });
  }

  try {
    let operatorId = session.operatorId;
    if (!operatorId) {
      const op = await prisma.operator.findUnique({ where: { userId: session.userId } });
      operatorId = op?.id;
    }
    if (!operatorId) {
      return NextResponse.json({ tours: [] });
    }

    const tours = await prisma.tour.findMany({
      where: { operatorId },
      orderBy: { createdAt: 'desc' },
      include: { itineraries: { orderBy: { dayNumber: 'asc' } } },
    });
    return NextResponse.json({ tours });
  } catch (error: any) {
    console.error('List tours error:', error);
    return NextResponse.json({ error: 'Failed to load tours.' }, { status: 500 });
  }
}
