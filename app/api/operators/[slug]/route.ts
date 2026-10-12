import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const operator = await prisma.operator.findUnique({
      where: { slug },
      include: {
        _count: { select: { tours: true, reviews: true, reservations: true } },
      },
    });
    if (!operator) {
      return NextResponse.json({ error: 'Operator not found.' }, { status: 404 });
    }
    return NextResponse.json({
      companyName: operator.companyName,
      slug: operator.slug,
      logoUrl: operator.logoUrl,
      bannerUrl: operator.bannerUrl,
      countryOfOrigin: operator.countryOfOrigin,
      headquartersAddress: operator.headquartersAddress,
      registrationNumber: operator.registrationNumber,
      isVerified: operator.isVerified,
      overviewText: operator.overviewText,
      yearEstablished: operator.yearEstablished,
      priceTier: operator.priceTier,
      averageRating: operator.averageRating,
      totalReviews: operator.totalReviews,
      tourCount: operator._count.tours,
      reviewCount: operator._count.reviews,
      reservationCount: operator._count.reservations,
    });
  } catch (error: any) {
    console.error('Operator lookup error:', error);
    return NextResponse.json({ error: 'Failed to load operator.' }, { status: 500 });
  }
}
