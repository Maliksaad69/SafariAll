import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { ShieldCheck, MapPin, CheckCircle2, Star, Award, ArrowRight, Building2 } from 'lucide-react';

export default async function OperatorsPage() {
  const operators = await prisma.operator.findMany({
    orderBy: { averageRating: 'desc' },
    include: {
      tours: true,
    },
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F0] text-[#2C221E]">
      <Navbar />

      {/* Hero Header */}
      <section className="relative bg-[#1C2826] text-white py-14 border-b border-[#2C3E3B] overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-15 pointer-events-none" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1800&q=80')` }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#E9C46A] text-xs font-bold uppercase tracking-wider backdrop-blur-sm border border-white/10">
            <ShieldCheck className="w-4 h-4 text-[#E9C46A]" />
            100% Verified Local Operators
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold font-serif">
            African Tour Operator Directory
          </h1>
          <p className="text-sm text-gray-300 max-w-xl">
            Licensed, vetted local safari agencies in Tanzania, Kenya, South Africa, Uganda, and Botswana.
          </p>
        </div>
      </section>

      {/* Operator List */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {operators.map((op) => (
            <div key={op.id} className="bg-white rounded-3xl p-8 border border-[#E5E0D8] shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-6">
              
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#1C2826] text-[#D4A373] flex items-center justify-center font-bold text-xl shadow-inner shrink-0">
                      {op.companyName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#1C2826] flex items-center gap-2">
                        <Link href={`/operators/${op.id}`} className="hover:text-[#C85A17] transition-colors">
                          {op.companyName}
                        </Link>
                        {op.isVerified && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                      </h3>
                      <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-[#C85A17]" />
                        HQ: {op.headquartersAddress}
                      </span>
                    </div>
                  </div>

                  <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-lg shrink-0">
                    Verified License
                  </span>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                  {op.overviewText}
                </p>

                <div className="grid grid-cols-3 gap-2 bg-[#FAF7F0] p-3 rounded-2xl border border-[#E5E0D8] text-center">
                  <div>
                    <span className="block text-[10px] text-gray-400 font-bold uppercase">Rating</span>
                    <span className="text-sm font-bold text-[#E9C46A]">★ {op.averageRating}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-400 font-bold uppercase">Reviews</span>
                    <span className="text-sm font-bold text-[#1C2826]">{op.totalReviews}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-400 font-bold uppercase">Safaris Listed</span>
                    <span className="text-sm font-bold text-[#C85A17]">{op.tours.length}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-500 font-medium">License: {op.registrationNumber}</span>
                <Link
                  href={`/operators/${op.id}`}
                  className="px-5 py-2.5 bg-[#C85A17] hover:bg-[#a6470e] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <span>View Profile & Safaris</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
