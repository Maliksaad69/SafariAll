import { NextResponse } from 'next/server';
import { preferredTransport, pusherConfig } from '@/lib/realtime';

export const dynamic = 'force-dynamic';

/** Tells the chat which realtime transport this deployment supports. */
export async function GET() {
  const pusher = pusherConfig();
  return NextResponse.json({
    transport: preferredTransport(),
    pusher: pusher ? { key: pusher.key, cluster: pusher.cluster } : null,
  });
}
