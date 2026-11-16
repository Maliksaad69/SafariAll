import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withMemoryCache } from '@/lib/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const count = await withMemoryCache('tours_count', 300, async () => {
      try {
        return await prisma.tour.count({ where: { isPublished: true } });
      } catch (err) {
        console.warn('[tours-count API] Query failed:', (err as Error)?.message);
        return 0;
      }
    });
    return NextResponse.json(
      { count },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json({ count: 0 });
  }
}
