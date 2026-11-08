import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { SAFARI_COUNTRIES } from '@/lib/countries';

// Navigation data for client components (Navbar, quote form): safari countries
// that have published tours, and the top-rated verified operators.
export async function GET() {
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

  return NextResponse.json({ countries: uniqueCountries, operators });
}
