import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { safariTours, safariOperators } from '@/lib/site-data';

// Fallback destinations mirrored from the public parks pages
const siteDestinations = [
  { id: 'dest-botswana', name: 'Chobe National Park', slug: 'chobe-national-park', country: 'Botswana', type: 'NATIONAL_PARK' },
  { id: 'dest-kenya-1', name: 'Amboseli National Park', slug: 'amboseli-national-park', country: 'Kenya', type: 'NATIONAL_PARK' },
  { id: 'dest-kenya-2', name: 'Lake Nakuru National Park', slug: 'lake-nakuru-national-park', country: 'Kenya', type: 'NATIONAL_PARK' },
  { id: 'dest-kenya-3', name: 'Masai Mara National Reserve', slug: 'masai-mara-national-reserve', country: 'Kenya', type: 'GAME_RESERVE' },
  { id: 'dest-sa-1', name: 'Kruger National Park', slug: 'kruger-national-park', country: 'South Africa', type: 'NATIONAL_PARK' },
  { id: 'dest-tz-1', name: 'Ngorongoro Crater', slug: 'ngorongoro-crater', country: 'Tanzania', type: 'NATIONAL_PARK' },
  { id: 'dest-tz-2', name: 'Serengeti National Park', slug: 'serengeti-national-park', country: 'Tanzania', type: 'NATIONAL_PARK' },
  { id: 'dest-tz-3', name: 'Tarangire National Park', slug: 'tarangire-national-park', country: 'Tanzania', type: 'NATIONAL_PARK' },
  { id: 'dest-ug-1', name: 'Bwindi Impenetrable National Park', slug: 'bwindi-impenetrable-national-park', country: 'Uganda', type: 'NATIONAL_PARK' },
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim().toLowerCase() || '';

    if (!q || q.length < 2) {
      return NextResponse.json({ destinations: [], tours: [], operators: [] });
    }

    const [dbDestinations, dbTours, dbOperators] = await Promise.all([
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

    // Merge with site-catalog entries (deduped by slug), ranked by match quality
    const siteTours = safariTours
      .filter((t) =>
        [t.title, t.primaryCountry, t.operator.companyName, ...t.destinations.map((d) => d.destination.name)]
          .some((v) => v?.toLowerCase().includes(q))
      )
      .map((t) => ({
        id: t.id,
        title: t.title,
        slug: t.slug,
        durationDays: t.durationDays,
        minPriceUsd: t.minPriceUsd,
        primaryCountry: t.primaryCountry,
      }));

    const siteOps = safariOperators
      .filter((op) =>
        [op.companyName, ...op.destinations, ...op.officesIn].some((v) => v?.toLowerCase().includes(q))
      )
      .map((op) => ({
        id: op.id,
        companyName: op.companyName,
        slug: op.slug,
        isVerified: op.isVerified,
        averageRating: op.averageRating,
        countryOfOrigin: op.officesIn[0] || 'Africa',
      }));

    const siteDests = siteDestinations.filter((d) =>
      [d.name, d.country].some((v) => v.toLowerCase().includes(q))
    );

    const dedupe = <T extends { slug: string }>(db: T[], site: T[]): T[] => {
      const seen = new Set(db.map((item) => item.slug));
      return [...db, ...site.filter((item) => !seen.has(item.slug))];
    };

    const startsWith = (v: { name?: string; title?: string; companyName?: string }) =>
      (v.name ?? v.title ?? v.companyName ?? '').toLowerCase().startsWith(q) ? -1 : 0;

    const destinations = dedupe(dbDestinations, siteDests)
      .sort((a, b) => startsWith(a) - startsWith(b))
      .slice(0, 5);
    const tours = dedupe(dbTours, siteTours)
      .sort((a, b) => startsWith(a) - startsWith(b))
      .slice(0, 5);
    const operators = dedupe(dbOperators, siteOps)
      .sort((a, b) => startsWith(a) - startsWith(b))
      .slice(0, 5);

    return NextResponse.json({ destinations, tours, operators });
  } catch (error: any) {
    console.error('Search API error:', error);
    return NextResponse.json({ destinations: [], tours: [], operators: [] }, { status: 500 });
  }
}
