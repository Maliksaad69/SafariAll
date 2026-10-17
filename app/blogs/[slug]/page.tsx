import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { MapPin, Calendar, Users, Eye, ArrowLeft, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getPost(slug: string) {
  const post = await prisma.blogPost.findUnique({
    where: { slug },
    include: {
      operator: {
        include: {
          tours: {
            where: { isPublished: true },
            take: 4,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              title: true,
              slug: true,
              durationDays: true,
              durationNights: true,
              minPriceUsd: true,
              comfortLevel: true,
              tourType: true,
              primaryCountry: true,
            },
          },
        },
      },
      author: true,
    },
  });
  if (!post) return null;

  await prisma.blogPost.update({
    where: { id: post.id },
    data: { viewCount: { increment: 1 } },
  });

  return post;
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const operator = post.operator;
  const tours = operator.tours || [];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--canvas)] text-[var(--ink)]">
      <Navbar />

      {/* Top Breadcrumb Bar */}
      <div className="border-b border-black/5 py-2.5 text-xs text-[var(--ink-muted)] bg-[var(--canvas)]/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:text-[var(--brand)] transition-colors">Home</Link>
          <span className="text-[var(--ink-muted)] opacity-60">/</span>
          <Link href="/blog" className="hover:text-[var(--brand)] transition-colors">Journal</Link>
          <span className="text-[var(--ink-muted)] opacity-60">/</span>
          <span className="text-[var(--ink)] font-medium truncate max-w-xs">{post.title}</span>
        </div>
      </div>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--brand)] hover:text-[var(--brand-deep)] transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to all stories
        </Link>

        <article>
          {post.coverImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.coverImageUrl} alt={post.title} className="w-full rounded-3xl mb-8 shadow-md object-cover max-h-[460px] border border-black/5" />
          )}

          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full bg-[var(--brand-soft)] text-[var(--brand-deep)] text-xs font-semibold border border-[var(--brand-pale)]">{post.tag || 'Travel Guides'}</span>
            <span className="text-xs text-[var(--ink-muted)]">{new Date(post.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            <span className="inline-flex items-center gap-1 text-xs text-[var(--ink-muted)]"><Eye className="h-3.5 w-3.5"/> {post.viewCount} reads</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-[var(--brand-deep)] leading-tight mb-4">{post.title}</h1>
          {post.excerpt && <p className="text-base sm:text-lg text-[var(--ink-muted)] mb-8 leading-relaxed font-light">{post.excerpt}</p>}

          <div className="flex items-center justify-between flex-wrap gap-4 pb-6 border-b border-black/5 mb-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--brand-soft)] text-[var(--brand-deep)] font-bold text-base shadow-sm">
                {post.author.firstName?.[0] || post.operator.companyName?.[0] || 'S'}
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--ink)]">{post.author.firstName} {post.author.lastName}</p>
                <div className="text-xs text-[var(--ink-muted)]">
                  Published by <strong className="text-[var(--ink)]">{post.operator.companyName}</strong>
                  {operator.isVerified && <span className="ml-1.5 inline-flex items-center gap-0.5 text-emerald-600 font-semibold"><ShieldCheck className="h-3.5 w-3.5 inline" /> Verified</span>}
                </div>
              </div>
            </div>
            <Link
              href={`/operators/${post.operator.slug}`}
              className="btn btn-secondary text-xs px-4 py-2 rounded-xl"
            >
              Agency Profile <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </div>

          <div className="prose prose-safari max-w-none text-[var(--ink)]/85 leading-relaxed mb-12">
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>

          {/* Agency safari packages showcase */}
          {tours.length > 0 && (
            <section className="my-12 rounded-3xl surface-card border border-black/5 p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--brand)]">
                    <Sparkles className="h-3.5 w-3.5" /> Recommended Itineraries
                  </div>
                  <h2 className="text-2xl font-bold font-display text-[var(--brand-deep)] mt-1">
                    Safari Packages by {operator.companyName}
                  </h2>
                  <p className="text-xs text-[var(--ink-muted)] mt-1">
                    Ready to turn this story into your next adventure? Explore and book their packages below:
                  </p>
                </div>
                <Link
                  href={`/operators/${operator.slug}`}
                  className="btn btn-secondary text-xs px-4 py-2 rounded-xl shrink-0"
                >
                  View All Packages <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tours.map((t) => (
                  <div key={t.id} className="rounded-2xl border border-black/5 p-5 bg-[var(--sand)]/50 hover:border-[var(--brand)]/30 transition-all flex flex-col justify-between shadow-sm">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="badge badge-brand text-[10px]">{t.primaryCountry}</span>
                        <span className="text-xs font-semibold text-[var(--ink-muted)]">{t.durationDays}D / {t.durationNights}N</span>
                      </div>
                      <h3 className="font-bold text-[var(--brand-deep)] text-base line-clamp-2">
                        <Link href={`/tours/${t.slug}`} className="hover:text-[var(--brand)] transition-colors">
                          {t.title}
                        </Link>
                      </h3>
                      <div className="mt-1 text-xs text-[var(--ink-muted)]">
                        Comfort: {t.comfortLevel?.replace('_', ' ') || 'Mid-range'} · {t.tourType || 'Private'}
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] uppercase font-semibold text-[var(--ink-muted)]">From</div>
                        <div className="text-lg font-bold text-emerald-700">${t.minPriceUsd.toLocaleString()} <span className="text-xs font-normal text-[var(--ink-muted)]">/ pp</span></div>
                      </div>
                      <Link
                        href={`/tours/${t.slug}`}
                        className="btn btn-primary text-xs px-3.5 py-2 rounded-xl"
                      >
                        Book Package <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* About Author Agency */}
          <div className="pt-8 border-t border-black/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base font-display text-[var(--brand-deep)]">About {operator.companyName}</h3>
              <p className="text-xs text-[var(--ink-muted)] mt-1">
                {operator.headquartersAddress ? `${operator.headquartersAddress} · ` : ''}{operator.countryOfOrigin}
                {operator.yearEstablished ? ` · Operating since ${operator.yearEstablished}` : ''}
              </p>
            </div>
            <Link
              href={`/operators/${post.operator.slug}`}
              className="btn btn-secondary text-xs px-4 py-2.5 rounded-xl shrink-0"
            >
              <MapPin className="h-3.5 w-3.5 mr-1 text-[var(--brand)]"/> Contact {operator.companyName}
            </Link>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
