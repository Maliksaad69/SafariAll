import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { chatAccess, listMessages, presenceOf, touchPresence } from '@/lib/chat';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const TICK_MS = 1000;
const LIFETIME_MS = 50_000; // close before serverless time limits; the browser reconnects at once

/**
 * Server-sent events for one reservation chat. Works on any host (Vercel, Netlify,
 * Node) because it only reads Postgres: new messages, read receipts, typing and
 * online status are checked every second. The browser's EventSource reconnects
 * automatically and resumes from the last message it saw (Last-Event-ID).
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const { id } = await params;
  const access = await chatAccess(session, id);
  if (!session || !access) return new Response('Not your reservation.', { status: 403 });

  const resumeFrom = req.headers.get('last-event-id') || new URL(req.url).searchParams.get('since');
  let cursor = resumeFrom && !Number.isNaN(Date.parse(resumeFrom)) ? new Date(resumeFrom) : new Date();
  const encoder = new TextEncoder();
  let stop = () => {};

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;
      const send = (event: string, data: unknown, eventId?: string) => {
        if (closed) return;
        controller.enqueue(encoder.encode(`${eventId ? `id: ${eventId}\n` : ''}event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      let lastRead = '';
      let lastPresence = '';
      let lastStatus = access.status;
      let ticks = 0;

      const tick = async () => {
        try {
          // Heartbeat presence every 10 seconds so the other side sees us online.
          if (ticks % 10 === 0) await touchPresence(access, session);
          ticks++;

          const fresh = await listMessages(id, cursor);
          for (const m of fresh) {
            send('chat:message', m, m.createdAt);
            cursor = new Date(m.createdAt);
          }

          const read = await prisma.reservationMessage.aggregate({
            where: { reservationId: id, senderId: session.userId, isRead: true },
            _max: { readAt: true },
          });
          const readKey = read._max.readAt?.toISOString() ?? '';
          if (readKey !== lastRead) {
            // The first tick only records the baseline; later changes are new read receipts.
            if (ticks > 1 && readKey) send('chat:read', { reservationId: id, readerId: 'other', at: readKey });
            lastRead = readKey;
          }

          const presence = await presenceOf(id);
          const typingOthers = presence.typing.filter((t) => t.userId !== session.userId);
          const presenceKey = JSON.stringify([presence.online.sort(), typingOthers.map((t) => t.userId)]);
          if (presenceKey !== lastPresence) {
            send('chat:presence', { reservationId: id, online: presence.online });
            send('chat:typing', { reservationId: id, typing: typingOthers.length > 0, name: typingOthers[0]?.name ?? '' });
            lastPresence = presenceKey;
          }

          if (ticks % 5 === 0) {
            const r = await prisma.reservation.findUnique({ where: { id }, select: { status: true } });
            if (r && r.status !== lastStatus) {
              lastStatus = r.status;
              send('chat:status', { reservationId: id, status: r.status });
            }
          }
        } catch {
          // transient database error: try again on the next tick
        }
      };

      controller.enqueue(encoder.encode('retry: 1000\n\n'));
      send('ready', { transport: 'stream' });
      await tick();
      const timer = setInterval(tick, TICK_MS);
      const end = setTimeout(() => stop(), LIFETIME_MS);
      stop = () => {
        if (closed) return;
        closed = true;
        clearInterval(timer);
        clearTimeout(end);
        try {
          controller.close();
        } catch {
          // already closed
        }
      };
      req.signal.addEventListener('abort', () => stop());
    },
    cancel() {
      stop();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
