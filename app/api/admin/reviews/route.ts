import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

async function recalculateOperatorRating(operatorId: string) {
  const agg = await prisma.review.aggregate({
    where: { operatorId, status: 'APPROVED' },
    _avg: { overallRating: true },
    _count: { id: true },
  });

  await prisma.operator.update({
    where: { id: operatorId },
    data: {
      averageRating: agg._avg.overallRating ? Number((Math.round(agg._avg.overallRating * 10) / 10).toFixed(1)) : 0,
      totalReviews: agg._count.id ?? 0,
    },
  });
}

export async function GET() {
  const session = await getSession();

  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized. Admin privilege required.' }, { status: 403 });
  }

  const reviews = await prisma.review.findMany({
    where: { status: 'PENDING_MODERATION' },
    orderBy: { createdAt: 'desc' },
    include: {
      traveler: { select: { firstName: true, lastName: true, email: true, country: true } },
      operator: { select: { companyName: true, slug: true } },
      tour: { select: { title: true, slug: true } },
    },
  });

  return NextResponse.json({ reviews });
}

export async function POST(req: Request) {
  const session = await getSession();

  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized. Admin privilege required.' }, { status: 403 });
  }

  const body = await req.json();
  const { reviewId, status } = body;

  if (!reviewId || !['APPROVED', 'REJECTED'].includes(status)) {
    return NextResponse.json({ error: 'Missing required parameters (reviewId, status).' }, { status: 400 });
  }

  const review = await prisma.review.update({
    where: { id: reviewId },
    data: { status },
    include: {
      operator: true,
    },
  });

  await recalculateOperatorRating(review.operatorId);

  return NextResponse.json({ success: true, review });
}
