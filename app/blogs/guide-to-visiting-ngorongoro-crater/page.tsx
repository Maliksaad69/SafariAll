import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NgorongoroBlogPage() {
  return (
    <div className="min-h-screen bg-[#f6f3ee] text-[#2d1a12]">
      <Navbar />

      <main className="mx-auto max-w-[900px] px-4 py-10 sm:px-6 lg:px-0">
        <div className="mb-5">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-[#2e6a64]">
            <ArrowLeft className="h-4 w-4" />
            Back to blog
          </Link>
        </div>

        <article className="rounded-[18px] border border-[#d8d1c8] bg-white p-7 shadow-sm md:p-10">
          <div className="mb-4 inline-flex items-center rounded-full bg-[#f4e7c5] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#b58927]">
            Parks & Wildlife
          </div>
          <h1 className="text-[2.5rem] font-bold tracking-[-0.04em] text-[#1e1a18]" style={{ fontFamily: 'Georgia, serif' }}>
            Guide to Visiting Ngorongoro Crater
          </h1>

          <p className="mt-5 text-sm leading-relaxed text-[#5a4e46]">
            Ngorongoro Crater is one of the best places in East Africa for seeing a dense concentration of animals in a single day. It combines dramatic scenery with a remarkable level of wildlife activity.
          </p>

          <div className="mt-8 space-y-5 text-sm leading-relaxed text-[#5a4e46]">
            <p>
              A full day in the crater usually starts early, with a guided drive down onto the crater floor before the heat rises. The road network is fairly easy to navigate, though it is best to keep your expectations flexible as wildlife movements can shift each day.
            </p>
            <p>
              Most visitors focus on the central areas where the highest concentration of rhinos, elephants, buffalo, and lion activity can be seen. Sunrises and late afternoons are often the best times for spotting predators, while midday still offers rich grazing and birdlife.
            </p>
            <p>
              It is worth planning ahead for permits, timing, and whether you want a private vehicle or a shared safari transfer. A well-paced day with an experienced guide is often the difference between a rushed drive and a truly memorable experience.
            </p>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
