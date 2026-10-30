import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { chatAccess } from '@/lib/chat';

/** Serve a chat attachment to the two people in that reservation's chat only. */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return new Response('Authentication required.', { status: 401 });
  const { id } = await params;
  const file = await prisma.messageAttachment.findUnique({ where: { id }, include: { message: { select: { reservationId: true } } } });
  if (!file || !(await chatAccess(session, file.message.reservationId))) return new Response('Not found.', { status: 404 });

  const download = new URL(req.url).searchParams.get('download') === '1' || !file.mimeType.startsWith('image/');
  return new Response(new Uint8Array(file.data), {
    headers: {
      'Content-Type': file.mimeType,
      'Content-Length': String(file.sizeBytes),
      'Content-Disposition': `${download ? 'attachment' : 'inline'}; filename="${encodeURIComponent(file.filename)}"`,
      'Cache-Control': 'private, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
