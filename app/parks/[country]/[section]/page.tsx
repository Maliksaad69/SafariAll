import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { getTourCards } from '@/lib/catalog';
import { getCountrySeoData, CURATED_COUNTRIES_DATA } from '@/lib/countries';
import ParkDetailView from '@/components/ParkDetailView';

export const dynamic = 'force-dynamic';

interface CountrySectionPageProps {
  params: Promise<{
    country: string;
    section: string;
  }>;
}

export async function generateMetadata({ params }: CountrySectionPageProps): Promise<Metadata> {
  const { country } = await params;
  const seoData = getCountrySeoData(country);
  if (!seoData) {
    return {
      title: 'African National Parks & Safari Guide | SafariRequest',
    };
  }

  const countryData = CURATED_COUNTRIES_DATA.find((c) => c.slug === seoData.slug);

  return {
    title: `${seoData.seoTitle} | SafariRequest`,
    description:
      countryData?.description ||
      `Explore premier national parks, game reserves, wildlife concentrations, daily travel rates, and expert-guided safari tours across ${seoData.country}.`,
    keywords: seoData.keywords,
    openGraph: {
      title: `${seoData.seoTitle} | SafariRequest`,
      description:
        countryData?.description ||
        `Compare national parks, safari itineraries, and verified local tour operators across ${seoData.country}.`,
      images: countryData?.featuredImageUrl ? [{ url: countryData.featuredImageUrl }] : [],
    },
  };
}

export default async function CountryParksPage({ params }: CountrySectionPageProps) {
  const { country, section } = await params;
  const seoData = getCountrySeoData(country);
  if (!seoData) notFound();

  // Canonical redirect if URL segment doesn't match the recommended SEO subpath
  if (section !== seoData.seoSlug) {
    redirect(seoData.seoUrl);
  }

  let park: any = null;
  try {
    park = await prisma.destination.findUnique({
      where: { slug: seoData.slug },
      include: { sections: { orderBy: { sortOrder: 'asc' } } },
    });
  } catch (err) {
    console.warn(`[CountryParksPage] DB fetch failed for ${seoData.slug}:`, (err as Error)?.message);
  }

  // Fallback to curated data if DB is empty or destination record is missing
  if (!park) {
    const curated = CURATED_COUNTRIES_DATA.find((c) => c.slug === seoData.slug);
    if (curated) {
      park = {
        id: curated.id,
        name: curated.name,
        slug: curated.slug,
        country: curated.country,
        type: curated.type,
        description: curated.description,
        featuredImageUrl: curated.featuredImageUrl,
        bestTimeSummary: curated.bestTimeSummary,
        dailyRates: curated.dailyRates,
        highSeason: curated.highSeason,
        rating: curated.rating,
        reviewCount: curated.reviewCount,
        sections: [
          {
            key: 'overview',
            title: `Overview of ${curated.name} Safaris`,
            body: curated.description,
            bulletItems: [
              `Premier African wilderness destination with vast protected ecosystems.`,
              `Home to iconic wildlife including ${curated.name === 'Uganda' || curated.name === 'Rwanda' ? 'Mountain Gorillas' : 'the African Big 5'}.`,
              `Daily travel budgets ranging typically from ${curated.dailyRates || '$200 - $700 pp/day'}.`,
              `High season travel window: ${curated.highSeason || 'July to October'}.`,
            ],
          },
        ],
      };
    }
  }

  if (!park) notFound();

  // Load related tours
  let relatedTours: any[] = [];
  try {
    relatedTours = await getTourCards({ primaryCountry: park.country }, 6);
  } catch {
    relatedTours = [];
  }

  // Load child parks
  let childParks: any[] = [];
  try {
    childParks = await prisma.destination.findMany({
      where: { country: park.country, type: { not: 'COUNTRY' } },
      orderBy: { name: 'asc' },
      select: { name: true, slug: true },
    });
  } catch {
    childParks = [];
  }

  // Fallback child parks if DB is empty
  if (childParks.length === 0) {
    const curated = CURATED_COUNTRIES_DATA.find((c) => c.slug === seoData.slug);
    if (curated && curated.parks) {
      childParks = curated.parks;
    }
  }

  return (
    <ParkDetailView
      park={park}
      childParks={childParks}
      relatedTours={relatedTours}
      seoTitle={seoData.seoTitle}
    />
  );
}
