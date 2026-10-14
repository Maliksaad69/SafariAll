import { NextResponse } from 'next/server';
import { completeElapsedTrips } from '@/lib/trips';

/**
 * Trip completion sweep.
 *
 * Exposed so an external scheduler (cron / uptime pinger) can trigger the sweep
 * on a timer. It is also invoked lazily on reservation reads, so trips conclude
 * automatically even with no scheduler configured.
 *
 * Protect with CRON_SECRET when set: send `Authorization: Bearer <CRON_SECRET>`.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get('authorization');
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }
  }

  try {
    const completed = await completeElapsedTrips();
    return NextResponse.json({ success: true, completed });
  } catch (error) {
    console.error('Trip completion sweep error:', error);
    return NextResponse.json({ error: 'Sweep failed.' }, { status: 500 });
  }
}

export const POST = GET;
