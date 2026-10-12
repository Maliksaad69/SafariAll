import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

async function resolveOperatorId(session: any): Promise<string | null> {
  if (session.operatorId) return session.operatorId;
  const op = await prisma.operator.findUnique({ where: { userId: session.userId } });
  return op?.id ?? null;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const post = await prisma.blogPost.findUnique({
      where: { id },
      include: { operator: { select: { companyName: true, slug: true } }, author: { select: { firstName: true, lastName: true } } },
    });
    if (!post) {
      return NextResponse.json({ error: 'Story not found.' }, { status: 404 });
    }
    return NextResponse.json({ post });
  } catch (error: any) {
    console.error('Blog post fetch error:', error);
    return NextResponse.json({ error: 'Failed to load story.' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || (session.role !== 'OPERATOR' && session.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Operator authentication required.' }, { status: 401 });
  }

  const { id } = await params;
  try {
    const post = await prisma.blogPost.findUnique({ where: { id } });
    if (!post) return NextResponse.json({ error: 'Story not found.' }, { status: 404 });

    if (session.role === 'OPERATOR') {
      const operatorId = await resolveOperatorId(session);
      if (post.operatorId !== operatorId) {
        return NextResponse.json({ error: 'This story belongs to another agency.' }, { status: 403 });
      }
    }

    const body = await req.json();
    const { title, excerpt, content, tag, coverImageUrl, status } = body;

    const updated = await prisma.blogPost.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(excerpt !== undefined && { excerpt: excerpt || null }),
        ...(content !== undefined && { content }),
        ...(tag !== undefined && { tag: tag || null }),
        ...(coverImageUrl !== undefined && { coverImageUrl: coverImageUrl || null }),
        ...(status !== undefined && { status: status === 'DRAFT' ? 'DRAFT' : 'PUBLISHED' }),
      },
    });

    return NextResponse.json({ success: true, post: updated });
  } catch (error: any) {
    console.error('Blog post update error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update story.' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || (session.role !== 'OPERATOR' && session.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Operator authentication required.' }, { status: 401 });
  }

  const { id } = await params;
  try {
    const post = await prisma.blogPost.findUnique({ where: { id } });
    if (!post) return NextResponse.json({ error: 'Story not found.' }, { status: 404 });

    if (session.role === 'OPERATOR') {
      const operatorId = await resolveOperatorId(session);
      if (post.operatorId !== operatorId) {
        return NextResponse.json({ error: 'This story belongs to another agency.' }, { status: 403 });
      }
    }

    await prisma.blogPost.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Blog post delete error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete story.' }, { status: 500 });
  }
}
