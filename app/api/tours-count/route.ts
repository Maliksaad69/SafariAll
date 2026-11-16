import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withMemoryCache } from '@/lib/cache';

export const revalidate = 300;

export async function GET() {
  try {
    const count = await withMemoryCache('tours_count', 300, () =>
      prisma.tour.count({ where: { isPublished: true } })
    );
    return NextResponse.json(
      { count },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error: any) {
    console.error('Tours count API error:', error);
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}
