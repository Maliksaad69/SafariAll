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
    <div className="min-h-screen bg-[#f8f7f5] text-[#1d1a17]">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-10">
        <Link href="/blogs" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#5a544e] hover:text-[#1d1a17] transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to all blogs & stories
        </Link>

        <article className="mt-6">
          {post.coverImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.coverImageUrl} alt={post.title} className="w-full rounded-2xl mb-8 shadow-sm object-cover max-h-[460px]" />
          )}

          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="px-3 py-1 rounded-full bg-[#ffa54b15] text-[#b34a00] text-xs font-semibold">{post.tag || 'Travel Guides'}</span>
            <span className="text-xs text-[#5a544e]">{new Date(post.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            <span className="inline-flex items-center gap-1 text-xs text-[#5a544e]"><Eye className="h-3.5 w-3.5"/> {post.viewCount} reads</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold font-serif leading-tight mb-4">{post.title}</h1>
          {post.excerpt && <p className="text-lg text-[#5a544e] mb-6 leading-relaxed">{post.excerpt}</p>}

          <div className="flex items-center justify-between flex-wrap gap-4 pb-6 border-b border-[#e7e1d8] mb-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1c2826] text-white font-bold text-base shadow-sm">
                {post.author.firstName?.[0] || post.operator.companyName?.[0] || 'S'}
              </div>
              <div>
                <p className="text-sm font-bold text-[#1d1a17]">{post.author.firstName} {post.author.lastName}</p>
                <div className="text-xs text-[#5a544e]">
                  Published by <strong className="text-[#1d1a17]">{post.operator.companyName}</strong>
                  {operator.isVerified && <span className="ml-1.5 inline-flex items-center gap-0.5 text-emerald-700 font-semibold"><ShieldCheck className="h-3 w-3 inline" /> Verified Agency</span>}
                </div>
              </div>
            </div>
            <Link
              href={`/operators/${post.operator.slug}`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1c2826] hover:text-[#b34a00] transition"
            >
              Agency Profile <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="prose prose-safari max-w-none text-[#1d1a17] leading-relaxed mb-12">
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>

          {/* Agency safari packages showcase */}
          {tours.length > 0 && (
            <section className="my-12 rounded-2xl bg-white border border-[#e7e1d8] p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#b34a00]">
                    <Sparkles className="h-3.5 w-3.5" /> Recommended Itineraries
                  </div>
                  <h2 className="text-2xl font-bold font-serif text-[#1d1a17] mt-1">
                    Safari Packages by {operator.companyName}
                  </h2>
                  <p className="text-xs text-[#5a544e] mt-1">
                    Ready to turn this story into your next adventure? Explore and book their packages below:
                  </p>
                </div>
                <Link
                  href={`/operators/${operator.slug}`}
                  className="btn btn-secondary btn-sm shrink-0 inline-flex items-center gap-1"
                >
                  View All Packages <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tours.map((t) => (
                  <div key={t.id} className="rounded-xl border border-[#ede7de] p-4 bg-[#faf9f7] hover:border-[#b34a00] transition-colors flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="badge badge-brand text-[10px]">{t.primaryCountry}</span>
                        <span className="text-[11px] font-semibold text-[#5a544e]">{t.durationDays} Days / {t.durationNights} Nights</span>
                      </div>
                      <h3 className="font-bold text-[#1d1a17] text-base line-clamp-2">
                        <Link href={`/tours/${t.slug}`} className="hover:text-[#b34a00] transition-colors">
                          {t.title}
                        </Link>
                      </h3>
                      <div className="mt-1 text-xs text-[#736c64]">
                        Comfort: {t.comfortLevel?.replace('_', ' ') || 'Mid-range'} · {t.tourType || 'Private'}
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-[#e7e1d8] flex items-center justify-between">
                      <div>
                        <div className="text-[10px] uppercase font-semibold text-[#736c64]">Starting from</div>
                        <div className="text-lg font-bold text-emerald-800">${t.minPriceUsd.toLocaleString()} <span className="text-xs font-normal text-[#736c64]">/ person</span></div>
                      </div>
                      <Link
                        href={`/tours/${t.slug}`}
                        className="inline-flex items-center gap-1 rounded-lg bg-[#1c2826] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#2c3a38] transition-colors shadow-sm"
                      >
                        Book Package <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* About Author Agency */}
          <div className="pt-8 border-t border-[#e7e1d8] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base text-[#1d1a17]">About {operator.companyName}</h3>
              <p className="text-xs text-[#5a544e] mt-1">
                {operator.headquartersAddress ? `${operator.headquartersAddress} · ` : ''}{operator.countryOfOrigin}
                {operator.yearEstablished ? ` · Operating since ${operator.yearEstablished}` : ''}
              </p>
            </div>
            <Link
              href={`/operators/${post.operator.slug}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1c2826] text-white text-xs font-bold hover:bg-[#2c3a38] transition-colors shadow-sm shrink-0"
            >
              <MapPin className="h-4 w-4"/> Contact {operator.companyName}
            </Link>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
