/**
 * Custom server: Next.js plus socket.io for real-time reservation chat.
 *
 *   npm run dev     -> tsx server.ts            (development)
 *   npm run start   -> tsx server.ts --prod     (after `npm run build`)
 *
 * Socket events (all scoped to one reservation the user belongs to):
 *   client -> server  chat:join { reservationId }            ack { ok, messages, side, status, online }
 *                     chat:send { reservationId, body }      ack { ok, message } | { ok: false, error }
 *                     chat:typing { reservationId, typing }
 *                     chat:read { reservationId }
 *                     chat:leave { reservationId }
 *   server -> client  chat:message, chat:typing, chat:read, chat:presence, chat:status
 */
import { createServer } from 'http';
import next from 'next';
import { Server, type Socket } from 'socket.io';
import { tokenFromCookieHeader, verifySessionToken } from '@/lib/session-token';
import { chatAccess, listMessages, markRead, postMessage } from '@/lib/chat';
import { reservationRoom, setRealtimeServer } from '@/lib/realtime';
import type { SessionPayload } from '@/lib/auth';

const prod = process.argv.includes('--prod') || process.env.NODE_ENV === 'production';
const port = parseInt(process.env.PORT || '3000', 10);
const app = next({ dev: !prod });
const handle = app.getRequestHandler();

type Ack = (res: Record<string, unknown>) => void;
const safeAck = (ack: unknown): Ack => (typeof ack === 'function' ? (ack as Ack) : () => {});

// Simple per-socket rate limit: 20 messages per 10 seconds.
const sendLog = new WeakMap<Socket, number[]>();
function allowSend(socket: Socket) {
  const now = Date.now();
  const recent = (sendLog.get(socket) ?? []).filter((t) => now - t < 10_000);
  recent.push(now);
  sendLog.set(socket, recent);
  return recent.length <= 20;
}

async function onlineUsers(io: Server, reservationId: string) {
  const sockets = await io.in(reservationRoom(reservationId)).fetchSockets();
  return Array.from(new Set(sockets.map((s) => (s.data.session as SessionPayload).userId)));
}

app.prepare().then(() => {
  const httpServer = createServer((req, res) => handle(req, res));
  const io = new Server(httpServer, { path: '/socket.io', serveClient: false });
  setRealtimeServer(io);

  // Only signed-in users can connect; the session comes from the same cookie the app uses.
  io.use(async (socket, nextFn) => {
    const session = await verifySessionToken(tokenFromCookieHeader(socket.handshake.headers.cookie));
    if (!session) return nextFn(new Error('UNAUTHORIZED'));
    socket.data.session = session;
    nextFn();
  });

  io.on('connection', (socket) => {
    const session = socket.data.session as SessionPayload;

    socket.on('chat:join', async ({ reservationId } = {}, ack) => {
      const reply = safeAck(ack);
      const access = await chatAccess(session, String(reservationId ?? '')).catch(() => null);
      if (!access) return reply({ ok: false, error: 'You are not part of this reservation.' });
      await socket.join(reservationRoom(access.reservationId));
      await markRead(access, session.userId).catch(() => 0);
      const [messages, online] = await Promise.all([listMessages(access.reservationId), onlineUsers(io, access.reservationId)]);
      socket.to(reservationRoom(access.reservationId)).emit('chat:presence', { reservationId: access.reservationId, online });
      reply({ ok: true, messages, side: access.side, status: access.status, online, me: session.userId });
    });

    socket.on('chat:send', async ({ reservationId, body } = {}, ack) => {
      const reply = safeAck(ack);
      if (!allowSend(socket)) return reply({ ok: false, error: 'You are sending messages too quickly. Please wait a moment.' });
      const access = await chatAccess(session, String(reservationId ?? '')).catch(() => null);
      if (!access) return reply({ ok: false, error: 'You are not part of this reservation.' });
      try {
        const message = await postMessage(access, session.userId, String(body ?? ''));
        reply({ ok: true, message });
      } catch (e) {
        reply({ ok: false, error: (e as Error).message === 'EMPTY' ? 'Message is empty.' : 'Could not send the message.' });
      }
    });

    socket.on('chat:typing', ({ reservationId, typing } = {}) => {
      const room = reservationRoom(String(reservationId ?? ''));
      if (!socket.rooms.has(room)) return;
      socket.to(room).emit('chat:typing', { reservationId, userId: session.userId, name: session.name, typing: !!typing });
    });

    socket.on('chat:read', async ({ reservationId } = {}) => {
      if (!socket.rooms.has(reservationRoom(String(reservationId ?? '')))) return;
      const access = await chatAccess(session, String(reservationId)).catch(() => null);
      if (access) await markRead(access, session.userId).catch(() => 0);
    });

    socket.on('chat:leave', async ({ reservationId } = {}) => {
      const id = String(reservationId ?? '');
      await socket.leave(reservationRoom(id));
      io.to(reservationRoom(id)).emit('chat:presence', { reservationId: id, online: await onlineUsers(io, id) });
    });

    socket.on('disconnecting', () => {
      const rooms = [...socket.rooms].filter((r) => r.startsWith('reservation:'));
      setTimeout(async () => {
        for (const room of rooms) {
          const id = room.slice('reservation:'.length);
          io.to(room).emit('chat:presence', { reservationId: id, online: await onlineUsers(io, id) });
        }
      }, 50);
    });
  });

  httpServer.listen(port, () => {
    console.log(`> SafariAsili ready on http://localhost:${port} (${prod ? 'production' : 'development'}, socket.io on /socket.io)`);
  });
});
