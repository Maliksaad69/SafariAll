import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q')?.trim() ?? '';
  const country = searchParams.get('country')?.trim() ?? '';
  const comfort = searchParams.get('comfort')?.toUpperCase() ?? '';
  const type = searchParams.get('type')?.toUpperCase() ?? '';
  const operatorId = searchParams.get('operatorId')?.trim() ?? '';

  try {
    const tourList = await prisma.tour.findMany({
      where: {
        isPublished: true,
        ...(country ? {
          OR: [
            { primaryCountry: { equals: country } },
            { destinations: { some: { destination: { country: { equals: country } } } } },
          ],
        } : {}),
        ...(comfort ? { comfortLevel: comfort as any } : {}),
        ...(type ? { tourType: type as any } : {}),
        ...(operatorId ? { operatorId } : {}),
        ...(query ? {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { primaryCountry: { contains: query, mode: 'insensitive' } },
            { startLocation: { contains: query, mode: 'insensitive' } },
            { endLocation: { contains: query, mode: 'insensitive' } },
          ],
        } : {}),
      },
      include: {
        operator: { select: { id: true, companyName: true, slug: true, isVerified: true, averageRating: true, totalReviews: true, logoUrl: true } },
        destinations: { include: { destination: { select: { name: true } } }, take: 4 },
        itineraries: { orderBy: { dayNumber: 'asc' }, take: 12 },
        _count: { select: { reservations: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({
      tours: tourList.map((t) => ({
        id: t.id,
        title: t.title,
        slug: t.slug,
        primaryCountry: t.primaryCountry,
        minPriceUsd: t.minPriceUsd,
        maxPriceUsd: t.maxPriceUsd,
        comfortLevel: t.comfortLevel,
        tourType: t.tourType,
        durationDays: t.durationDays,
        durationNights: t.durationNights,
        startLocation: t.startLocation,
        endLocation: t.endLocation,
        inclusions: t.inclusions,
        exclusions: t.exclusions,
        isPublished: t.isPublished,
        operatorId: t.operatorId,
        operatorName: t.operator.companyName,
        operatorSlug: t.operator.slug,
        operatorIsVerified: t.operator.isVerified,
        operatorRating: t.operator.averageRating,
        operatorReviews: t.operator.totalReviews,
        operatorLogo: t.operator.logoUrl,
        destinations: t.destinations.map((d) => ({ destination: d.destination })),
        itineraries: t.itineraries,
        _count: t._count,
      })),
    });
  } catch (error: any) {
    console.error('Tour search error:', error);
    return NextResponse.json({ tours: [] }, { status: 500 });
  }
}
