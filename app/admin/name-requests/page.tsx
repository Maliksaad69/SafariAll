import { redirect } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import OperatorNameRequestsQueue, { AdminNameRequestItem } from '@/components/OperatorNameRequestsQueue';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { parseNameRequest } from '@/lib/name-requests';
import { parseTalaData } from '@/lib/tala-verification';
import { ShieldCheck, Building2, MessageSquare, ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminNameRequestsPage() {
  const session = await getSession();

  if (!session || session.role !== 'ADMIN') {
    redirect('/admin');
  }

  // Fetch operators to extract name requests
  const operators = await prisma.operator.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      companyName: true,
      slug: true,
      countryOfOrigin: true,
      registrationNumber: true,
      licenseDocumentUrl: true,
      isVerified: true,
      serviceSummary: true,
      user: {
        select: {
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
        },
      },
      _count: {
        select: {
          tours: true,
          vehicles: true,
          reservations: true,
        },
      },
    },
  });

  // Extract all name requests
  const requests: AdminNameRequestItem[] = [];
  let pendingNameCount = 0;
  let pendingTalaCount = 0;

  for (const op of operators) {
    // Check TALA pending
    if (!op.isVerified) {
      const tala = parseTalaData(op.serviceSummary, op.registrationNumber, op.licenseDocumentUrl, op.isVerified);
      if (tala.status === 'PENDING') pendingTalaCount++;
    }

    // Check Name Request
    const nr = parseNameRequest(op.serviceSummary);
    if (nr) {
      if (nr.status === 'PENDING') pendingNameCount++;
      requests.push({
        operatorId: op.id,
        currentCompanyName: op.companyName,
        slug: op.slug,
        countryOfOrigin: op.countryOfOrigin,
        registrationNumber: op.registrationNumber,
        isVerified: op.isVerified,
        user: op.user,
        _count: op._count,
        nameRequest: nr,
      });
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--canvas)] text-[var(--ink)]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header */}
        <div className="surface-dark rounded-3xl p-8 sm:p-10 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden border border-white/10">
          <div className="absolute inset-0 bg-cover bg-center opacity-15 pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1800&q=80')` }} />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-[var(--brand-light)] text-xs font-semibold uppercase tracking-wider mb-3 backdrop-blur-md border border-white/15">
              <Building2 className="w-4 h-4 text-[var(--brand-light)]" />
              <span>Platform Owner Governance</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold font-display tracking-tight text-white">
              Agency Name Change Requests
            </h1>
            <p className="text-sm text-white/85 mt-2 max-w-xl font-light">
              Tour operators cannot rename their agency without admin approval. Review requested legal rebrands, verify entity consistency, and accept or decline renames.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-3">
            <Link href="/admin" className="btn btn-secondary text-xs inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Control Center</span>
            </Link>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-3 border-b border-black/10 pb-3">
          <Link
            href="/admin"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-[#344C49] hover:bg-[#F7F6F1] border border-black/5 shadow-2xs flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-[var(--brand)]" />
            <span>TALA Agency Verifications</span>
            {pendingTalaCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-400 text-amber-950 font-black">
                {pendingTalaCount} new
              </span>
            )}
          </Link>

          <Link
            href="/admin/name-requests"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[var(--brand)] text-white shadow-sm flex items-center gap-2"
          >
            <Building2 className="w-4 h-4" />
            <span>Name Change Requests</span>
            {pendingNameCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-400 text-amber-950 font-black animate-pulse">
                {pendingNameCount} new
              </span>
            )}
          </Link>

          <Link
            href="/admin/reviews"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-[#344C49] hover:bg-[#F7F6F1] border border-black/5 shadow-2xs flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4 text-[var(--brand)]" />
            <span>Customer Review Moderation</span>
          </Link>
        </div>

        {/* Queue Component */}
        <OperatorNameRequestsQueue initialRequests={requests} />
      </main>

      <Footer />
    </div>
  );
}
