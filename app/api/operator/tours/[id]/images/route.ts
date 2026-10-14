import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB per image
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];

async function resolveOperatorId(session: { operatorId?: string; userId: string }) {
  if (session.operatorId) return session.operatorId;
  const op = await prisma.operator.findUnique({ where: { userId: session.userId } });
  return op?.id ?? null;
}

/** Guard: the signed-in agency must own the package. */
async function assertOwnership(tourId: string) {
  const session = await getSession();
  if (!session || (session.role !== 'OPERATOR' && session.role !== 'ADMIN')) {
    return { error: NextResponse.json({ error: 'Agency authentication required.' }, { status: 401 }) };
  }
  const tour = await prisma.tour.findUnique({ where: { id: tourId }, select: { id: true, operatorId: true } });
  if (!tour) return { error: NextResponse.json({ error: 'Package not found.' }, { status: 404 }) };

  if (session.role === 'OPERATOR') {
    const operatorId = await resolveOperatorId(session);
    if (!operatorId || tour.operatorId !== operatorId) {
      return { error: NextResponse.json({ error: 'This package belongs to another agency.' }, { status: 403 }) };
    }
  }
  return { tour };
}

/** List image metadata (never the blobs) for a package. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const guard = await assertOwnership(id);
  if (guard.error) return guard.error;

  const images = await prisma.mediaAsset.findMany({
    where: { tourId: id },
    orderBy: [{ isCover: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'asc' }],
    select: {
      id: true,
      filename: true,
      mimeType: true,
      sizeBytes: true,
      altText: true,
      isCover: true,
      sortOrder: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    images: images.map((m) => ({
      ...m,
      createdAt: m.createdAt.toISOString(),
      url: `/api/media/${m.id}`,
    })),
  });
}

/** Upload one image, stored as a binary blob (bytea) in Postgres. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const guard = await assertOwnership(id);
  if (guard.error) return guard.error;

  try {
    const form = await req.formData();
    const file = form.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Attach an image file in the "file" field.' }, { status: 400 });
    }
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json(
        { error: `Unsupported format "${file.type || 'unknown'}". Use JPEG, PNG, WebP, AVIF or GIF.` },
        { status: 415 }
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: `"${file.name}" is ${(file.size / 1024 / 1024).toFixed(1)} MB — the limit is 5 MB per image.` },
        { status: 413 }
      );
    }
    if (file.size === 0) {
      return NextResponse.json({ error: 'That file is empty.' }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());

    const existing = await prisma.mediaAsset.count({ where: { tourId: id } });
    const last = await prisma.mediaAsset.findFirst({
      where: { tourId: id },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });

    const created = await prisma.mediaAsset.create({
      data: {
        tourId: id,
        filename: file.name || 'upload',
        mimeType: file.type,
        sizeBytes: bytes.length,
        data: bytes,
        altText: typeof form.get('altText') === 'string' ? (form.get('altText') as string) : null,
        // First upload becomes the cover automatically.
        isCover: existing === 0,
        sortOrder: (last?.sortOrder ?? -1) + 1,
      },
      select: { id: true, filename: true, mimeType: true, sizeBytes: true, isCover: true, sortOrder: true },
    });

    return NextResponse.json({ success: true, image: { ...created, url: `/api/media/${created.id}` } }, { status: 201 });
  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 });
  }
}

/** Delete an image, or flag one as the cover: ?imageId=…&action=cover */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const guard = await assertOwnership(id);
  if (guard.error) return guard.error;

  const { searchParams } = new URL(req.url);
  const imageId = searchParams.get('imageId');
  if (!imageId) return NextResponse.json({ error: 'imageId is required.' }, { status: 400 });

  const asset = await prisma.mediaAsset.findFirst({ where: { id: imageId, tourId: id } });
  if (!asset) return NextResponse.json({ error: 'Image not found on this package.' }, { status: 404 });

  const wasCover = asset.isCover;
  await prisma.mediaAsset.delete({ where: { id: asset.id } });

  // Promote the next image so a package never loses its cover.
  if (wasCover) {
    const next = await prisma.mediaAsset.findFirst({
      where: { tourId: id },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
    if (next) await prisma.mediaAsset.update({ where: { id: next.id }, data: { isCover: true } });
  }

  return NextResponse.json({ success: true });
}

/** Promote an image to cover: ?imageId=… */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const guard = await assertOwnership(id);
  if (guard.error) return guard.error;

  const { searchParams } = new URL(req.url);
  const imageId = searchParams.get('imageId');
  if (!imageId) return NextResponse.json({ error: 'imageId is required.' }, { status: 400 });

  const asset = await prisma.mediaAsset.findFirst({ where: { id: imageId, tourId: id } });
  if (!asset) return NextResponse.json({ error: 'Image not found on this package.' }, { status: 404 });

  await prisma.$transaction([
    prisma.mediaAsset.updateMany({ where: { tourId: id, isCover: true }, data: { isCover: false } }),
    prisma.mediaAsset.update({ where: { id: asset.id }, data: { isCover: true } }),
  ]);

  return NextResponse.json({ success: true });
}
