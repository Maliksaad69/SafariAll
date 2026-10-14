import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * Serve a stored image blob straight out of Postgres.
 *
 * The bytes live in `media_assets.data` (bytea); this route streams them with
 * the original content type so they can be used directly as <img src="/api/media/<id>">.
 * Responses are immutable — an asset's bytes never change, so it is safe to cache hard.
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const asset = await prisma.mediaAsset.findUnique({
      where: { id },
      select: { data: true, mimeType: true, filename: true },
    });

    if (!asset) {
      return NextResponse.json({ error: 'Image not found.' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const download = searchParams.get('download') === '1';
    const body = new Uint8Array(asset.data);

    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': asset.mimeType,
        'Content-Length': String(body.byteLength),
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Disposition': `${download ? 'attachment' : 'inline'}; filename="${asset.filename.replace(/"/g, '')}"`,
      },
    });
  } catch (error) {
    console.error('Media serve error:', error);
    return NextResponse.json({ error: 'Failed to load image.' }, { status: 500 });
  }
}
