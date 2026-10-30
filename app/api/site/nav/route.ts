import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Navigation data for client components (Navbar, quote form): safari countries
// that have published tours, and the top-rated verified operators.
export async function GET() {
  const [countries, operators] = await Promise.all([
    prisma.tour.findMany({ where: { isPublished: true }, distinct: ['primaryCountry'], select: { primaryCountry: true }, orderBy: { primaryCountry: 'asc' } }),
    prisma.operator.findMany({
      where: { isVerified: true },
      orderBy: [{ totalReviews: 'desc' }],
      take: 5,
      select: { companyName: true, slug: true },
    }),
  ]);
  return NextResponse.json({ countries: countries.map((c) => c.primaryCountry), operators });
}
