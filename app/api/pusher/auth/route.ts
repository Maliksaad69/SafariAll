import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { chatAccess } from '@/lib/chat';
import { pusherAuthSignature } from '@/lib/realtime';

/** Authorise pusher-js to subscribe to private-reservation-<id> (only that reservation's two parties). */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  const form = await req.formData();
  const socketId = String(form.get('socket_id') ?? '');
  const channel = String(form.get('channel_name') ?? '');
  const match = /^private-reservation-([0-9a-f-]{36})$/.exec(channel);
  if (!socketId || !match || !(await chatAccess(session, match[1]))) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
  }
  const signature = pusherAuthSignature(socketId, channel);
  if (!signature) return NextResponse.json({ error: 'Pusher is not configured.' }, { status: 404 });
  return NextResponse.json(signature);
}
