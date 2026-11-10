'use client';

import { useState, useMemo } from 'react';
import {
  Building2,
  Check,
  X,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Search,
  Filter,
  ArrowRight,
  Mail,
  MapPin,
  Calendar,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';

export interface AdminNameRequestItem {
  operatorId: string;
  currentCompanyName: string;
  slug: string;
  countryOfOrigin: string;
  registrationNumber: string | null;
  isVerified: boolean;
  user?: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string | null;
  } | null;
  _count?: {
    tours: number;
    vehicles: number;
    reservations: number;
  };
  nameRequest: {
    requestedName: string;
    reason?: string;
    submittedAt: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
    reviewNotes?: string;
    reviewedAt?: string;
    reviewedBy?: string;
    previousName?: string;
  };
}

export default function OperatorNameRequestsQueue({
  initialRequests,
}: {
  initialRequests: AdminNameRequestItem[];
}) {
  const [requests, setRequests] = useState<AdminNameRequestItem[]>(initialRequests);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal actions
  const [actionModal, setActionModal] = useState<{
    item: AdminNameRequestItem;
    action: 'APPROVE' | 'REJECT';
  } | null>(null);
  const [actionNote, setActionNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Tab counts
  const counts = useMemo(() => {
    let pending = 0;
    let approved = 0;
    let rejected = 0;

    for (const r of requests) {
      if (r.nameRequest.status === 'PENDING') pending++;
      else if (r.nameRequest.status === 'APPROVED') approved++;
      else if (r.nameRequest.status === 'REJECTED') rejected++;
    }

    return { total: requests.length, pending, approved, rejected };
  }, [requests]);

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      // Tab filter
      if (activeTab === 'PENDING' && r.nameRequest.status !== 'PENDING') return false;
      if (activeTab === 'APPROVED' && r.nameRequest.status !== 'APPROVED') return false;
      if (activeTab === 'REJECTED' && r.nameRequest.status !== 'REJECTED') return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCur = r.currentCompanyName.toLowerCase().includes(q);
        const matchReq = r.nameRequest.requestedName.toLowerCase().includes(q);
        const matchEmail = (r.user?.email || '').toLowerCase().includes(q);
        const matchCountry = r.countryOfOrigin.toLowerCase().includes(q);
        return matchCur || matchReq || matchEmail || matchCountry;
      }

      return true;
    });
  }, [requests, activeTab, searchQuery]);

  const handleOpenModal = (item: AdminNameRequestItem, action: 'APPROVE' | 'REJECT') => {
    setActionModal({ item, action });
    setActionNote('');
    setActionError(null);
  };

  const handleConfirmAction = async () => {
    if (!actionModal) return;
    const { item, action } = actionModal;

    setSubmitting(true);
    setActionError(null);

    try {
      const res = await fetch('/api/admin/name-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operatorId: item.operatorId,
          action,
          note: actionNote.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to process name request.');
      }

      // Update local state
      setRequests((prev) =>
        prev.map((r) => {
          if (r.operatorId === item.operatorId) {
            return {
              ...r,
              currentCompanyName: action === 'APPROVE' ? item.nameRequest.requestedName : r.currentCompanyName,
              nameRequest: {
                ...r.nameRequest,
                status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
                reviewedAt: new Date().toISOString(),
                reviewNotes: actionNote.trim() || (action === 'APPROVE' ? 'Approved by owner' : 'Declined by owner'),
              },
            };
          }
          return r;
        })
      );

      setSuccessToast(data.message || `Request successfully ${action === 'APPROVE' ? 'approved' : 'declined'}.`);
      setTimeout(() => setSuccessToast(null), 4000);
      setActionModal(null);
    } catch (err: any) {
      setActionError(err.message || 'Error processing request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 font-bold text-xs flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-emerald-700 hover:text-emerald-950">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Overview & Quick Filters Bar */}
      <div className="surface-card rounded-3xl border border-black/5 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-xl font-display text-[var(--brand-deep)] flex items-center gap-2.5">
              <Building2 className="w-6 h-6 text-[var(--brand)]" />
              <span>Agency Name Change Requests</span>
            </h3>
            <p className="text-xs text-[var(--ink-muted)] mt-1 max-w-xl font-medium">
              Registered tour agencies cannot alter their legal company name without owner approval. Review requested renames, check for conflicts, and accept or reject changes.
            </p>
          </div>

          {counts.pending > 0 && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white font-bold text-xs rounded-2xl shadow-sm shrink-0 animate-pulse">
              <Clock className="w-4 h-4" />
              <span>{counts.pending} Renames Awaiting Your Approval</span>
            </div>
          )}
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap items-center gap-2 border-b border-black/5 pb-4">
          <button
            onClick={() => setActiveTab('PENDING')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'PENDING'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Review</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-black/10 font-black">{counts.pending}</span>
          </button>

          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'ALL'
                ? 'bg-[var(--brand)] text-white shadow-sm'
                : 'bg-[#F7F6F1] text-[#344C49] hover:bg-[#EBE9DF]'
            }`}
          >
            <span>All Requests</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-black/10">{counts.total}</span>
          </button>

          <button
            onClick={() => setActiveTab('APPROVED')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'APPROVED'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Approved</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-black/10">{counts.approved}</span>
          </button>

          <button
            onClick={() => setActiveTab('REJECTED')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'REJECTED'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-rose-50 text-rose-900 border border-rose-200 hover:bg-rose-100'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Declined</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-black/10">{counts.rejected}</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by current company name, requested new name, country, or email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-black/15 bg-white text-xs font-medium text-[#193A38] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="surface-card rounded-3xl border border-black/5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#E4DBB4] text-[#193A38] uppercase font-bold tracking-wider border-b border-[#DEDCCF]">
              <tr>
                <th className="px-6 py-4">Tour Agency</th>
                <th className="px-6 py-4">Name Change Transition</th>
                <th className="px-6 py-4">Reason / Notes</th>
                <th className="px-6 py-4">Date Submitted</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right min-w-[200px]">Owner Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE9DF] font-medium bg-white">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[var(--ink-muted)]">
                    <Building2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-bold text-sm text-[#193A38]">No name change requests found</p>
                    <p className="text-xs mt-1">
                      {activeTab === 'PENDING'
                        ? 'All agency name change requests have been processed.'
                        : 'No requests match your current tab or search criteria.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((r) => {
                  const req = r.nameRequest;
                  const isPending = req.status === 'PENDING';

                  return (
                    <tr key={r.operatorId} className="hover:bg-[#F7F6F1] transition-colors">
                      {/* Operator Identity */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-[#193A38] flex items-center gap-2">
                          <span className="text-sm">{r.currentCompanyName}</span>
                          {r.isVerified && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              Verified
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-500">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[var(--brand)]" />
                            <span>{r.countryOfOrigin}</span>
                          </span>
                          {r.user?.email && (
                            <span className="inline-flex items-center gap-1 font-mono">
                              <Mail className="w-3 h-3 text-gray-400" />
                              <span>{r.user.email}</span>
                            </span>
                          )}
                        </div>
                        {r.registrationNumber && (
                          <span className="block text-[10px] text-gray-400 font-mono mt-0.5">
                            TALA: {r.registrationNumber}
                          </span>
                        )}
                      </td>

                      {/* Name Transition */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-[11px] text-gray-500 flex items-center gap-1.5">
                            <span className="font-semibold text-gray-600">Current:</span>
                            <span className="line-through text-gray-500">{r.currentCompanyName}</span>
                          </div>
                          <div className="flex items-center gap-1.5 font-bold text-sm text-[var(--brand-deep)]">
                            <ArrowRight className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="bg-emerald-50 text-emerald-950 border border-emerald-200 px-2 py-0.5 rounded-lg">
                              {req.requestedName}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Reason / Remarks */}
                      <td className="px-6 py-4 max-w-xs">
                        {req.reason ? (
                          <p className="text-xs text-gray-700 italic leading-relaxed">
                            &ldquo;{req.reason}&rdquo;
                          </p>
                        ) : (
                          <span className="text-gray-400 italic text-[11px]">No remarks provided</span>
                        )}
                        {req.reviewNotes && (
                          <div className="mt-1.5 text-[10.5px] text-gray-500 bg-gray-50 p-1.5 rounded-lg border border-black/5">
                            <strong>Admin Note:</strong> {req.reviewNotes}
                          </div>
                        )}
                      </td>

                      {/* Date Submitted */}
                      <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-[11px]">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>{new Date(req.submittedAt).toLocaleDateString()}</span>
                        </div>
                        <span className="text-[10px] text-gray-400 block mt-0.5">
                          {new Date(req.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {req.status === 'PENDING' ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-950 border border-amber-300 rounded-full font-bold text-[11px] animate-pulse">
                            <Clock className="w-3.5 h-3.5 text-amber-700" /> Pending Owner Decision
                          </span>
                        ) : req.status === 'APPROVED' ? (
                          <div>
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-950 border border-emerald-300 rounded-full font-bold text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> Approved &amp; Renamed
                            </span>
                            {req.reviewedAt && (
                              <span className="block text-[10px] text-gray-400 mt-1">
                                {new Date(req.reviewedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        ) : req.status === 'REJECTED' ? (
                          <div>
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose-100 text-rose-950 border border-rose-300 rounded-full font-bold text-[11px]">
                              <XCircle className="w-3.5 h-3.5 text-rose-700" /> Declined
                            </span>
                            {req.reviewedAt && (
                              <span className="block text-[10px] text-gray-400 mt-1">
                                {new Date(req.reviewedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 border border-gray-300 rounded-full font-bold text-[11px]">
                            Cancelled
                          </span>
                        )}
                      </td>

                      {/* Owner Decision Actions */}
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {isPending ? (
                            <>
                              <button
                                onClick={() => handleOpenModal(r, 'APPROVE')}
                                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all inline-flex items-center gap-1"
                                title="Approve and immediately change agency name"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>

                              <button
                                onClick={() => handleOpenModal(r, 'REJECT')}
                                className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition-all inline-flex items-center gap-1"
                                title="Decline this name change request"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Decline</span>
                              </button>
                            </>
                          ) : (
                            <span className="text-[11px] text-gray-400 font-semibold italic">Processed</span>
                          )}

                          {r.slug && (
                            <a
                              href={`/operators/${r.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                              title="View agency public profile"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Confirmation Modal */}
      {actionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-black/10 overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-black/5 bg-[#F7F6F1] flex items-center justify-between">
              <h3 className="text-lg font-bold font-display text-[#193A38] flex items-center gap-2">
                {actionModal.action === 'APPROVE' ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Approve Agency Name Change</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-rose-600" />
                    <span>Decline Name Change Request</span>
                  </>
                )}
              </h3>
              <button
                onClick={() => setActionModal(null)}
                className="w-8 h-8 rounded-lg hover:bg-gray-200/60 flex items-center justify-center text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-gray-50 border border-black/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Current Name:</span>
                  <strong className="text-black">{actionModal.item.currentCompanyName}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Requested Name:</span>
                  <strong className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {actionModal.item.nameRequest.requestedName}
                  </strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Country:</span>
                  <span className="font-semibold text-black">{actionModal.item.countryOfOrigin}</span>
                </div>
                {actionModal.item.nameRequest.reason && (
                  <div className="pt-2 border-t border-black/5 text-gray-700">
                    <span className="font-semibold text-gray-600">Agency Reason:</span> &ldquo;{actionModal.item.nameRequest.reason}&rdquo;
                  </div>
                )}
              </div>

              {actionModal.action === 'APPROVE' ? (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 font-medium leading-relaxed">
                  Approving will immediately rename this tour operator to <strong>&ldquo;{actionModal.item.nameRequest.requestedName}&rdquo;</strong> across the entire SafariRequest platform, directory pages, and traveler reservation records.
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 font-medium leading-relaxed">
                  Declining will keep the company&apos;s current name <strong>&ldquo;{actionModal.item.currentCompanyName}&rdquo;</strong> intact. Please provide a clear explanation for the agency.
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block font-bold text-[#193A38] uppercase tracking-wider">
                  {actionModal.action === 'APPROVE' ? 'Owner Remarks (Optional)' : 'Reason for Declining *'}
                </label>
                <textarea
                  rows={3}
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  placeholder={
                    actionModal.action === 'APPROVE'
                      ? 'e.g. Approved. Verified updated documentation.'
                      : 'e.g. Please upload updated TALA license certificate reflecting the new business entity name first.'
                  }
                  required={actionModal.action === 'REJECT'}
                  className="w-full px-4 py-2.5 rounded-xl border border-black/15 bg-white text-xs text-[#193A38] focus:ring-2 focus:ring-[var(--brand)] focus:outline-none font-medium"
                />
              </div>

              {actionError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-black/5 bg-[#F7F6F1] flex items-center justify-end gap-3">
              <button
                onClick={() => setActionModal(null)}
                disabled={submitting}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-200/50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={submitting || (actionModal.action === 'REJECT' && !actionNote.trim())}
                className={`px-5 py-2.5 rounded-xl text-white font-bold text-xs shadow-sm flex items-center gap-1.5 disabled:opacity-50 transition-all ${
                  actionModal.action === 'APPROVE'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Confirm {actionModal.action === 'APPROVE' ? 'Approval & Rename' : 'Decline'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
