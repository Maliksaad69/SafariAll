import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

const FAVORITES_COOKIE = 'safariasili_favorites';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const favCookie = cookieStore.get(FAVORITES_COOKIE)?.value || '[]';
    const favIds: string[] = JSON.parse(favCookie);

    if (favIds.length === 0) {
      return NextResponse.json({ tours: [] });
    }

    const tours = await prisma.tour.findMany({
      where: { id: { in: favIds } },
      include: {
        operator: true,
        destinations: { include: { destination: true } },
      },
    });

    return NextResponse.json({ tours });
  } catch (error: any) {
    return NextResponse.json({ tours: [] }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tourId } = body;

    if (!tourId) {
      return NextResponse.json({ error: 'Missing tourId.' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const favCookie = cookieStore.get(FAVORITES_COOKIE)?.value || '[]';
    let favIds: string[] = JSON.parse(favCookie);

    if (favIds.includes(tourId)) {
      favIds = favIds.filter((id) => id !== tourId);
    } else {
      favIds.push(tourId);
    }

    cookieStore.set(FAVORITES_COOKIE, JSON.stringify(favIds), {
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: false,
    });

    return NextResponse.json({ success: true, favorites: favIds });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error updating favorites.' }, { status: 500 });
  }
}
