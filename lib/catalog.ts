import type { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import type { SiteOperator, SiteTour } from '@/lib/site-data';
import { todayUtc } from '@/lib/booking';

// Read helpers that shape Postgres rows into the card props the UI components use.

export const tourCardInclude = {
  operator: { select: { companyName: true, slug: true, isVerified: true, averageRating: true, totalReviews: true } },
  destinations: { include: { destination: { select: { name: true } } } },
  slots: {
    orderBy: [{ startDate: 'asc' }, { departureTime: 'asc' }],
    select: { startDate: true, maxTravelers: true, bookedSeats: true, status: true },
  },
} satisfies Prisma.TourInclude;

type TourCardRow = Prisma.TourGetPayload<{ include: typeof tourCardInclude }>;

export function toTourCard(t: TourCardRow): SiteTour {
  return {
    id: t.id,
    title: t.title,
    slug: t.slug,
    durationDays: t.durationDays,
    durationNights: t.durationNights,
    minPriceUsd: t.minPriceUsd,
    comfortLevel: t.comfortLevel,
    tourType: t.tourType,
    primaryCountry: t.primaryCountry,
    startLocation: t.startLocation ?? '',
    inclusions: t.inclusions,
    operator: { ...t.operator },
    destinations: t.destinations.map((d) => ({ destination: { name: d.destination.name } })),
    departures: (() => {
      const today = todayUtc();
      const upcoming = t.slots.filter((s) => s.startDate >= today);
      const open = upcoming.filter((s) => s.status === 'OPEN' && s.bookedSeats < s.maxTravelers);
      return {
        total: upcoming.length,
        open: open.length,
        nextOpen: open[0]?.startDate.toISOString().slice(0, 10) ?? null,
        seatsLeft: open.reduce((n, s) => n + s.maxTravelers - s.bookedSeats, 0),
      };
    })(),
  };
}

export async function getTourCards(where: Prisma.TourWhereInput = {}, take?: number): Promise<SiteTour[]> {
  const rows = await prisma.tour.findMany({
    where: { isPublished: true, ...where },
    orderBy: [{ operator: { totalReviews: 'desc' } }, { createdAt: 'desc' }],
    include: tourCardInclude,
    take,
  });
  return rows.map(toTourCard);
}

const usd = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;

export async function getOperatorCards(): Promise<SiteOperator[]> {
  const rows = await prisma.operator.findMany({
    orderBy: [{ isVerified: 'desc' }, { totalReviews: 'desc' }],
    include: {
      tours: {
        where: { isPublished: true },
        orderBy: { minPriceUsd: 'desc' },
        select: { title: true, minPriceUsd: true, durationDays: true, primaryCountry: true },
      },
    },
  });
  return rows.map((op) => {
    const perDay = op.tours.map((t) => t.minPriceUsd / Math.max(t.durationDays, 1));
    const destinations = Array.from(new Set([op.countryOfOrigin, ...op.tours.map((t) => t.primaryCountry)]));
    return {
      id: op.id,
      companyName: op.companyName,
      slug: op.slug,
      averageRating: op.averageRating,
      totalReviews: op.totalReviews,
      officesIn: op.officesIn.length ? op.officesIn : [op.countryOfOrigin],
      priceRange: perDay.length ? `${usd(Math.min(...perDay))} to ${usd(Math.max(...perDay))}` : 'On request',
      tourTypes: op.serviceSummary ?? 'Private and group safaris',
      destinations,
      isVerified: op.isVerified,
      image: op.bannerUrl ?? '',
      logo: op.logoUrl ?? '',
      toursCount: op.tours.length,
      topTours: op.tours.slice(0, 3).map((t) => ({ name: t.title, price: `${usd(t.minPriceUsd)} pp` })),
    };
  });
}

// Countries are destinations of type COUNTRY, ranked by popularityRank.
export async function getCountries() {
  const [countries, parks, tourCounts] = await Promise.all([
    prisma.destination.findMany({ where: { type: 'COUNTRY' }, orderBy: [{ popularityRank: 'asc' }, { name: 'asc' }] }),
    prisma.destination.findMany({ where: { type: { not: 'COUNTRY' } }, orderBy: { name: 'asc' }, select: { name: true, slug: true, country: true } }),
    prisma.tour.groupBy({ by: ['primaryCountry'], where: { isPublished: true }, _count: { _all: true } }),
  ]);
  return countries.map((c) => {
    const countryParks = parks.filter((p) => p.country === c.name);
    return {
      ...c,
      parks: countryParks,
      toursCount: tourCounts.find((t) => t.primaryCountry === c.name)?._count._all ?? 0,
    };
  });
}

export async function getExperts() {
  return prisma.expert.findMany({ orderBy: { sortOrder: 'asc' } });
}

export async function getLatestBlogPosts(take = 3) {
  return prisma.blogPost.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { createdAt: 'desc' },
    take,
    select: { title: true, slug: true, coverImageUrl: true },
  });
}
