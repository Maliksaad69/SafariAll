import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ShieldCheck, PlusCircle, Inbox, Award, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

export default async function OperatorPortalPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  if (session.role !== 'OPERATOR' && session.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F0] text-[#2C221E]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Welcome Banner */}
        <div className="bg-[#1C2826] rounded-3xl p-8 sm:p-10 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center opacity-10 pointer-events-none" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1800&q=80')` }} />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#E9C46A] text-xs font-bold uppercase tracking-wider mb-3 backdrop-blur-sm border border-white/10">
              <Award className="w-4 h-4 text-[#E9C46A]" />
              Tour Operator Lead Portal
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold font-serif">
              {session.companyName || session.name} Dashboard
            </h1>
            <p className="text-sm text-gray-300 mt-2 max-w-xl">
              Manage incoming traveler quote requests, create day-by-day tour itineraries, and respond with proposals.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-3">
            <Link
              href="/operator-portal/tours/new"
              className="inline-flex items-center gap-2 px-5 py-3 bg-[#C85A17] hover:bg-[#a6470e] text-white font-bold text-sm rounded-xl shadow-lg transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              Create Tour Package
            </Link>
          </div>
        </div>

        {/* Verification Status Banner */}
        <div className="bg-white p-6 rounded-3xl border border-[#E5E0D8] shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#1C2826] flex items-center gap-2">
                Operator Licensing Verified
                <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold">
                  ACTIVE
                </span>
              </h3>
              <p className="text-xs text-gray-500">Your agency is listed on the public operator directory and eligible for broadcast traveler leads.</p>
            </div>
          </div>

          <Link href="/operators" className="text-xs font-bold text-[#C85A17] hover:underline flex items-center gap-1">
            View Public Directory <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Lead Inbox Table Placeholder */}
        <div className="bg-white rounded-3xl border border-[#E5E0D8] shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-lg font-serif text-[#1C2826] flex items-center gap-2">
              <Inbox className="w-5 h-5 text-[#C85A17]" />
              Incoming Traveler Leads & Quote Requests
            </h3>
            <span className="text-xs font-bold text-gray-500 bg-[#FAF7F0] px-3 py-1 rounded-full border border-[#E5E0D8]">
              Live Feed
            </span>
          </div>

          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-[#FAF7F0] border border-[#E5E0D8] text-[#C85A17] mx-auto flex items-center justify-center">
              <Inbox className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-[#1C2826]">Your Lead Inbox is Ready</h4>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              When travelers request quotes for safaris in your country, their inquiries will appear here instantly for your team to reply.
            </p>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
