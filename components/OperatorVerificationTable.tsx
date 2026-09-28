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
    <div className="bg-white rounded-3xl border border-[#E5E0D8] shadow-sm overflow-hidden space-y-4">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg font-serif text-[#1C2826] flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#C85A17]" />
            Tour Operator Licensing & Verification Management
          </h3>
          <p className="text-xs text-gray-500 mt-1">Review official business licenses and toggle platform verification status.</p>
        </div>
        <span className="px-3 py-1 bg-[#FAF7F0] border border-[#E5E0D8] text-xs font-bold text-[#1C2826] rounded-full">
          {operators.length} Registered Agencies
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FAF7F0] text-gray-600 uppercase font-bold tracking-wider border-b border-[#E5E0D8]">
            <tr>
              <th className="px-6 py-4">Company Name</th>
              <th className="px-6 py-4">HQ Country</th>
              <th className="px-6 py-4">License / Reg #</th>
              <th className="px-6 py-4">Rating</th>
              <th className="px-6 py-4">Verification Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-medium">
            {operators.map((op) => (
              <tr key={op.id} className="hover:bg-[#FAF7F0]/50 transition-colors">
                <td className="px-6 py-4 font-bold text-[#1C2826] flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#1C2826] text-[#D4A373] flex items-center justify-center font-bold text-sm">
                    {op.companyName.charAt(0)}
                  </div>
                  <span>{op.companyName}</span>
                </td>
                <td className="px-6 py-4 text-gray-600">{op.countryOfOrigin}</td>
                <td className="px-6 py-4 font-mono text-gray-500">{op.registrationNumber || 'Pending Submission'}</td>
                <td className="px-6 py-4 text-[#E9C46A] font-bold">★ {op.averageRating} ({op.totalReviews})</td>
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
                        : 'bg-[#C85A17] hover:bg-[#a6470e] text-white'
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
