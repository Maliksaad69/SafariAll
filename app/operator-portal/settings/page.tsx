import { redirect } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import OperatorAgencySettingsView from '@/components/OperatorAgencySettingsView';
import { parseNameRequest } from '@/lib/name-requests';
import { ChevronRight, Settings, ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function OperatorAgencySettingsPage() {
  const session = await getSession();

  if (!session || (session.role !== 'OPERATOR' && session.role !== 'ADMIN')) {
    redirect('/login');
  }

  // Resolve operator profile
  let operator = null;
  if (session.operatorId) {
    operator = await prisma.operator.findUnique({
      where: { id: session.operatorId },
      include: {
        user: { select: { firstName: true, lastName: true, email: true, phone: true } },
        _count: { select: { tours: true, vehicles: true, reservations: true } },
      },
    });
  }

  if (!operator) {
    operator = await prisma.operator.findUnique({
      where: { userId: session.userId },
      include: {
        user: { select: { firstName: true, lastName: true, email: true, phone: true } },
        _count: { select: { tours: true, vehicles: true, reservations: true } },
      },
    });
  }

  if (!operator && session.role === 'ADMIN') {
    operator = await prisma.operator.findFirst({
      include: {
        user: { select: { firstName: true, lastName: true, email: true, phone: true } },
        _count: { select: { tours: true, vehicles: true, reservations: true } },
      },
    });
  }

  if (!operator) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--surface-page)] text-[var(--ink-body)]">
        <Navbar />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
          <h1 className="text-2xl font-bold font-display text-[var(--brand-deep)]">No Operator Profile Found</h1>
          <p className="text-sm text-[var(--ink-muted)]">
            Your user account is not currently linked to an active tour operator profile.
          </p>
          <Link href="/operator-portal" className="btn btn-primary inline-flex">
            Return to Agency Portal
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--surface-page)] text-[var(--ink-body)]">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between text-xs text-[var(--ink-muted)]">
          <div className="flex items-center gap-2">
            <Link href="/operator-portal" className="hover:text-[var(--brand-deep)] flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Portal</span>
            </Link>
            <ChevronRight className="w-3 h-3 text-[var(--ink-subtle)]" />
            <span className="font-semibold text-[var(--ink-body)]">Agency Profile & Settings</span>
          </div>

          <Link
            href={`/operators/${operator.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-[var(--brand-deep)] hover:underline inline-flex items-center gap-1"
          >
            <span>View Public Profile</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Header Title */}
        <div className="surface-dark p-6 sm:p-8 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="badge badge-on-dark text-xs font-bold uppercase tracking-wider">Agency Management</span>
              {operator.isVerified && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-200 border border-emerald-400/40">
                  Verified
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-white">
              {operator.companyName}
            </h1>
            <p className="text-xs sm:text-sm text-white/80 max-w-xl">
              Update your agency name, headquarters, operational countries, price tier, brand images, and primary contact details.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            <Link href="/operator-portal" className="btn btn-secondary text-xs">
              Dashboard
            </Link>
          </div>
        </div>

        {/* Agency Settings Editor */}
        <OperatorAgencySettingsView
          initialOperator={operator}
          initialNameRequest={parseNameRequest(operator.serviceSummary)}
        />
      </main>

      <Footer />
    </div>
  );
}
