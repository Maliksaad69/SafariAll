import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const operatorId = searchParams.get('operatorId');
    if (!operatorId) {
      return NextResponse.json({ reviews: [] });
    }

    const reviews = await prisma.review.findMany({
      where: { operatorId, status: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        traveler: { select: { firstName: true, lastName: true, country: true } },
      },
    });

    return NextResponse.json({ reviews });
  } catch (error: any) {
    console.error('Error listing reviews:', error);
    return NextResponse.json({ reviews: [] }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Authentication required to post a review.' }, { status: 401 });
    }

    const body = await req.json();
    const { operatorId, tourId, rating, title, comment } = body;

    if (!operatorId || !rating || !title || !comment) {
      return NextResponse.json({ error: 'Missing required fields (operatorId, rating, title, comment).' }, { status: 400 });
    }

    const numericRating = parseFloat(rating);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return NextResponse.json({ error: 'Rating must be a number between 1 and 5.' }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        operatorId,
        tourId: tourId || null,
        travelerId: session.userId,
        overallRating: numericRating,
        reviewTitle: title,
        reviewBody: comment,
        status: 'APPROVED',
      },
      include: {
        traveler: { select: { firstName: true, lastName: true, country: true } },
      },
    });

    // Update operator average rating & review count
    const agg = await prisma.review.aggregate({
      where: { operatorId, status: 'APPROVED' },
      _avg: { overallRating: true },
      _count: { id: true },
    });

    await prisma.operator.update({
      where: { id: operatorId },
      data: {
        averageRating: agg._avg.overallRating ? Math.round(agg._avg.overallRating * 10) / 10 : numericRating,
        totalReviews: agg._count.id || 1,
      },
    });

    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: error.message || 'Internal server error.' }, { status: 500 });
  }
}
