import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tag = searchParams.get('tag');
  const mine = searchParams.get('mine');

  try {
    if (mine) {
      const session = await getSession();
      if (!session || (session.role !== 'OPERATOR' && session.role !== 'ADMIN')) {
        return NextResponse.json({ error: 'Operator authentication required.' }, { status: 401 });
      }
      let operatorId = session.operatorId;
      if (!operatorId) {
        const op = await prisma.operator.findUnique({ where: { userId: session.userId } });
        operatorId = op?.id;
      }
      if (!operatorId) return NextResponse.json({ posts: [] });

      const posts = await prisma.blogPost.findMany({
        where: { operatorId },
        orderBy: { createdAt: 'desc' },
        include: { operator: { select: { companyName: true, slug: true } } },
      });
      return NextResponse.json({ posts });
    }

    const posts = await prisma.blogPost.findMany({
      where: { status: 'PUBLISHED', ...(tag ? { tag } : {}) },
      orderBy: { createdAt: 'desc' },
      include: { operator: { select: { companyName: true, slug: true } } },
    });
    return NextResponse.json({ posts });
  } catch (error: any) {
    console.error('Blog list error:', error);
    return NextResponse.json({ error: 'Failed to load blog posts.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || (session.role !== 'OPERATOR' && session.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Only agencies can publish stories.' }, { status: 401 });
  }

  try {
    let operatorId = session.operatorId;
    if (!operatorId) {
      const op = await prisma.operator.findUnique({ where: { userId: session.userId } });
      operatorId = op?.id;
    }
    if (!operatorId) {
      return NextResponse.json({ error: 'No agency profile linked to this account.' }, { status: 404 });
    }

    const body = await req.json();
    const { title, excerpt, content, tag, coverImageUrl, status } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required.' }, { status: 400 });
    }

    const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 80);
    let slug = baseSlug || 'post';
    let n = 1;
    while (await prisma.blogPost.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${++n}`;
    }

    const post = await prisma.blogPost.create({
      data: {
        operatorId,
        authorId: session.userId,
        title,
        slug,
        excerpt: excerpt || null,
        content,
        tag: tag || null,
        coverImageUrl: coverImageUrl || null,
        status: status === 'DRAFT' ? 'DRAFT' : 'PUBLISHED',
      },
    });

    return NextResponse.json({ success: true, post }, { status: 201 });
  } catch (error: any) {
    console.error('Blog post create error:', error);
    return NextResponse.json({ error: error.message || 'Failed to publish story.' }, { status: 500 });
  }
}
