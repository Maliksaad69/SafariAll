import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || (session.role !== 'OPERATOR' && session.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Operator authentication required.' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const { status, note } = body;

    if (!['APPROVED', 'DECLINED'].includes(status)) {
      return NextResponse.json({ error: 'Status must be APPROVED or DECLINED.' }, { status: 400 });
    }

    // Scope check: operators may only decide on their own reservations
    const where: any = { id };
    if (session.role === 'OPERATOR') {
      let operatorId = session.operatorId;
      if (!operatorId) {
        const op = await prisma.operator.findUnique({ where: { userId: session.userId } });
        operatorId = op?.id;
      }
      where.operatorId = operatorId;
    }

    const reservation = await prisma.reservation.findFirst({ where });

    if (!reservation) {
      return NextResponse.json({ error: 'Reservation not found.' }, { status: 404 });
    }

    if (reservation.status !== 'PENDING') {
      return NextResponse.json({ error: `Reservation has already been ${reservation.status.toLowerCase()}.` }, { status: 409 });
    }

    const updated = await prisma.reservation.update({
      where: { id: reservation.id },
      data: {
        status,
        operatorNote: note || null,
        decidedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, reservation: updated });
  } catch (error: any) {
    console.error('Reservation decision error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update reservation.' }, { status: 500 });
  }
}
