import prisma from '@/lib/prisma';
import type { SessionPayload } from '@/lib/auth';
import { notifyChange } from '@/lib/live';
import { emitToReservation } from '@/lib/realtime';

/**
 * Reservation chat between the traveller and the tour operator.
 * Messages (and their attachments) are stored in Postgres; the socket.io server,
 * the HTTP routes and the stream endpoint all go through these helpers, so the
 * access rules are identical whichever transport the browser uses.
 */

export const MAX_MESSAGE_LENGTH = 4000;
export const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024;
export const MAX_ATTACHMENTS = 5;
export const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic',
  'application/pdf', 'text/plain',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

export interface ChatAttachment {
  id: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  isImage: boolean;
}

export interface ChatMessage {
  id: string;
  reservationId: string;
  senderId: string;
  body: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  sender: { firstName: string; lastName: string; role: string };
  attachments: ChatAttachment[];
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

const messageInclude = {
  sender: { select: { firstName: true, lastName: true, role: true } },
  attachments: { select: { id: true, filename: true, mimeType: true, sizeBytes: true } },
} as const;

type Row = {
  id: string; reservationId: string; senderId: string; body: string; isRead: boolean; readAt: Date | null; createdAt: Date;
  sender: { firstName: string; lastName: string; role: string };
  attachments: { id: string; filename: string; mimeType: string; sizeBytes: number }[];
};

export const toChat = (m: Row): ChatMessage => ({
  id: m.id,
  reservationId: m.reservationId,
  senderId: m.senderId,
  body: m.body,
  isRead: m.isRead,
  readAt: m.readAt?.toISOString() ?? null,
  createdAt: m.createdAt.toISOString(),
  sender: m.sender,
  attachments: m.attachments.map((a) => ({ ...a, url: `/api/chat/attachments/${a.id}`, isImage: a.mimeType.startsWith('image/') })),
});

export async function listMessages(reservationId: string, after?: Date): Promise<ChatMessage[]> {
  const rows = await prisma.reservationMessage.findMany({
    where: { reservationId, ...(after ? { createdAt: { gt: after } } : {}) },
    orderBy: { createdAt: 'asc' },
    include: messageInclude,
  });
  return rows.map(toChat);
}

/** Mark the other side's messages as read and tell the room. */
export async function markRead(access: ChatAccess, readerId: string) {
  const at = new Date();
  const { count } = await prisma.reservationMessage.updateMany({
    where: { reservationId: access.reservationId, isRead: false, senderId: { not: readerId } },
    data: { isRead: true, readAt: at },
  });
  if (count > 0) {
    await emitToReservation(access.reservationId, 'chat:read', { reservationId: access.reservationId, readerId, at: at.toISOString() });
    notifyChange(`operator:${access.operatorId}`, `user:${access.travelerId}`);
  }
  return count;
}

export class ChatError extends Error {}

/** Store a message (with optional files), notify the other side and broadcast it to the room. */
export async function postMessage(
  access: ChatAccess,
  senderId: string,
  rawBody: string,
  files: { filename: string; mimeType: string; data: Buffer }[] = [],
): Promise<ChatMessage> {
  const body = String(rawBody ?? '').trim().slice(0, MAX_MESSAGE_LENGTH);
  if (!body && files.length === 0) throw new ChatError('Message is empty.');
  if (files.length > MAX_ATTACHMENTS) throw new ChatError(`You can attach up to ${MAX_ATTACHMENTS} files per message.`);
  for (const f of files) {
    if (f.data.length === 0) throw new ChatError(`${f.filename} is empty.`);
    if (f.data.length > MAX_ATTACHMENT_BYTES) throw new ChatError(`${f.filename} is larger than 8 MB.`);
    if (!ALLOWED_TYPES.includes(f.mimeType)) throw new ChatError(`${f.filename}: only photos, PDF, Word, Excel and text files can be shared.`);
  }

  const message = await prisma.reservationMessage.create({
    data: {
      reservationId: access.reservationId,
      senderId,
      body,
      attachments: files.length
        ? { create: files.map((f) => ({ filename: f.filename.slice(0, 200), mimeType: f.mimeType, sizeBytes: f.data.length, data: new Uint8Array(f.data) })) }
        : undefined,
    },
    include: messageInclude,
  });
  const out = toChat(message);

  const recipient = senderId === access.travelerId ? access.operatorUserId : access.travelerId;
  // Clear the sender's typing flag, then fan out.
  await prisma.chatPresence.updateMany({ where: { reservationId: access.reservationId, userId: senderId }, data: { typingUntil: null } }).catch(() => {});
  await Promise.all([
    emitToReservation(access.reservationId, 'chat:message', out),
    prisma.notification
      .create({
        data: {
          userId: recipient,
          type: 'CHAT_MESSAGE',
          title: `New message from ${message.sender.firstName}`,
          body: `${access.title}: ${body ? body.slice(0, 140) : `${files.length} attachment${files.length === 1 ? '' : 's'}`}`,
          link: recipient === access.travelerId ? '/my-trips' : `/operator-portal/reservations/${access.reservationId}`,
        },
      })
      .catch(() => {}),
  ]);
  notifyChange(`operator:${access.operatorId}`, `user:${access.travelerId}`);
  return out;
}

/** Record that a user is viewing the chat, and whether they are typing. */
export async function touchPresence(access: ChatAccess, session: SessionPayload, typing?: boolean) {
  const now = new Date();
  const typingUntil = typing === undefined ? undefined : typing ? new Date(now.getTime() + 6000) : null;
  await prisma.chatPresence.upsert({
    where: { reservationId_userId: { reservationId: access.reservationId, userId: session.userId } },
    create: { reservationId: access.reservationId, userId: session.userId, name: session.name, lastSeen: now, typingUntil: typingUntil ?? null },
    update: { lastSeen: now, name: session.name, ...(typingUntil !== undefined ? { typingUntil } : {}) },
  });
  if (typing !== undefined) {
    await emitToReservation(access.reservationId, 'chat:typing', { reservationId: access.reservationId, userId: session.userId, name: session.name, typing });
  }
}

/** Users seen in the last 30 seconds and who is typing right now. */
export async function presenceOf(reservationId: string) {
  const now = new Date();
  const rows = await prisma.chatPresence.findMany({ where: { reservationId, lastSeen: { gt: new Date(now.getTime() - 30_000) } } });
  return {
    online: rows.map((r) => r.userId),
    typing: rows.filter((r) => r.typingUntil && r.typingUntil > now).map((r) => ({ userId: r.userId, name: r.name })),
  };
}
