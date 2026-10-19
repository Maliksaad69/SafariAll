import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { fingerprint, liveBus } from '@/lib/live';

export const dynamic = 'force-dynamic';

const POLL_MS = 3000;
const HEARTBEAT_MS = 20000;

/**
 * Server-sent events stream. Sends `change` whenever the watched data changes:
 *   /api/live?tour=<tourId>  seat availability of a tour's departures (public)
 *   /api/live?scope=me       the signed-in traveller's reservations, or the agency's
 *                            reservations and departures for an operator account
 * Clients refetch their own data when they receive `change`.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const keys: string[] = [];

  const tourId = searchParams.get('tour');
  if (tourId) keys.push(`tour:${tourId}`);

  if (searchParams.get('scope') === 'me') {
    const session = await getSession();
    if (!session) return new Response('Authentication required.', { status: 401 });
    if (session.role === 'OPERATOR' || session.role === 'ADMIN') {
      const operatorId = session.operatorId ?? (await prisma.operator.findUnique({ where: { userId: session.userId } }))?.id;
      if (operatorId) keys.push(`operator:${operatorId}`);
    }
    keys.push(`user:${session.userId}`);
  }

  if (keys.length === 0) return new Response('Nothing to watch.', { status: 400 });

  const encoder = new TextEncoder();
  let cleanup = () => {};

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;
      let last = '';
      let checking = false;
      const send = (chunk: string) => {
        if (!closed) controller.enqueue(encoder.encode(chunk));
      };

      const check = async () => {
        if (closed || checking) return;
        checking = true;
        try {
          const fp = (await Promise.all(keys.map(fingerprint))).join('#');
          if (last && fp !== last) send(`event: change\ndata: ${JSON.stringify({ at: Date.now() })}\n\n`);
          last = fp;
        } catch {
          // transient DB error: try again on the next tick
        } finally {
          checking = false;
        }
      };

      const onChange = (key: string) => {
        if (keys.includes(key)) void check();
      };

      await check();
      send(`retry: 3000\nevent: ready\ndata: {}\n\n`);
      liveBus.on('change', onChange);
      const poll = setInterval(check, POLL_MS);
      const beat = setInterval(() => send(`: ping\n\n`), HEARTBEAT_MS);

      cleanup = () => {
        if (closed) return;
        closed = true;
        clearInterval(poll);
        clearInterval(beat);
        liveBus.off('change', onChange);
        try {
          controller.close();
        } catch {
          // already closed
        }
      };
      req.signal.addEventListener('abort', cleanup);
    },
    cancel() {
      cleanup();
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
