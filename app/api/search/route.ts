import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim() || '';

    if (!q || q.length < 2) {
      return NextResponse.json({ destinations: [], tours: [], operators: [] });
    }

    const [destinations, tours, operators] = await Promise.all([
      prisma.destination.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { country: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 5,
        select: { id: true, name: true, slug: true, country: true, type: true },
      }),

      prisma.tour.findMany({
        where: {
          isPublished: true,
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { primaryCountry: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 5,
        select: { id: true, title: true, slug: true, durationDays: true, minPriceUsd: true, primaryCountry: true },
      }),

      prisma.operator.findMany({
        where: {
          OR: [
            { companyName: { contains: q, mode: 'insensitive' } },
            { countryOfOrigin: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 5,
        select: { id: true, companyName: true, slug: true, isVerified: true, averageRating: true, countryOfOrigin: true },
      }),
    ]);

    return NextResponse.json({ destinations, tours, operators });
  } catch (error: any) {
    console.error('Search API error:', error);
    return NextResponse.json({ destinations: [], tours: [], operators: [] }, { status: 500 });
  }
}
