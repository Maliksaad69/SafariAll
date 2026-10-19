import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { chatAccess, listMessages, markRead, postMessage } from '@/lib/chat';

/**
 * Reservation chat over HTTP (history, and a fallback for sending when the
 * socket is not connected). Only the reservation's traveller and its operator
 * may read or write; new messages are pushed to the socket.io room as well.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  const { id } = await params;
  try {
    const access = await chatAccess(session, id);
    if (!access) return NextResponse.json({ error: 'Not your reservation.' }, { status: 403 });
    await markRead(access, session.userId);
    return NextResponse.json({ messages: await listMessages(id), side: access.side, status: access.status });
  } catch (error) {
    console.error('List reservation messages error:', error);
    return NextResponse.json({ error: 'Failed to load messages.' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  const { id } = await params;
  try {
    const access = await chatAccess(session, id);
    if (!access) return NextResponse.json({ error: 'Not your reservation.' }, { status: 403 });
    const { body } = await req.json();
    if (!body || typeof body !== 'string' || !body.trim()) {
      return NextResponse.json({ error: 'Message text is required.' }, { status: 400 });
    }
    const message = await postMessage(access, session.userId, body);
    return NextResponse.json({ success: true, message }, { status: 201 });
  } catch (error) {
    console.error('Create reservation message error:', error);
    return NextResponse.json({ error: 'Failed to send message.' }, { status: 500 });
  }
}
