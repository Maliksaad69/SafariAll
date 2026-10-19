import prisma from '@/lib/prisma';
import type { SessionPayload } from '@/lib/auth';
import { notifyChange } from '@/lib/live';
import { emitToReservation } from '@/lib/realtime';

/**
 * Reservation chat between the traveller and the tour operator.
 * Messages are stored in reservation_messages; both the REST routes and the
 * socket.io server go through these helpers so access rules are identical.
 */

export const MAX_MESSAGE_LENGTH = 4000;

export interface ChatMessage {
  id: string;
  reservationId: string;
  senderId: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  sender: { firstName: string; lastName: string; role: string };
  mine?: boolean;
}

export type ChatAccess = {
  reservationId: string;
  travelerId: string;
  operatorId: string;
  operatorUserId: string;
  side: 'traveler' | 'agency';
  status: string;
  title: string;
};

/** The reservation's traveller, its operator's staff and admins may use its chat; nobody else. */
export async function chatAccess(session: SessionPayload | null, reservationId: string): Promise<ChatAccess | null> {
  if (!session || !reservationId) return null;
  const r = await prisma.reservation.findUnique({
    where: { id: reservationId },
    select: { id: true, travelerId: true, operatorId: true, status: true, tour: { select: { title: true } }, operator: { select: { userId: true } } },
  });
  if (!r) return null;
  let side: ChatAccess['side'] | null = null;
  if (r.travelerId === session.userId) side = 'traveler';
  else if (session.role === 'ADMIN') side = 'agency';
  else if (session.role === 'OPERATOR') {
    const operatorId = session.operatorId ?? (await prisma.operator.findUnique({ where: { userId: session.userId }, select: { id: true } }))?.id;
    if (operatorId === r.operatorId) side = 'agency';
  }
  if (!side) return null;
  return { reservationId: r.id, travelerId: r.travelerId, operatorId: r.operatorId, operatorUserId: r.operator.userId, side, status: r.status, title: r.tour.title };
}

const toChat = (m: { id: string; reservationId: string; senderId: string; body: string; isRead: boolean; createdAt: Date; sender: { firstName: string; lastName: string; role: string } }): ChatMessage => ({
  id: m.id,
  reservationId: m.reservationId,
  senderId: m.senderId,
  body: m.body,
  isRead: m.isRead,
  createdAt: m.createdAt.toISOString(),
  sender: m.sender,
});

export async function listMessages(reservationId: string): Promise<ChatMessage[]> {
  const rows = await prisma.reservationMessage.findMany({
    where: { reservationId },
    orderBy: { createdAt: 'asc' },
    include: { sender: { select: { firstName: true, lastName: true, role: true } } },
  });
  return rows.map(toChat);
}

/** Mark the other side's messages as read and tell the room. */
export async function markRead(access: ChatAccess, readerId: string) {
  const { count } = await prisma.reservationMessage.updateMany({
    where: { reservationId: access.reservationId, isRead: false, senderId: { not: readerId } },
    data: { isRead: true },
  });
  if (count > 0) {
    emitToReservation(access.reservationId, 'chat:read', { reservationId: access.reservationId, readerId, at: new Date().toISOString() });
    notifyChange(`operator:${access.operatorId}`, `user:${access.travelerId}`);
  }
  return count;
}

/** Store a message, notify the other side and broadcast it to the reservation's room. */
export async function postMessage(access: ChatAccess, senderId: string, rawBody: string): Promise<ChatMessage> {
  const body = String(rawBody ?? '').trim().slice(0, MAX_MESSAGE_LENGTH);
  if (!body) throw new Error('EMPTY');
  const message = await prisma.reservationMessage.create({
    data: { reservationId: access.reservationId, senderId, body },
    include: { sender: { select: { firstName: true, lastName: true, role: true } } },
  });
  const recipient = senderId === access.travelerId ? access.operatorUserId : access.travelerId;
  await prisma.notification
    .create({
      data: {
        userId: recipient,
        type: 'CHAT_MESSAGE',
        title: `New message from ${message.sender.firstName}`,
        body: `${access.title}: ${body.slice(0, 140)}`,
        link: recipient === access.travelerId ? '/my-trips' : `/operator-portal/reservations/${access.reservationId}`,
      },
    })
    .catch(() => {});
  const out = toChat(message);
  emitToReservation(access.reservationId, 'chat:message', out);
  notifyChange(`operator:${access.operatorId}`, `user:${access.travelerId}`);
  return out;
}
