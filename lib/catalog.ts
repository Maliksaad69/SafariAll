import type { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import type { SiteOperator, SiteTour } from '@/lib/site-data';
import { todayUtc } from '@/lib/booking';
import { CURATED_COUNTRIES_DATA } from '@/lib/countries';

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
  try {
    const rows = await prisma.tour.findMany({
      where: { isPublished: true, ...where },
      orderBy: [{ operator: { totalReviews: 'desc' } }, { createdAt: 'desc' }],
      include: tourCardInclude,
      take,
    });
    if (rows && rows.length > 0) {
      return rows.map(toTourCard);
    }
    return [];
  } catch (err) {
    console.warn('[catalog] Database query failed in getTourCards:', (err as Error)?.message);
    return [];
  }
}

const usd = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;

export async function getOperatorCards(): Promise<SiteOperator[]> {
  try {
    const rows = await prisma.operator.findMany({
      orderBy: [{ isVerified: 'desc' }, { totalReviews: 'desc' }],
      include: {
        tours: {
          where: { isPublished: true },
          orderBy: { minPriceUsd: 'desc' },
          select: { title: true, minPriceUsd: true, durationDays: true, primaryCountry: true, tourType: true },
        },
      },
    });
    if (rows && rows.length > 0) {
      return rows.map((op) => {
        const perDay = op.tours.map((t) => t.minPriceUsd / Math.max(t.durationDays, 1));

        // Format clean, human-readable Tour Types — NEVER output raw TALA JSON!
        let tourTypes = 'Tailor-Made Private & Group Safaris';
        const distinctTourTypes = Array.from(new Set(op.tours.map((t) => t.tourType).filter(Boolean)));

        if (distinctTourTypes.length > 0) {
          const typeNames: Record<string, string> = {
            PRIVATE: 'Private Safaris',
            SHARED_GROUP: 'Group Safaris',
            FLY_IN: 'Fly-in Safaris',
            SELF_DRIVE: 'Self-Drive Safaris',
          };
          tourTypes = distinctTourTypes.map((tt) => typeNames[tt] || tt).join(', ');
        } else if (
          op.serviceSummary &&
          !op.serviceSummary.trim().startsWith('{') &&
          !op.serviceSummary.includes('talaNumber') &&
          !op.serviceSummary.includes('documentUrl')
        ) {
          tourTypes = op.serviceSummary.trim();
        } else if (op.priceTier) {
          const tierNames: Record<string, string> = {
            CAMPING: 'Budget Camping & Overland Safaris',
            BUDGET: 'Budget Adventure Safaris',
            MID_RANGE: 'Mid-Range Lodge & Tented Safaris',
            LUXURY: 'Luxury Lodge & Fly-in Safaris',
            SUPER_LUXURY: 'VIP Bespoke & Private Reserve Safaris',
          };
          tourTypes = tierNames[op.priceTier] || 'Tailor-Made African Safaris';
        }

        // Destinations: collect all unique operating countries from countryOfOrigin, officesIn, and tour countries
        const rawDestinations = [
          op.countryOfOrigin,
          ...(Array.isArray(op.officesIn) ? op.officesIn : []),
          ...op.tours.map((t) => t.primaryCountry),
        ].filter((c): c is string => typeof c === 'string' && c.trim().length > 0);
        const destinations = Array.from(new Set(rawDestinations));

        const offices = Array.isArray(op.officesIn) && op.officesIn.length > 0
          ? op.officesIn
          : [op.countryOfOrigin].filter(Boolean);

        return {
          id: op.id,
          companyName: op.companyName,
          slug: op.slug,
          averageRating: op.averageRating,
          totalReviews: op.totalReviews,
          officesIn: offices.length ? offices : (destinations.length ? destinations : ['East Africa']),
          priceRange: perDay.length ? `${usd(Math.min(...perDay))} to ${usd(Math.max(...perDay))}` : 'Custom quotes available',
          tourTypes,
          destinations: destinations.length ? destinations : offices,
          isVerified: op.isVerified,
          image: op.bannerUrl ?? '',
          logo: op.logoUrl ?? '',
          toursCount: op.tours.length,
          topTours: op.tours.slice(0, 3).map((t) => ({ name: t.title, price: `${usd(t.minPriceUsd)} pp` })),
        };
      });
    }
    return [];
  } catch (err) {
    console.warn('[catalog] Database query failed in getOperatorCards:', (err as Error)?.message);
    return [];
  }
}

// Countries are destinations of type COUNTRY, ordered in alphabetical order.
export async function getCountries() {
  try {
    const [countries, parks, tourCounts] = await Promise.all([
      prisma.destination.findMany({ where: { type: 'COUNTRY' }, orderBy: { name: 'asc' } }),
      prisma.destination.findMany({ where: { type: { not: 'COUNTRY' } }, orderBy: { name: 'asc' }, select: { name: true, slug: true, country: true } }),
      prisma.tour.groupBy({ by: ['primaryCountry'], where: { isPublished: true }, _count: { _all: true } }),
    ]);

    if (countries && countries.length > 0) {
      const dbCountryNames = new Set(countries.map((c) => c.name.toLowerCase()));
      const mappedDb = countries.map((c) => {
        const countryParks = parks.filter((p) => p.country === c.name);
        return {
          ...c,
          parks: countryParks,
          toursCount: tourCounts.find((t) => t.primaryCountry === c.name)?._count._all ?? 0,
        };
      });

      // Merge any canonical countries not in DB so all 13 are always present
      const missingCurated = CURATED_COUNTRIES_DATA.filter(
        (cur) => !dbCountryNames.has(cur.name.toLowerCase())
      );

      return [...mappedDb, ...missingCurated].sort((a, b) => a.name.localeCompare(b.name));
    }

    return CURATED_COUNTRIES_DATA;
  } catch (err) {
    console.warn('[catalog] Database query failed in getCountries, using curated countries:', (err as Error)?.message);
    return CURATED_COUNTRIES_DATA;
  }
}

export async function getExperts() {
  try {
    const experts = await prisma.expert.findMany({ orderBy: { sortOrder: 'asc' } });
    if (experts && experts.length > 0) return experts;
    return [];
  } catch (err) {
    console.warn('[catalog] Database query failed in getExperts:', (err as Error)?.message);
    return [];
  }
}

export async function getLatestBlogPosts(take = 3) {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { createdAt: 'desc' },
      take,
      select: { title: true, slug: true, coverImageUrl: true },
    });
    if (posts && posts.length > 0) return posts;
    return [];
  } catch (err) {
    console.warn('[catalog] Database query failed in getLatestBlogPosts:', (err as Error)?.message);
    return [];
  }
}
