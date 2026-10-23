import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { chatAccess, touchPresence } from '@/lib/chat';

/** { typing: boolean } shows "… is typing" to the other side on any transport. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const { id } = await params;
  const access = await chatAccess(session, id);
  if (!session || !access) return NextResponse.json({ error: 'Not your reservation.' }, { status: 403 });
  const { typing } = await req.json().catch(() => ({ typing: false }));
  await touchPresence(access, session, !!typing);
  return NextResponse.json({ ok: true });
}
