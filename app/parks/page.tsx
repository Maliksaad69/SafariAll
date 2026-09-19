import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { MapPin, Compass, ArrowRight, Sun } from 'lucide-react';

export default async function ParksPage() {
  const destinations = await prisma.destination.findMany({
    orderBy: { name: 'asc' },
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F0] text-[#2C221E]">
      <Navbar />

      {/* Hero Header */}
      <section className="relative bg-[#1C2826] text-white py-14 border-b border-[#2C3E3B] overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-15 pointer-events-none" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1800&q=80')` }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#E9C46A] text-xs font-bold uppercase tracking-wider backdrop-blur-sm border border-white/10">
            <Compass className="w-4 h-4" />
            African Wildlife Hub
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold font-serif">
            African National Parks & Game Reserves
          </h1>
          <p className="text-sm text-gray-300 max-w-xl leading-relaxed">
            Explore world-renowned safaris across Serengeti, Masai Mara, Ngorongoro Crater, Kruger, and Bwindi Impenetrable Forest.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinations.map((park) => {
            const animals = (park.wildlifePresent as string[]) || [];

            return (
              <div key={park.id} className="bg-white rounded-3xl overflow-hidden border border-[#E5E0D8] shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
                
                <div className="bg-gradient-to-r from-[#1C2826] to-[#2C3E3B] p-6 text-white relative">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 border border-white/10 text-[#E9C46A]">
                    {park.country}
                  </span>
                  <h3 className="text-2xl font-bold font-serif text-white mt-4 group-hover:text-[#E9C46A] transition-colors">
                    {park.name}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-gray-300 mt-2">
                    <MapPin className="w-3.5 h-3.5 text-[#C85A17]" />
                    <span>{park.type.replace('_', ' ')}</span>
                  </div>
                </div>

                <div className="p-6 space-y-6 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                    {park.description}
                  </p>

                  {/* Wildlife Badges */}
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Key Wildlife</span>
                    <div className="flex flex-wrap gap-1.5">
                      {animals.slice(0, 4).map((animal, i) => (
                        <span key={i} className="px-2.5 py-1 bg-[#FAF7F0] text-gray-700 text-[11px] font-medium rounded-lg border border-[#E5E0D8]">
                          🦁 {animal}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1C2826]">12-Month Sightings Guide</span>
                    <Link
                      href={`/parks/${park.slug}`}
                      className="px-4 py-2 rounded-xl bg-[#1C2826] hover:bg-[#C85A17] text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-sm"
                    >
                      <span>Explore Guide</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
