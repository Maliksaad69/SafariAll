import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { ArrowRight, Newspaper } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  tag: string | null;
  viewCount: number;
  createdAt: string;
  operator: { companyName: string; slug: string };
}

async function getPosts(): Promise<Post[]> {
  try {
    const rows = await prisma.blogPost.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { createdAt: 'desc' },
      take: 24,
      include: { operator: { select: { companyName: true, slug: true } } },
    });
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      slug: r.slug,
      excerpt: r.excerpt,
      coverImageUrl: r.coverImageUrl,
      tag: r.tag,
      viewCount: r.viewCount,
      createdAt: r.createdAt.toISOString(),
      operator: r.operator,
    }));
  } catch {
    return [];
  }
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <div className="min-h-screen flex flex-col bg-[var(--canvas)] text-[var(--ink)]">
      <Navbar />

      {/* Top Breadcrumb Bar */}
      <div className="border-b border-black/5 py-2.5 text-xs text-[var(--ink-muted)] bg-[var(--canvas)]/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1.5">
          <Link href="/" className="hover:text-[var(--brand)] transition-colors">Home</Link>
          <span className="text-[var(--ink-muted)] opacity-60">/</span>
          <span className="text-[var(--ink)] font-medium">Safari Journal</span>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[var(--brand-deep)] text-white shadow-xl p-8 sm:p-14">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-overlay" 
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1800&q=80')" }} 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--brand-deep)] via-[var(--brand-deep)]/90 to-transparent" />
          <div className="relative max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1 text-xs font-semibold backdrop-blur-md text-[var(--brand-light)]">
              <Newspaper className="h-3.5 w-3.5 text-[var(--brand-light)]" />
              <span>Safari Journal</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display tracking-tight text-white mb-4 leading-tight">
              Latest safari stories and travel insights
            </h1>
            <p className="text-sm sm:text-base leading-relaxed text-white/85 font-light">
              Discover expert tips, destination guides, and wildlife inspiration from verified African operators and local safari naturalists.
            </p>
          </div>
        </section>

        {/* Agency story grid — real posts from operator accounts */}
        {posts.length > 0 && (
          <section className="mt-12">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-[var(--brand)] block">Dispatches</span>
                <h2 className="text-2xl font-bold font-display text-[var(--brand-deep)]">
                  Stories from Our Operators
                </h2>
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <article key={post.id} className="surface-card rounded-2xl border border-black/5 overflow-hidden shadow-sm hover:border-[var(--brand)]/30 hover:shadow-md transition-all flex flex-col justify-between">
                  <div>
                    <Link href={`/blogs/${post.slug}`} className="block overflow-hidden">
                      {post.coverImageUrl ? (
                        <img src={post.coverImageUrl} alt="" className="block h-48 w-full object-cover transition-transform duration-300 hover:scale-105" />
                      ) : (
                        <div className="flex h-48 w-full items-center justify-center bg-[var(--brand-soft)] text-4xl text-[var(--brand)]">📝</div>
                      )}
                    </Link>
                    <div className="p-6">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="rounded-full bg-[var(--brand-soft)] border border-[var(--brand-pale)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--brand-deep)]">
                          {post.tag || 'Travel Guides'}
                        </span>
                        <Link href={`/operators/${post.operator.slug}`} className="text-xs font-semibold text-[var(--ink-muted)] hover:text-[var(--brand)] transition-colors">
                          by {post.operator.companyName}
                        </Link>
                      </div>
                      <Link href={`/blogs/${post.slug}`}>
                        <h3 className="text-lg font-bold font-display text-[var(--brand-deep)] hover:text-[var(--brand)] transition-colors leading-snug line-clamp-2">
                          {post.title}
                        </h3>
                      </Link>
                      {post.excerpt && (
                        <p className="mt-2.5 line-clamp-3 text-xs sm:text-sm leading-relaxed text-[var(--ink-muted)]">{post.excerpt}</p>
                      )}
                    </div>
                  </div>
                  <div className="px-6 pb-6 pt-0 mt-auto border-t border-black/5 pt-4 flex items-center justify-between text-xs">
                    <span className="text-[var(--ink-muted)]">
                      {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <Link href={`/blogs/${post.slug}`} className="font-semibold text-[var(--brand)] hover:text-[var(--brand-deep)] inline-flex items-center gap-1 transition-colors">
                      <span>Read story</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {posts.length === 0 && (
          <p className="mt-12 text-sm text-[var(--ink-muted)]">No articles have been published yet.</p>
        )}
      </main>

      <Footer />
    </div>
  );
}
