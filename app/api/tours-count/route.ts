import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const count = await prisma.tour.count({ where: { isPublished: true } });
    return NextResponse.json({ count });
  } catch (error: any) {
    console.error('Tours count API error:', error);
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}
