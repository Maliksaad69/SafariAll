import { createHash, createHmac } from 'crypto';
import type { Server } from 'socket.io';

/**
 * Realtime fan-out for reservation chats, independent of where the app is hosted.
 *
 *  - socket.io   when the app runs under server.ts (any Node host, Docker, VPS).
 *  - Pusher      when PUSHER_APP_ID / PUSHER_KEY / PUSHER_SECRET / PUSHER_CLUSTER are set
 *                (works on serverless hosts such as Vercel and Netlify).
 *  - stream      always available: /api/reservations/[id]/stream reads new messages
 *                from Postgres, so the chat works on any host with no extra setup.
 *
 * Messages are always stored in Postgres first; publishing is best-effort.
 */

const g = globalThis as unknown as { __safariIO?: Server };

export function setRealtimeServer(io: Server) {
  g.__safariIO = io;
}

export const reservationRoom = (reservationId: string) => `reservation:${reservationId}`;
export const pusherChannel = (reservationId: string) => `private-reservation-${reservationId}`;

export function pusherConfig() {
  const { PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET, PUSHER_CLUSTER } = process.env;
  if (!PUSHER_APP_ID || !PUSHER_KEY || !PUSHER_SECRET || !PUSHER_CLUSTER) return null;
  return { appId: PUSHER_APP_ID, key: PUSHER_KEY, secret: PUSHER_SECRET, cluster: PUSHER_CLUSTER };
}

export type Transport = 'socket' | 'pusher' | 'stream';

/** The fastest transport available in this deployment, for the browser to use. */
export function preferredTransport(): Transport {
  if (g.__safariIO) return 'socket';
  if (pusherConfig()) return 'pusher';
  return 'stream';
}

/** Trigger an event on Pusher Channels over its HTTP API (no SDK needed). */
async function pusherTrigger(channel: string, event: string, payload: unknown) {
  const cfg = pusherConfig();
  if (!cfg) return;
  const body = JSON.stringify({ name: event, channels: [channel], data: JSON.stringify(payload) });
  const path = `/apps/${cfg.appId}/events`;
  const params: Record<string, string> = {
    auth_key: cfg.key,
    auth_timestamp: String(Math.floor(Date.now() / 1000)),
    auth_version: '1.0',
    body_md5: createHash('md5').update(body).digest('hex'),
  };
  const query = Object.keys(params).sort().map((k) => `${k}=${params[k]}`).join('&');
  const signature = createHmac('sha256', cfg.secret).update(`POST\n${path}\n${query}`).digest('hex');
  const res = await fetch(`https://api-${cfg.cluster}.pusher.com${path}?${query}&auth_signature=${signature}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
  if (!res.ok) console.warn('Pusher trigger failed', res.status, await res.text().catch(() => ''));
}

/** Sign a private-channel subscription for pusher-js (see /api/pusher/auth). */
export function pusherAuthSignature(socketId: string, channel: string) {
  const cfg = pusherConfig();
  if (!cfg) return null;
  const sig = createHmac('sha256', cfg.secret).update(`${socketId}:${channel}`).digest('hex');
  return { auth: `${cfg.key}:${sig}` };
}

/** Push an event to everyone in a reservation's chat. Await it on serverless hosts. */
export async function emitToReservation(reservationId: string, event: string, payload: unknown) {
  g.__safariIO?.to(reservationRoom(reservationId)).emit(event, payload);
  if (pusherConfig()) await pusherTrigger(pusherChannel(reservationId), event, payload).catch(() => {});
}
