import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { SAFARI_COUNTRIES } from '@/lib/countries';
import { withMemoryCache } from '@/lib/cache';

export const dynamic = 'force-dynamic';

// Navigation data for client components (Navbar, quote form): safari countries
// that have published tours, and the top-rated verified operators.
export async function GET() {
  try {
    const data = await withMemoryCache('site_nav_data', 300, async () => {
      try {
        const [dbTours, operators] = await Promise.all([
          prisma.tour.findMany({
            where: { isPublished: true },
            distinct: ['primaryCountry'],
            select: { primaryCountry: true },
          }),
          prisma.operator.findMany({
            where: { isVerified: true },
            orderBy: [{ totalReviews: 'desc' }],
            take: 5,
            select: { companyName: true, slug: true },
          }),
        ]);

        const uniqueCountries = Array.from(
          new Set([
            ...SAFARI_COUNTRIES,
            ...dbTours.map((t) => t.primaryCountry).filter(Boolean),
          ])
        ).sort((a, b) => a.localeCompare(b));

        return { countries: uniqueCountries, operators };
      } catch (err) {
        console.warn('[nav API] Database query failed:', (err as Error)?.message);
        return {
          countries: [...SAFARI_COUNTRIES].sort((a, b) => a.localeCompare(b)),
          operators: [],
        };
      }
    });

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (err) {
    return NextResponse.json({
      countries: [...SAFARI_COUNTRIES].sort((a, b) => a.localeCompare(b)),
      operators: [],
    });
  }
}
