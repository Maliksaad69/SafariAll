import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TourCard from '@/components/TourCard';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Sun, Calendar, ShieldCheck, ArrowRight, Award, Compass } from 'lucide-react';

interface ParkDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ParkDetailPage({ params }: ParkDetailPageProps) {
  const { slug } = await params;

  const park = await prisma.destination.findUnique({
    where: { slug },
    include: {
      tours: {
        include: {
          tour: {
            include: {
              operator: true,
              destinations: {
                include: { destination: true },
              },
            },
          },
        },
      },
    },
  });

  if (!park) {
    notFound();
  }

  const bestMonths = (park.bestTimeToVisit as Record<string, string>) || {};
  const animals = (park.wildlifePresent as string[]) || [];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F0] text-[#2C221E]">
      <Navbar />

      {/* Hero Header */}
      <section className="relative bg-[#1C2826] text-white py-14 border-b border-[#2C3E3B] overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-15 pointer-events-none" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1800&q=80')` }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-[#D4A373] text-[#1C2826] text-xs font-bold rounded-full">
              {park.country}
            </span>
            <span className="px-3 py-1 bg-white/10 text-[#E9C46A] text-xs font-bold rounded-full backdrop-blur-sm border border-white/10">
              {park.type.replace('_', ' ')}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold font-serif text-white">
            {park.name}
          </h1>

          <p className="text-sm text-gray-300 max-w-3xl leading-relaxed">
            {park.description}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        
        {/* 12-Month Best Time to Visit Visual Chart */}
        <div className="bg-white p-8 rounded-3xl border border-[#E5E0D8] shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-xl font-bold font-serif text-[#1C2826] flex items-center gap-2">
                <Sun className="w-5 h-5 text-[#C85A17]" />
                Best Time to Visit & Wildlife Sightings
              </h3>
              <p className="text-xs text-gray-500 mt-1">Monthly game viewing condition ratings for {park.name}</p>
            </div>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2 text-center">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((monthStr, idx) => {
              const key = monthStr.toLowerCase();
              const rating = bestMonths[key] || 'GOOD';
              
              let badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
              if (rating === 'EXCELLENT') badgeColor = 'bg-amber-100 text-amber-900 border-amber-400 font-bold';
              if (rating === 'FAIR') badgeColor = 'bg-gray-100 text-gray-700 border-gray-200';

              return (
                <div key={idx} className="p-3 rounded-2xl border border-gray-200 bg-[#FAF7F0] space-y-1.5">
                  <span className="block text-xs font-bold uppercase text-gray-500">{monthStr}</span>
                  <span className={`block text-[10px] px-1.5 py-0.5 rounded-full border ${badgeColor}`}>
                    {rating}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Wildlife Presence Grid */}
        <div className="bg-white p-8 rounded-3xl border border-[#E5E0D8] shadow-sm space-y-6">
          <h3 className="text-xl font-bold font-serif text-[#1C2826] flex items-center gap-2">
            <Award className="w-5 h-5 text-[#C85A17]" />
            Wildlife & Animal Checklist
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {animals.map((animal, i) => (
              <div key={i} className="p-4 rounded-2xl bg-[#FAF7F0] border border-[#E5E0D8] flex items-center gap-3">
                <span className="text-xl">🦁</span>
                <span className="text-xs font-bold text-[#1C2826]">{animal}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Safari Tours Visiting This Park */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-4">
            <h3 className="text-2xl font-bold font-serif text-[#1C2826]">
              Safaris Visiting {park.name}
            </h3>
            <Link href="/tours" className="text-xs font-bold text-[#C85A17] hover:underline">
              View All Tours
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {park.tours.map((item) => (
              <TourCard key={item.tour.id} tour={item.tour} />
            ))}
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
