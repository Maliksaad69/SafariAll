import { NextResponse } from 'next/server';
import { preferredTransport, pusherConfig } from '@/lib/realtime';
import { MAX_UPLOAD_BYTES } from '@/lib/chat';

export const dynamic = 'force-dynamic';

/** Tells the chat which realtime transport this deployment supports. */
export async function GET() {
  const pusher = pusherConfig();
  return NextResponse.json({
    transport: preferredTransport(),
    pusher: pusher ? { key: pusher.key, cluster: pusher.cluster } : null,
    // Serverless hosts cap request bodies (Vercel 4.5 MB, Netlify about 6 MB).
    maxUploadBytes: MAX_UPLOAD_BYTES,
  });
}
