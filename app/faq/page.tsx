import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ChevronRight } from 'lucide-react';

const faqs = [
  {
    question: 'How do I choose the right safari style?',
    answer: 'Choose based on your travel budget, pace, and comfort level. Budget safaris focus on simple camps and shared logistics, while luxury options often include private vehicles, boutique lodges, and premium experiences.',
  },
  {
    question: 'Do I need a visa for my safari trip?',
    answer: 'Visa requirements vary by country and nationality. It is best to confirm entry requirements before traveling, and your chosen operator can also help advise on the right travel documents.',
  },
  {
    question: 'Is it better to book a private or shared safari?',
    answer: 'Private safaris offer more flexibility and personalized attention, while shared tours can be more affordable and social. The best option depends on your travel style and group size.',
  },
  {
    question: 'What is included in a safari package?',
    answer: 'Most packages include accommodation, park fees, game drives, and local transfers, but it varies by operator and itinerary. Always review the inclusions before confirming the booking.',
  },
  {
    question: 'Can I request a custom itinerary?',
    answer: 'Yes. Many operators can create a custom safari route based on your preferred destinations, duration, comfort level, and seasonal timing.',
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-[#f6f3ee] text-[#2d1a12]">
      <Navbar />

      <main className="mx-auto max-w-[980px] px-4 py-10 sm:px-6 lg:px-0">
        <section className="rounded-[18px] border border-[#d8d1c8] bg-[#1f1712] p-7 shadow-[0_12px_28px_rgba(10,8,6,0.25)] md:p-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#f5d27a]/30 bg-[#f5d27a]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#f9d98a]">
            FAQ
          </div>
          <h1 className="text-[2.5rem] font-bold tracking-[-0.04em] text-white" style={{ fontFamily: 'Georgia, serif' }}>
            Frequently asked safari questions
          </h1>
          <p className="mt-3 max-w-[700px] text-sm leading-relaxed text-white">
            Everything you need to know before planning your African safari trip.
          </p>
        </section>

        <section className="mt-8 space-y-4">
          {faqs.map((faq) => (
            <article key={faq.question} className="rounded-[14px] border border-[#d8d1c8] bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-[1.2rem] font-bold text-[#1d1a18]" style={{ fontFamily: 'Georgia, serif' }}>{faq.question}</h2>
                <ChevronRight className="mt-1 h-4 w-4 flex-shrink-0 text-[#b58927]" />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[#5a4e46]">{faq.answer}</p>
            </article>
          ))}
        </section>
      </main>

      <Footer />
    </div>
  );
}
