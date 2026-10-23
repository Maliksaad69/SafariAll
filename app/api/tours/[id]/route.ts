import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tour = await prisma.tour.findFirst({
    where: { OR: [{ id }, { slug: id }], isPublished: true },
    select: { id: true, title: true, slug: true, primaryCountry: true, durationDays: true, minPriceUsd: true },
  });
  if (!tour) return NextResponse.json({ error: 'Tour not found' }, { status: 404 });
  return NextResponse.json({ tour });
}
