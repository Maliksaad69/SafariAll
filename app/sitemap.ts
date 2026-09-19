import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://safariasili.com';

  const [tours, destinations, operators] = await Promise.all([
    prisma.tour.findMany({ select: { slug: true, createdAt: true } }),
    prisma.destination.findMany({ select: { slug: true, createdAt: true } }),
    prisma.operator.findMany({ select: { id: true, createdAt: true } }),
  ]);

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

  const staticUrls = [
    '',
    '/tours',
    '/operators',
    '/parks',
    '/login',
    '/register',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 1.0,
  }));

  return [...staticUrls, ...tourUrls, ...parkUrls, ...operatorUrls];
}
