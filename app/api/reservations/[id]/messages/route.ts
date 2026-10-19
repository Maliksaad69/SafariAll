import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { chatAccess, ChatError, listMessages, markRead, postMessage } from '@/lib/chat';

/**
 * Reservation chat over HTTP. GET returns the history (and marks the other side's
 * messages read). POST sends a message: JSON { body } or multipart form data with
 * a `body` field and up to 5 `files`. Only the reservation's traveller and its
 * operator may use it; new messages are pushed to every realtime transport.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  const { id } = await params;
  try {
    const access = await chatAccess(session, id);
    if (!access) return NextResponse.json({ error: 'Not your reservation.' }, { status: 403 });
    await markRead(access, session.userId);
    return NextResponse.json({ messages: await listMessages(id), side: access.side, status: access.status, me: session.userId });
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

    let body = '';
    const files: { filename: string; mimeType: string; data: Buffer }[] = [];
    if ((req.headers.get('content-type') ?? '').includes('multipart/form-data')) {
      const form = await req.formData();
      body = String(form.get('body') ?? '');
      for (const f of form.getAll('files')) {
        if (typeof f === 'object' && 'arrayBuffer' in f) {
          files.push({ filename: f.name || 'file', mimeType: f.type || 'application/octet-stream', data: Buffer.from(await f.arrayBuffer()) });
        }
      }
    } else {
      body = String((await req.json()).body ?? '');
    }

    const message = await postMessage(access, session.userId, body, files);
    return NextResponse.json({ success: true, message }, { status: 201 });
  } catch (error) {
    if (error instanceof ChatError) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error('Create reservation message error:', error);
    return NextResponse.json({ error: 'Failed to send message.' }, { status: 500 });
  }
}
