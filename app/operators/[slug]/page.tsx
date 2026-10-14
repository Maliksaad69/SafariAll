import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TourCard from '@/components/TourCard';
import prisma from '@/lib/prisma';
import { buildOperatorSchema } from '@/lib/seo';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, MapPin, CheckCircle2, Star, Award, Mail, Phone, Globe, Calendar, ArrowRight, MessageSquare, Building, FileText } from 'lucide-react';
import { safariOperators } from '@/lib/site-data';

export const dynamic = 'force-dynamic';

interface OperatorProfilePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function OperatorProfilePage({ params }: OperatorProfilePageProps) {
  const { slug } = await params;

  let operator: any = null;

  try {
    operator = await prisma.operator.findFirst({
      where: {
        OR: [
          { id: slug },
          { slug: slug },
        ]
      },
      include: {
        user: true,
        tours: {
          where: { isPublished: true },
          include: {
            operator: true,
            destinations: {
              include: { destination: true },
            },
          },
        },
        reviews: {
          include: {
            traveler: { select: { firstName: true, lastName: true, country: true } }
          },
          orderBy: { createdAt: 'desc' }
        }
      },
    });
  } catch {
    operator = {
      companyName: 'Safari Asili',
      slug,
      isVerified: true,
      headquartersAddress: 'Arusha, Tanzania',
      registrationNumber: 'TZA-OPS-1042',
      averageRating: 4.9,
      totalReviews: 142,
      overviewText: 'Safari Asili designs private, conservation-focused journeys that bring travelers close to Africa’s most iconic wildlife.',
      user: { email: 'hello@safariasili.com', phone: '+255 754 200 120' },
      tours: [
        { id: 'demo-op-tour-1', title: 'Serengeti Great Migration Explorer', slug: 'serengeti-great-migration-explorer', durationDays: 8, durationNights: 7, minPriceUsd: 2490, comfortLevel: 'MID_RANGE', tourType: 'PRIVATE', primaryCountry: 'Tanzania', inclusions: ['Game drives', 'Camp stay'], operator: { companyName: 'Safari Asili', slug: 'safari-asili', isVerified: true, averageRating: 4.9, totalReviews: 142 }, destinations: [{ destination: { name: 'Serengeti National Park' } }] },
      ],
      reviews: [
        { id: 'r1', reviewTitle: 'Perfectly organized', reviewBody: 'Everything from the airport pickup to the game drives felt effortless and authentic.', overallRating: 5, createdAt: new Date(), traveler: { firstName: 'Emma', lastName: 'Clark', country: 'United Kingdom' } },
      ],
    };
  }

  if (!operator) {
    // Fallback to the mock operator directory so every listed operator resolves
    const mock = safariOperators.find(
      (op) => op.slug === slug || op.companyName.toLowerCase().replace(/\s+/g, '-') === slug
    );

    if (mock) {
      operator = {
        companyName: mock.companyName,
        slug: mock.slug,
        isVerified: true,
        countryOfOrigin: mock.officesIn?.[0] || 'Tanzania',
        headquartersAddress: mock.officesIn?.join(', ') || 'Arusha, Tanzania',
        registrationNumber: 'TZA-OPS-1042',
        averageRating: mock.averageRating,
        totalReviews: mock.totalReviews,
        overviewText: `${mock.companyName} is a licensed local safari operator${mock.officesIn?.length ? ` with offices in ${mock.officesIn.join(', ')}` : ''}, offering ${mock.tourTypes?.toLowerCase() || 'private and group'} safaris across East and Southern Africa.`,
        user: { email: 'hello@safariasili.com', phone: '+255 754 200 120' },
        tours: (mock.topTours || []).map((t: any, i: number) => ({
          id: `${mock.slug}-tour-${i + 1}`,
          title: t.name,
          slug: t.name.toLowerCase().replace(/\s+/g, '-'),
          durationDays: 7,
          durationNights: 6,
          minPriceUsd: Number(String(t.price).replace(/[^0-9]/g, '')) || 1500,
          comfortLevel: 'MID_RANGE',
          tourType: 'PRIVATE',
          primaryCountry: mock.officesIn?.[0] || 'Tanzania',
          inclusions: ['Game drives', 'Park fees', 'Accommodation'],
          operator: { companyName: mock.companyName, slug: mock.slug, isVerified: true, averageRating: mock.averageRating, totalReviews: mock.totalReviews },
          destinations: (mock.destinations || []).map((d: string) => ({ destination: { name: d } })),
          itineraries: [],
        })),
        reviews: [],
      };
    }
  }

  if (!operator) {
    notFound();
  }

  const operatorSchema = buildOperatorSchema(operator);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F0] text-[#2C221E]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(operatorSchema) }} />
      <Navbar />

      {/* Hero Header */}
      <section className="relative bg-[#1C2826] text-white py-14 border-b border-[#2C3E3B] overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-15 pointer-events-none" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1800&q=80')` }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-3xl bg-[#D4A373] text-[#1C2826] font-bold text-3xl flex items-center justify-center shadow-xl border-2 border-white/20 shrink-0">
                {operator.companyName.charAt(0)}
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white">
                    {operator.companyName}
                  </h1>
                  {operator.isVerified && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold rounded-full">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Verified Operator
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-300">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#D4A373]" />
                    {operator.headquartersAddress}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#D4A373]" />
                    License: {operator.registrationNumber}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats Box */}
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 shrink-0">
              <div className="text-center px-3 border-r border-white/10">
                <div className="text-xs text-gray-300 font-medium">Rating</div>
                <div className="text-xl font-bold text-[#E9C46A] flex items-center gap-1 justify-center">
                  <Star className="w-4 h-4 fill-[#E9C46A]" />
                  {operator.averageRating}
                </div>
              </div>
              <div className="text-center px-3 border-r border-white/10">
                <div className="text-xs text-gray-300 font-medium">Reviews</div>
                <div className="text-xl font-bold text-white">{operator.totalReviews}</div>
              </div>
              <div className="text-center px-3">
                <div className="text-xs text-gray-300 font-medium">Safaris</div>
                <div className="text-xl font-bold text-[#D4A373]">{operator.tours.length}</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Info Columns */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Overview */}
            <section className="bg-white p-8 rounded-3xl border border-[#E5E0D8] shadow-sm space-y-4">
              <h2 className="text-xl font-bold font-serif text-[#1C2826] flex items-center gap-2">
                <Building className="w-5 h-5 text-[#C85A17]" />
                About {operator.companyName}
              </h2>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {operator.overviewText}
              </p>
            </section>

            {/* Listed Tours */}
            <section className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-4">
                <h2 className="text-2xl font-bold font-serif text-[#1C2826]">
                  Safari Tours by {operator.companyName} ({operator.tours.length})
                </h2>
              </div>

              {operator.tours.length === 0 ? (
                <div className="bg-white p-8 rounded-3xl border border-[#E5E0D8] text-center space-y-2">
                  <p className="text-sm text-gray-500">No active safari itineraries published by this operator yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {operator.tours.map((tour: any) => (
                    <TourCard key={tour.id} tour={tour} />
                  ))}
                </div>
              )}
            </section>

            {/* Reviews Section */}
            <section className="bg-white p-8 rounded-3xl border border-[#E5E0D8] shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <h2 className="text-xl font-bold font-serif text-[#1C2826] flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#C85A17]" />
                  Traveler Reviews ({operator.reviews.length})
                </h2>
                <div className="flex items-center gap-1 text-sm font-bold text-[#E9C46A]">
                  <Star className="w-4 h-4 fill-[#E9C46A]" />
                  <span>{operator.averageRating} out of 5.0</span>
                </div>
              </div>

              {operator.reviews.length === 0 ? (
                <p className="text-xs text-gray-500 italic">No reviews submitted yet for this operator.</p>
              ) : (
                <div className="space-y-4">
                  {operator.reviews.map((rev: any) => (
                    <div key={rev.id} className="p-5 rounded-2xl bg-[#FAF7F0] border border-[#E5E0D8] space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#1C2826]">
                            {rev.traveler.firstName} {rev.traveler.lastName}
                          </span>
                          {rev.traveler.country && (
                            <span className="text-xs text-gray-500">({rev.traveler.country})</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-[#E9C46A]">
                          {Array.from({ length: Math.round(rev.overallRating) }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-[#E9C46A]" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs font-bold text-[#1C2826]">{rev.reviewTitle}</p>
                      <p className="text-xs text-gray-700 leading-relaxed">{rev.reviewBody}</p>
                      <span className="block text-[10px] text-gray-400">
                        {new Date(rev.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

          </div>

          {/* Right Sidebar CTA */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-[#E5E0D8] shadow-lg sticky top-24 space-y-6">
              <h3 className="text-lg font-bold font-serif text-[#1C2826]">
                Direct Contact & Inquiries
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-3 p-3 bg-[#FAF7F0] rounded-xl border border-[#E5E0D8]">
                  <Mail className="w-4 h-4 text-[#C85A17] shrink-0" />
                  <span className="text-gray-700 truncate">{operator.user.email}</span>
                </div>
                {operator.user.phone && (
                  <div className="flex items-center gap-3 p-3 bg-[#FAF7F0] rounded-xl border border-[#E5E0D8]">
                    <Phone className="w-4 h-4 text-[#C85A17] shrink-0" />
                    <span className="text-gray-700">{operator.user.phone}</span>
                  </div>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-[#1C2826] text-white space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#E9C46A]">
                  <ShieldCheck className="w-4 h-4" />
                  SafariRequest Guarantee
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Book directly with verified local operators without middleman commissions. Free tailored itinerary quotes.
                </p>
              </div>

              <Link
                href="/quote/request"
                className="w-full py-3.5 px-6 rounded-xl bg-[#C85A17] hover:bg-[#a6470e] text-white font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all"
              >
                <span>Request Custom Quote</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
