import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

async function resolveOperatorId(session: any): Promise<string | null> {
  if (session.operatorId) return session.operatorId;
  const op = await prisma.operator.findUnique({ where: { userId: session.userId } });
  return op?.id ?? null;
}

/**
 * Reservation message thread.
 * Both the traveler who owns the reservation and the agency that owns it may read and write.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  const { id } = await params;
  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: { tour: { select: { title: true, slug: true } } },
    });
    if (!reservation) {
      return NextResponse.json({ error: 'Reservation not found.' }, { status: 404 });
    }

    const isTraveler = session.role === 'TRAVELER' && reservation.travelerId === session.userId;
    const isOperator = session.role === 'OPERATOR' || session.role === 'ADMIN';
    let operatorId = null;
    if (isOperator) {
      operatorId = await resolveOperatorId(session);
    }
    const isAgency = isOperator && operatorId && reservation.operatorId === operatorId;

    if (!isTraveler && !isAgency) {
      return NextResponse.json({ error: 'Not your reservation.' }, { status: 403 });
    }

    const messages = await prisma.reservationMessage.findMany({
      where: { reservationId: id },
      orderBy: { createdAt: 'asc' },
      include: { sender: { select: { firstName: true, lastName: true } } },
    });

    // Mark messages from the counterpart as read for this viewer
    await prisma.reservationMessage.updateMany({
      where: { reservationId: id, isRead: false, senderId: { not: session.userId } },
      data: { isRead: true },
    });

    return NextResponse.json({ messages });
  } catch (error: any) {
    console.error('List reservation messages error:', error);
    return NextResponse.json({ error: 'Failed to load messages.' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  const { id } = await params;
  try {
    const reservation = await prisma.reservation.findUnique({ where: { id } });
    if (!reservation) {
      return NextResponse.json({ error: 'Reservation not found.' }, { status: 404 });
    }

    const isTraveler = session.role === 'TRAVELER' && reservation.travelerId === session.userId;
    const isOperator = session.role === 'OPERATOR' || session.role === 'ADMIN';
    let operatorId = null;
    if (isOperator) {
      operatorId = await resolveOperatorId(session);
    }
    const isAgency = isOperator && operatorId && reservation.operatorId === operatorId;

    if (!isTraveler && !isAgency) {
      return NextResponse.json({ error: 'Not your reservation.' }, { status: 403 });
    }

    const { body } = await req.json();
    if (!body || typeof body !== 'string' || !body.trim()) {
      return NextResponse.json({ error: 'Message text is required.' }, { status: 400 });
    }

    const message = await prisma.reservationMessage.create({
      data: {
        reservationId: id,
        senderId: session.userId,
        body: body.trim().slice(0, 4000),
      },
      include: { sender: { select: { firstName: true, lastName: true } } },
    });

    return NextResponse.json({ success: true, message }, { status: 201 });
  } catch (error: any) {
    console.error('Create reservation message error:', error);
    return NextResponse.json({ error: error.message || 'Failed to send message.' }, { status: 500 });
  }
}
