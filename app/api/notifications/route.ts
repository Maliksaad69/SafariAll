import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

/** List the signed-in user's travel notifications (newest first). */
export async function GET(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10) || 20));

    const [notifications, unread] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      prisma.notification.count({ where: { userId: session.userId, isRead: false } }),
    ]);

    return NextResponse.json({
      unread,
      notifications: notifications.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        body: n.body,
        link: n.link,
        isRead: n.isRead,
        createdAt: n.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('List notifications error:', error);
    return NextResponse.json({ error: 'Failed to load notifications.' }, { status: 500 });
  }
}

/**
 * Mark notifications read. Body: { id } for one, { all: true } for every unread.
 */
export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));

    if (body?.all) {
      const res = await prisma.notification.updateMany({
        where: { userId: session.userId, isRead: false },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true, updated: res.count });
    }

    if (!body?.id) {
      return NextResponse.json({ error: 'An id or { all: true } is required.' }, { status: 400 });
    }

    const res = await prisma.notification.updateMany({
      where: { id: body.id, userId: session.userId },
      data: { isRead: true },
    });
    return NextResponse.json({ success: true, updated: res.count });
  } catch (error) {
    console.error('Update notifications error:', error);
    return NextResponse.json({ error: 'Failed to update notifications.' }, { status: 500 });
  }
}
