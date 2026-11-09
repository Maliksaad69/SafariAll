import { redirect } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { parseTalaData } from '@/lib/tala-verification';
import OperatorTalaVerificationView from '@/components/OperatorTalaVerificationView';
import { ChevronRight, ShieldCheck, ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function OperatorVerificationPage() {
  const session = await getSession();

  if (!session || (session.role !== 'OPERATOR' && session.role !== 'ADMIN')) {
    redirect('/login');
  }

  // Resolve operator
  let operator = null;
  if (session.operatorId) {
    operator = await prisma.operator.findUnique({
      where: { id: session.operatorId },
      include: { user: { select: { email: true, firstName: true, lastName: true } } },
    });
  }

  if (!operator) {
    operator = await prisma.operator.findUnique({
      where: { userId: session.userId },
      include: { user: { select: { email: true, firstName: true, lastName: true } } },
    });
  }

  if (!operator) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--surface-page)] text-[var(--ink-body)]">
        <Navbar />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
          <h1 className="text-2xl font-bold font-display text-[var(--brand-deep)]">No Operator Profile Found</h1>
          <p className="text-sm text-[var(--ink-muted)]">
            Your user account is not currently associated with a registered tour agency profile.
          </p>
          <Link href="/operator-portal" className="btn btn-primary inline-flex">
            Return to Agency Portal
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const initialTalaData = parseTalaData(
    operator.serviceSummary,
    operator.registrationNumber,
    operator.licenseDocumentUrl,
    operator.isVerified
  );

  return (
    <div className="min-h-screen flex flex-col bg-[var(--surface-page)] text-[var(--ink-body)]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-7">
        
        {/* Navigation Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-semibold text-[#516D6A]">
          <Link href="/operator-portal" className="hover:text-[var(--brand-deep)] flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Agency Portal</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          <span className="text-[var(--brand-deep)] font-bold">TALA Licensing &amp; Owner Verification</span>
        </div>

        {/* Page Header */}
        <div className="surface-dark rounded-3xl p-7 sm:p-9 text-white shadow-xl relative overflow-hidden border border-white/10">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-15 pointer-events-none mix-blend-overlay"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1800&q=80')`,
            }}
          />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-[var(--brand-light)] text-xs font-semibold uppercase tracking-wider mb-3 backdrop-blur-md border border-white/15">
                <ShieldCheck className="w-4 h-4 text-[var(--brand-light)]" />
                <span>Regulatory Compliance Center</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold font-display tracking-tight text-white">
                TALA Licensing &amp; Agency Verification
              </h1>
              <p className="text-sm text-white/90 mt-2 max-w-xl font-medium">
                Submit and manage your official Tourism Agency Licensing Authority (TALA) certificate.
                The platform owner directly inspects and certifies each agency to protect travelers.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/operator-portal" className="btn btn-secondary">
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Verification Form and Live Status Component */}
        <OperatorTalaVerificationView
          operatorId={operator.id}
          companyName={operator.companyName}
          countryOfOrigin={operator.countryOfOrigin}
          isVerified={operator.isVerified}
          verificationDate={operator.verificationDate ? operator.verificationDate.toISOString() : null}
          registrationNumber={operator.registrationNumber}
          licenseDocumentUrl={operator.licenseDocumentUrl}
          initialTalaData={initialTalaData}
        />

      </main>

      <Footer />
    </div>
  );
}
