import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://safariasili.com';

  const staticUrls = [
    '',
    '/african-safari-tours',
    '/top-safari-countries',
    '/safari-operators',
    '/safari-reviews',
    '/safari-blog',
    '/custom-safari-quote',
    '/best-price-guarantee',
    '/how-it-works',
    '/about-us',
    '/contact-us',
    '/faq',
    '/login',
    '/register',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  // If no database connection is configured (e.g. during Docker image build time), return static pages
  if (!process.env.DATABASE_URL) {
    return staticUrls;
  }

  let tours: Array<{ slug: string; createdAt: Date }> = [];
  let destinations: Array<{ slug: string; createdAt: Date }> = [];
  let operators: Array<{ id: string; createdAt: Date }> = [];

  try {
    [tours, destinations, operators] = await Promise.all([
      prisma.tour.findMany({ select: { slug: true, createdAt: true } }),
      prisma.destination.findMany({ select: { slug: true, createdAt: true } }),
      prisma.operator.findMany({ select: { id: true, createdAt: true } }),
    ]);
  } catch {
    tours = [];
    destinations = [];
    operators = [];
  }

  const tourUrls = tours.map((tour) => ({
    url: `${baseUrl}/tours/${tour.slug}`,
    lastModified: tour.createdAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const parkUrls = destinations.map((park) => ({
    url: `${baseUrl}/parks/${park.slug}`,
    lastModified: park.createdAt,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const operatorUrls = operators.map((op) => ({
    url: `${baseUrl}/operators/${op.id}`,
    lastModified: op.createdAt,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticUrls, ...tourUrls, ...parkUrls, ...operatorUrls];
}
