import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { chatAccess, markRead } from '@/lib/chat';

/** Mark the other side's messages in this chat as read (sends read receipts). */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const { id } = await params;
  const access = await chatAccess(session, id);
  if (!session || !access) return NextResponse.json({ error: 'Not your reservation.' }, { status: 403 });
  return NextResponse.json({ ok: true, marked: await markRead(access, session.userId) });
}
