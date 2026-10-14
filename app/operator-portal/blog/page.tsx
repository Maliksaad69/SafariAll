import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { PlusCircle, Newspaper, Eye, Pencil, Trash2 } from 'lucide-react';
import BlogPostActions from '@/components/BlogPostActions';

export const dynamic = 'force-dynamic';

export default async function AgencyBlogPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  if (session.role === 'TRAVELER') redirect('/dashboard');

  let operatorId = session.operatorId;
  if (!operatorId && session.role === 'OPERATOR') {
    const op = await prisma.operator.findUnique({ where: { userId: session.userId } });
    operatorId = op?.id;
  }

  const posts = operatorId
    ? await prisma.blogPost.findMany({
        where: { operatorId },
        orderBy: { createdAt: 'desc' },
      })
    : [];

  const operatorName = session.companyName ?? session.name;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--surface-page)] text-[var(--ink-body)]">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="badge badge-on-dark mb-2">Agency Portal</span>
            <h1 className="text-3xl font-bold text-[var(--ink)]" style={{ fontFamily: 'var(--font-display), Georgia, serif' }}>
              Your Stories & Marketing
            </h1>
            <p className="mt-1 text-sm text-[var(--ink-secondary)] max-w-xl">
              Publish articles about your routes and wildlife encounters. Travelers read these stories to choose the right agency for their trip.
            </p>
          </div>
          <Link href="/operator-portal/blog/new" className="btn btn-primary shrink-0">
            <PlusCircle className="h-4 w-4" /> Write New Story
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="surface-card px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand-soft)] text-[var(--brand)]">
              <Newspaper className="h-7 w-7" />
            </div>
            <p className="text-base font-bold text-[var(--ink)]">No stories yet</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-[var(--ink-secondary)]">
              Agencies that publish stories get more booking requests. Share your best routes, sightings and traveler moments.
            </p>
            <Link href="/operator-portal/blog/new" className="btn btn-primary mt-5">
              <PlusCircle className="h-4 w-4" /> Write your first story
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {posts.map((post) => (
              <li key={post.id} className="surface-card flex flex-col sm:flex-row sm:items-center gap-4 p-5">
                {post.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.coverImageUrl} alt="" className="h-20 w-full sm:w-32 shrink-0 rounded-lg object-cover" />
                ) : (
                  <div className="flex h-20 w-full sm:w-32 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-sunk)] text-[var(--ink-muted)]">
                    <Newspaper className="h-6 w-6" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {post.tag && <span className="badge badge-brand">{post.tag}</span>}
                    <span className={`badge ${post.status === 'PUBLISHED' ? 'badge-success' : 'badge-warning'}`}>
                      {post.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                    </span>
                    {post.status === 'PUBLISHED' && (
                      <Link href={`/blogs/${post.slug}`} className="link inline-flex items-center gap-1 text-[11px] font-semibold">
                        <Eye className="h-3 w-3" /> View live
                      </Link>
                    )}
                  </div>
                  <h2 className="mt-1 truncate text-base font-bold text-[var(--ink)]">{post.title}</h2>
                  {post.excerpt && <p className="mt-0.5 line-clamp-2 text-xs text-[var(--ink-secondary)]">{post.excerpt}</p>}
                  <p className="mt-1 text-[11px] text-[var(--ink-muted)]">
                    {post.viewCount} views · Updated {new Date(post.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link href={`/operator-portal/blog/${post.id}`} className="btn btn-sm btn-secondary">
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Link>
                  <BlogPostActions postId={post.id} title={post.title} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>

      <Footer />
    </div>
  );
}
