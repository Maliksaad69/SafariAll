import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Compass, Search, Calendar, MapPin, MessageSquare, ShieldCheck, ArrowRight } from 'lucide-react';

export default async function TravelerDashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  if (session.role === 'OPERATOR') {
    redirect('/operator-portal');
  }

  if (session.role === 'ADMIN') {
    redirect('/admin');
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F0] text-[#2C221E]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Welcome Header */}
        <div className="bg-[#1C2826] rounded-3xl p-8 sm:p-10 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center opacity-10 pointer-events-none" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1800&q=80')` }} />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#E9C46A] text-xs font-bold uppercase tracking-wider mb-3 backdrop-blur-sm border border-white/10">
              <Compass className="w-4 h-4" />
              Traveler Account
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold font-serif">
              Jambo, {session.name}! 👋
            </h1>
            <p className="text-sm text-gray-300 mt-2 max-w-xl">
              Track your submitted safari quote requests, review proposals from verified African operators, and plan your dream wildlife itinerary.
            </p>
          </div>

          <Link
            href="/tours"
            className="relative z-10 inline-flex items-center gap-2 px-6 py-3.5 bg-[#C85A17] hover:bg-[#a6470e] text-white font-bold text-sm rounded-xl shadow-lg transition-all"
          >
            <Search className="w-4 h-4" />
            Explore Safaris
          </Link>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-[#E5E0D8] shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#C85A17]/10 text-[#C85A17] flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-[#1C2826]">My Active Quote Requests</h3>
            <p className="text-xs text-gray-500">You currently have 0 active broadcast inquiries.</p>
            <Link href="/quote/request" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C85A17] hover:underline pt-2">
              Request Custom Quote <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#E5E0D8] shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#1C2826]/10 text-[#1C2826] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#1C2826]" />
            </div>
            <h3 className="font-bold text-lg text-[#1C2826]">Verified Operators</h3>
            <p className="text-xs text-gray-500">Connect directly with licensed African travel agencies.</p>
            <Link href="/operators" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1C2826] hover:underline pt-2">
              Browse Directory <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#E5E0D8] shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#E9C46A]/20 text-[#C85A17] flex items-center justify-center">
              <MapPin className="w-5 h-5 text-[#C85A17]" />
            </div>
            <h3 className="font-bold text-lg text-[#1C2826]">National Parks Guide</h3>
            <p className="text-xs text-gray-500">Discover Serengeti, Masai Mara, Kruger & Bwindi.</p>
            <Link href="/parks" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C85A17] hover:underline pt-2">
              Explore Parks <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
