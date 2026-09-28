import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ArrowRight, Newspaper } from 'lucide-react';

const posts = [
  {
    title: 'Tanzania Safari Itinerary: How to Spend 7 to 10 Days',
    tag: 'Travel Guides',
    text: 'A practical plan for moving between Serengeti, Ngorongoro, Tarangire, and the coast to balance iconic wildlife with relaxed downtime.',
    href: '/blog/tanzania-safari-itinerary-7-to-10-days',
  },
  {
    title: 'Guide to Visiting Ngorongoro Crater',
    tag: 'Parks & Wildlife',
    text: 'How to plan a crater day, what to expect from the road network, and the best times for wildlife viewing at sunrise and dusk.',
    href: '/blog/guide-to-visiting-ngorongoro-crater',
  },
  {
    title: 'Survey Reveals the World’s Polite Tourists',
    tag: 'News & Insights',
    text: 'Global travel habits and etiquette trends are reshaping how safari operators tailor guest experiences and group itineraries.',
    href: '/blog/survey-reveals-the-worlds-polite-tourists',
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#f6f3ee] text-[#2d1a12]">
      <Navbar />

      <main className="mx-auto max-w-[1230px] px-4 py-10 sm:px-6 lg:px-0">
        <section className="rounded-[18px] border border-[#d8d1c8] bg-[#1f1712] p-7 shadow-[0_12px_28px_rgba(10,8,6,0.25)] md:p-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#f5d27a]/30 bg-[#f5d27a]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#f9d98a]">
            <Newspaper className="h-3.5 w-3.5" />
            Safari Journal
          </div>
          <h1 className="text-[2.5rem] font-bold tracking-[-0.04em] text-white" style={{ fontFamily: 'Georgia, serif' }}>Latest safari stories and travel ideas</h1>
          <p className="mt-3 max-w-[700px] text-sm leading-relaxed text-white">
            Discover expert tips, destination guides, and wildlife inspiration to help plan your next African safari adventure.
          </p>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-3">
          {posts.map((post) => (
            <article key={post.title} className="rounded-[16px] border border-[#d8d1c8] bg-white p-5 shadow-sm">
              <div className="rounded-[12px] border border-[#e8e0d8] bg-[#f5efe9] px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#b58927]">
                {post.tag}
              </div>
              <h2 className="mt-5 text-[1.8rem] font-bold leading-tight text-[#1e1a18]" style={{ fontFamily: 'Georgia, serif' }}>{post.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-[#5a4e46]">{post.text}</p>
              <Link href={post.href} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#2e6a64]">
                Read article
                <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
          ))}
        </section>
      </main>

      <Footer />
    </div>
  );
}
