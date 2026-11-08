import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { getTourCards } from '@/lib/catalog';
import { getCountrySeoData } from '@/lib/countries';
import ParkDetailView from '@/components/ParkDetailView';

export const dynamic = 'force-dynamic';

interface ParkDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ParkDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const seoData = getCountrySeoData(slug);
  if (seoData) {
    return {
      title: `${seoData.seoTitle} | SafariRequest`,
    };
  }

  let park: any = null;
  try {
    park = await prisma.destination.findUnique({ where: { slug } });
  } catch {}

  const title = park ? `${park.name} — Wildlife & Safari Travel Guide` : 'African National Park Guide';
  return {
    title: `${title} | SafariRequest`,
    description: park?.description || 'African safari guide, national park wildlife, travel seasons, and tours.',
  };
}

export default async function ParkDetailPage({ params }: ParkDetailPageProps) {
  const { slug } = await params;

  // 1. If slug is a country, redirect to recommended canonical SEO URL
  const countrySeo = getCountrySeoData(slug);
  if (countrySeo) {
    redirect(countrySeo.seoUrl);
  }

  // 2. Fetch destination for park
  let park: any = null;
  try {
    park = await prisma.destination.findUnique({
      where: { slug },
      include: { sections: { orderBy: { sortOrder: 'asc' } } },
    });
  } catch (err) {
    console.warn(`[ParkDetailPage] Database query failed for park "${slug}":`, (err as Error)?.message);
  }

  if (!park) notFound();

  const isCountry = park.type === 'COUNTRY';
  const relatedTours = isCountry
    ? await getTourCards({ primaryCountry: park.country }, 6)
    : await getTourCards({ destinations: { some: { destinationId: park.id } } }, 6);

  let childParks: any[] = [];
  if (isCountry) {
    try {
      childParks = await prisma.destination.findMany({
        where: { country: park.country, type: { not: 'COUNTRY' } },
        orderBy: { name: 'asc' },
        select: { name: true, slug: true },
      });
    } catch {
      childParks = [];
    }
  }

  return (
    <ParkDetailView
      park={park}
      childParks={childParks}
      relatedTours={relatedTours}
    />
  );
}
