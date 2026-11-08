import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const country = searchParams.get('country')?.trim();
    const type = searchParams.get('type')?.trim();

    const where: Prisma.DestinationWhereInput = {};

    if (country) {
      where.country = { equals: country, mode: 'insensitive' };
    }

    if (type === 'parks') {
      where.type = { not: 'COUNTRY' };
    } else if (type === 'countries') {
      where.type = 'COUNTRY';
    } else if (type) {
      where.type = type as any;
    }

    const destinations = await prisma.destination.findMany({
      where,
      orderBy: type === 'countries' ? [{ name: 'asc' }] : [{ popularityRank: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        slug: true,
        country: true,
        type: true,
        featuredImageUrl: true,
      },
    });

    return NextResponse.json({ destinations });
  } catch (error: any) {
    console.error('Error fetching destinations:', error);
    return NextResponse.json({ error: 'Failed to fetch destinations.' }, { status: 500 });
  }
}
