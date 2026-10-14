import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const operators = await prisma.operator.findMany({
      orderBy: { totalReviews: 'desc' },
      include: {
        _count: { select: { tours: true, reviews: true, reservations: true } },
      },
    });
    return NextResponse.json({
      operators: operators.map((o) => ({
        id: o.id,
        companyName: o.companyName,
        slug: o.slug,
        logoUrl: o.logoUrl,
        bannerUrl: o.bannerUrl,
        countryOfOrigin: o.countryOfOrigin,
        headquartersAddress: o.headquartersAddress,
        registrationNumber: o.registrationNumber,
        isVerified: o.isVerified,
        overviewText: o.overviewText,
        yearEstablished: o.yearEstablished,
        priceTier: o.priceTier,
        averageRating: o.averageRating,
        totalReviews: o.totalReviews,
        tourCount: o._count.tours,
        reviewCount: o._count.reviews,
        reservationCount: o._count.reservations,
      })),
    });
  } catch (error: any) {
    console.error('Operators list error:', error);
    return NextResponse.json({ operators: [] }, { status: 500 });
  }
}
