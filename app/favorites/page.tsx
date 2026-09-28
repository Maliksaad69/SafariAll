import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TourCard from '@/components/TourCard';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Heart, Search, ArrowRight, Compass } from 'lucide-react';

export default async function FavoritesPage() {
  let tours: any[] = [];

  try {
    const cookieStore = await cookies();
    const favCookie = cookieStore.get('safariasili_favorites')?.value || '[]';
    const favIds: string[] = JSON.parse(favCookie);

    tours = favIds.length > 0
      ? await prisma.tour.findMany({
          where: { id: { in: favIds } },
          include: {
            operator: true,
            destinations: { include: { destination: true } },
          },
        })
      : [];
  } catch {
    tours = [
      {
        id: 'demo-fav-1',
        title: '8-Day Mid-Range Great Migration Safari (July–October)',
        slug: '8-day-mid-range-great-migration-safari',
        durationDays: 8,
        durationNights: 7,
        minPriceUsd: 2859,
        comfortLevel: 'MID_RANGE',
        tourType: 'PRIVATE',
        primaryCountry: 'Tanzania',
        inclusions: ['Lodge & Tented Camp', 'Private tour', 'Mid-range'],
        operator: { companyName: 'Josh Dreamland Safari', slug: 'josh-dreamland', isVerified: true, averageRating: 4.9, totalReviews: 112 },
        destinations: [{ destination: { name: 'Arusha (Start)' } }, { destination: { name: 'Lake Manyara NP' } }],
      },
      {
        id: 'demo-fav-2',
        title: '9-Day Tanzania Budget Safari with Beach Holiday',
        slug: '9-day-tanzania-budget-safari',
        durationDays: 9,
        durationNights: 8,
        minPriceUsd: 1432,
        comfortLevel: 'BUDGET',
        tourType: 'GROUP',
        primaryCountry: 'Tanzania',
        inclusions: ['Camping & Hotel', 'Shared tour', 'Budget'],
        operator: { companyName: 'Go Serengeti African Tours', slug: 'go-serengeti', isVerified: true, averageRating: 4.9, totalReviews: 662 },
        destinations: [{ destination: { name: 'Arusha (Start)' } }, { destination: { name: 'South Serengeti NP' } }],
      },
    ];
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F0] text-[#2C221E]">
      <Navbar />

      {/* Hero Header */}
      <section className="relative bg-[#1C2826] text-white py-14 border-b border-[#2C3E3B] overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-15 pointer-events-none" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1800&q=80')` }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#E9C46A] text-xs font-bold uppercase tracking-wider backdrop-blur-sm border border-white/10">
            <Heart className="w-4 h-4 fill-[#E9C46A] text-[#E9C46A]" />
            Saved Shortlist
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold font-serif">
            My Favorite Safari Packages ({tours.length})
          </h1>
          <p className="text-sm text-gray-300 max-w-xl">
            Compare your bookmarked itineraries, analyze pricing, and request custom quotes directly from local operators.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {tours.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-[#E5E0D8] text-center space-y-4 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-[#FAF7F0] text-[#C85A17] mx-auto flex items-center justify-center border border-[#E5E0D8]">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold font-serif text-[#1C2826]">Your Shortlist is Empty</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Explore our safari packages across Serengeti, Masai Mara, Kruger, and Bwindi and click the heart icon to save your favorites.
            </p>
            <Link
              href="/tours"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#C85A17] hover:bg-[#a6470e] text-white text-xs font-bold rounded-xl shadow-md transition-all"
            >
              <Compass className="w-4 h-4" />
              <span>Browse All Safaris</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tours.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
