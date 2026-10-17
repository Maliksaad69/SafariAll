'use client';

import { useState } from 'react';
import { CheckCircle2, XCircle, Building2, ShieldCheck, MapPin, Loader2 } from 'lucide-react';

interface OperatorItem {
  id: string;
  companyName: string;
  countryOfOrigin: string;
  registrationNumber: string | null;
  isVerified: boolean;
  averageRating: number;
  totalReviews: number;
}

export default function OperatorVerificationTable({ initialOperators }: { initialOperators: OperatorItem[] }) {
  const [operators, setOperators] = useState<OperatorItem[]>(initialOperators);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const toggleVerification = async (operatorId: string, currentStatus: boolean) => {
    setLoadingId(operatorId);
    try {
      const res = await fetch('/api/admin/verify-operator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operatorId, isVerified: !currentStatus }),
      });

      if (res.ok) {
        setOperators((prev) =>
          prev.map((op) => (op.id === operatorId ? { ...op, isVerified: !currentStatus } : op))
        );
      }
    } catch (err) {
      console.error('Failed to toggle operator verification', err);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="surface-card rounded-3xl border border-black/5 shadow-sm overflow-hidden space-y-4">
      <div className="p-6 border-b border-black/5 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="font-bold text-lg font-display text-[var(--brand-deep)] flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[var(--brand)]" />
            <span>Tour Operator Licensing &amp; Verification</span>
          </h3>
          <p className="text-xs text-[var(--ink-muted)] mt-1">Review official business licenses and toggle platform verification status.</p>
        </div>
        <span className="px-3.5 py-1 bg-[var(--brand-soft)] border border-[var(--brand-pale)] text-xs font-semibold text-[var(--brand-deep)] rounded-full">
          {operators.length} Registered Agencies
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[var(--sand)]/70 text-[var(--ink-muted)] uppercase font-semibold tracking-wider border-b border-black/5">
            <tr>
              <th className="px-6 py-3.5">Company Name</th>
              <th className="px-6 py-3.5">HQ Country</th>
              <th className="px-6 py-3.5">License / Reg #</th>
              <th className="px-6 py-3.5">Rating</th>
              <th className="px-6 py-3.5">Verification Status</th>
              <th className="px-6 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 font-medium">
            {operators.map((op) => (
              <tr key={op.id} className="hover:bg-[var(--brand-soft)]/20 transition-colors">
                <td className="px-6 py-4 font-bold text-[var(--ink)] flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[var(--brand-soft)] text-[var(--brand-deep)] flex items-center justify-center font-bold text-sm">
                    {op.companyName.charAt(0)}
                  </div>
                  <span>{op.companyName}</span>
                </td>
                <td className="px-6 py-4 text-[var(--ink-muted)]">{op.countryOfOrigin}</td>
                <td className="px-6 py-4 font-mono text-[var(--ink-muted)]">{op.registrationNumber || 'Pending Submission'}</td>
                <td className="px-6 py-4 text-amber-500 font-bold">★ {op.averageRating} <span className="font-normal text-[var(--ink-muted)]">({op.totalReviews})</span></td>
                <td className="px-6 py-4">
                  {op.isVerified ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Verified Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-900 rounded-full font-bold text-[10px]">
                      <XCircle className="w-3.5 h-3.5 text-amber-600" /> Pending Review
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => toggleVerification(op.id, op.isVerified)}
                    disabled={loadingId === op.id}
                    className={`px-4 py-2 rounded-xl font-bold transition-all shadow-sm flex items-center gap-1 ml-auto ${
                      op.isVerified
                        ? 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
                        : 'bg-[var(--brand)] hover:bg-[var(--brand-deep)] text-white'
                    }`}
                  >
                    {loadingId === op.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : op.isVerified ? (
                      'Revoke License'
                    ) : (
                      'Approve & Verify'
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
