import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * The signed-in user's reservation chats for the header chat button:
 * travellers see their reservations, operators see their agency's reservations.
 * Sorted by latest activity, with the last message and unread count.
 */
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  let operatorId: string | undefined;
  if (session.role === 'OPERATOR') {
    operatorId = session.operatorId ?? (await prisma.operator.findUnique({ where: { userId: session.userId }, select: { id: true } }))?.id;
  }

  const reservations = await prisma.reservation.findMany({
    where: operatorId ? { OR: [{ operatorId }, { travelerId: session.userId }] } : { travelerId: session.userId },
    select: {
      id: true,
      reference: true,
      status: true,
      startDate: true,
      createdAt: true,
      travelerId: true,
      tour: { select: { title: true } },
      traveler: { select: { firstName: true, lastName: true } },
      operator: { select: { companyName: true } },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { body: true, createdAt: true, senderId: true, _count: { select: { attachments: true } } },
      },
    },
    take: 200,
  });

  const unread = await prisma.reservationMessage.groupBy({
    by: ['reservationId'],
    where: { reservationId: { in: reservations.map((r) => r.id) }, isRead: false, senderId: { not: session.userId } },
    _count: { _all: true },
  });
  const unreadOf = new Map(unread.map((u) => [u.reservationId, u._count._all]));

  const conversations = reservations
    .map((r) => {
      const last = r.messages[0];
      const iAmTraveler = r.travelerId === session.userId;
      return {
        reservationId: r.id,
        reference: r.reference.slice(-8).toUpperCase(),
        status: r.status,
        tourTitle: r.tour.title,
        startDate: r.startDate.toISOString(),
        counterpart: iAmTraveler ? r.operator.companyName : `${r.traveler.firstName} ${r.traveler.lastName}`,
        unread: unreadOf.get(r.id) ?? 0,
        lastAt: (last?.createdAt ?? r.createdAt).toISOString(),
        lastMessage: last
          ? {
              mine: last.senderId === session.userId,
              text: last.body || (last._count.attachments ? `📎 ${last._count.attachments} attachment${last._count.attachments === 1 ? '' : 's'}` : ''),
            }
          : null,
      };
    })
    .sort((a, b) => b.lastAt.localeCompare(a.lastAt));

  return NextResponse.json({
    conversations,
    totalUnread: conversations.reduce((n, c) => n + c.unread, 0),
  });
}
