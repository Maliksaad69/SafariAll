import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import prisma from '@/lib/prisma';
import OperatorVerificationTable from '@/components/OperatorVerificationTable';
import { ShieldCheck, Users, Building2, MapPin, Award, CheckCircle2 } from 'lucide-react';

export default async function AdminPage() {
  const session = await getSession();

  if (!session || session.role !== 'ADMIN') {
    redirect('/login');
  }

  // Fetch metrics & operators
  const [totalUsers, totalOperators, totalTours, totalDestinations, operators] = await Promise.all([
    prisma.user.count(),
    prisma.operator.count(),
    prisma.tour.count(),
    prisma.destination.count(),
    prisma.operator.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        companyName: true,
        countryOfOrigin: true,
        registrationNumber: true,
        isVerified: true,
        averageRating: true,
        totalReviews: true,
      },
    }),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F0] text-[#2C221E]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Admin Header */}
        <div className="bg-[#1C2826] rounded-3xl p-8 sm:p-10 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center opacity-10 pointer-events-none" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1800&q=80')` }} />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#E9C46A] text-xs font-bold uppercase tracking-wider mb-3 backdrop-blur-sm border border-white/10">
              <ShieldCheck className="w-4 h-4 text-[#E9C46A]" />
              Platform Super-Admin Panel
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold font-serif">
              SafariAsili Control Center
            </h1>
            <p className="text-sm text-gray-300 mt-2 max-w-xl">
              Operator verification queue, review moderation, database health, and lead distribution engine.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-[#E5E0D8] shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase">Registered Users</p>
              <h3 className="text-2xl font-bold text-[#1C2826]">{totalUsers}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#E5E0D8] shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#E9C46A]/20 text-[#C85A17] flex items-center justify-center font-bold">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase">Tour Operators</p>
              <h3 className="text-2xl font-bold text-[#1C2826]">{totalOperators}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#E5E0D8] shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase">Safari Packages</p>
              <h3 className="text-2xl font-bold text-[#1C2826]">{totalTours}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#E5E0D8] shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-800 flex items-center justify-center font-bold">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase">National Parks</p>
              <h3 className="text-2xl font-bold text-[#1C2826]">{totalDestinations}</h3>
            </div>
          </div>
        </div>

        {/* Verification Queue Component */}
        <OperatorVerificationTable initialOperators={operators} />

      </main>

      <Footer />
    </div>
  );
}
