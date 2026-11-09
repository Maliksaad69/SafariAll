'use client';

import { useState, useMemo } from 'react';
import {
  CheckCircle2,
  XCircle,
  Building2,
  ShieldCheck,
  MapPin,
  Loader2,
  FileText,
  ExternalLink,
  Eye,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  Check,
  X,
  FileCheck,
  Calendar,
  Mail,
  User,
  Download,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { parseTalaData, type TalaVerificationData } from '@/lib/tala-verification';

export interface OperatorRecord {
  id: string;
  companyName: string;
  countryOfOrigin: string;
  registrationNumber: string | null;
  licenseDocumentUrl: string | null;
  isVerified: boolean;
  verificationDate: string | null;
  averageRating: number;
  totalReviews: number;
  serviceSummary: string | null;
  createdAt?: string;
  user?: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string | null;
  } | null;
}

export default function OperatorVerificationTable({ initialOperators }: { initialOperators: OperatorRecord[] }) {
  const [operators, setOperators] = useState<OperatorRecord[]>(initialOperators);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'VERIFIED' | 'REJECTED' | 'NO_DOC'>('ALL');
  
  // Modals state
  const [previewOperator, setPreviewOperator] = useState<OperatorRecord | null>(null);
  const [actionModal, setActionModal] = useState<{
    operator: OperatorRecord;
    action: 'APPROVE' | 'REJECT' | 'REVOKE';
  } | null>(null);
  const [actionNote, setActionNote] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Compute parsed data for all operators
  const enrichedOperators = useMemo(() => {
    return operators.map((op) => {
      const tala = parseTalaData(
        op.serviceSummary,
        op.registrationNumber,
        op.licenseDocumentUrl,
        op.isVerified
      );
      return {
        ...op,
        tala,
      };
    });
  }, [operators]);

  // Status counts
  const counts = useMemo(() => {
    let pending = 0;
    let verified = 0;
    let rejected = 0;
    let noDoc = 0;

    for (const op of enrichedOperators) {
      if (op.isVerified) {
        verified++;
      } else if (op.tala.status === 'PENDING') {
        pending++;
      } else if (op.tala.status === 'REJECTED' || op.tala.status === 'REVOKED') {
        rejected++;
      } else {
        noDoc++;
      }
    }

    return { total: operators.length, pending, verified, rejected, noDoc };
  }, [enrichedOperators, operators.length]);

  // Filtered operators
  const filteredOperators = useMemo(() => {
    return enrichedOperators.filter((op) => {
      // Tab filter
      if (activeTab === 'PENDING' && (op.isVerified || op.tala.status !== 'PENDING')) return false;
      if (activeTab === 'VERIFIED' && !op.isVerified) return false;
      if (activeTab === 'REJECTED' && (op.isVerified || (op.tala.status !== 'REJECTED' && op.tala.status !== 'REVOKED'))) return false;
      if (activeTab === 'NO_DOC' && (op.isVerified || op.tala.status !== 'NOT_SUBMITTED')) return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = op.companyName.toLowerCase().includes(q);
        const matchReg = (op.registrationNumber || '').toLowerCase().includes(q);
        const matchCountry = op.countryOfOrigin.toLowerCase().includes(q);
        const matchEmail = (op.user?.email || '').toLowerCase().includes(q);
        const matchTala = (op.tala.talaNumber || '').toLowerCase().includes(q);
        return matchName || matchReg || matchCountry || matchEmail || matchTala;
      }

      return true;
    });
  }, [enrichedOperators, activeTab, searchQuery]);

  const handleOpenActionModal = (operator: OperatorRecord, action: 'APPROVE' | 'REJECT' | 'REVOKE') => {
    setActionModal({ operator, action });
    setActionNote('');
    setActionError(null);
  };

  const handleConfirmAction = async () => {
    if (!actionModal) return;
    const { operator, action } = actionModal;

    if (action === 'REJECT' && !actionNote.trim()) {
      setActionError('Please provide a rejection note explaining to the agency what needs correction.');
      return;
    }

    setSubmittingAction(true);
    setActionError(null);

    try {
      const res = await fetch('/api/admin/verify-operator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operatorId: operator.id,
          action,
          note: actionNote.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update operator status.');
      }

      // Update local state
      setOperators((prev) =>
        prev.map((op) => {
          if (op.id === operator.id) {
            return {
              ...op,
              ...data.operator,
              verificationDate: data.operator.verificationDate
                ? new Date(data.operator.verificationDate).toISOString()
                : null,
            };
          }
          return op;
        })
      );

      // If document preview was open for this operator, update or close
      if (previewOperator?.id === operator.id) {
        setPreviewOperator((prev) => (prev ? { ...prev, ...data.operator } : null));
      }

      setActionModal(null);
    } catch (err: any) {
      setActionError(err.message || 'Error occurred while updating verification.');
    } finally {
      setSubmittingAction(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Overview & Quick Filters Bar */}
      <div className="surface-card rounded-3xl border border-black/5 p-6 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-xl font-display text-[var(--brand-deep)] flex items-center gap-2.5">
              <ShieldCheck className="w-6 h-6 text-[var(--brand)]" />
              <span>Agency TALA Verification &amp; Licensing Queue</span>
            </h3>
            <p className="text-xs text-[var(--ink-muted)] mt-1 max-w-xl font-medium">
              Review governmental TALA certificates submitted by safari tour operators.
              Independently inspect attached documents, approve active licenses, or provide rejection feedback.
            </p>
          </div>

          {/* Pending Alerts Pill */}
          {counts.pending > 0 && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white font-bold text-xs rounded-2xl shadow-sm animate-pulse shrink-0">
              <Clock className="w-4 h-4" />
              <span>{counts.pending} Submissions Awaiting Your Review</span>
            </div>
          )}
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap items-center gap-2 border-b border-black/5 pb-4">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'ALL'
                ? 'bg-[var(--brand)] text-white shadow-sm'
                : 'bg-[#F7F6F1] text-[#344C49] hover:bg-[#EBE9DF]'
            }`}
          >
            <span>All Agencies</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-black/10">{counts.total}</span>
          </button>

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
            onClick={() => setActiveTab('VERIFIED')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'VERIFIED'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Verified Active</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-black/10">{counts.verified}</span>
          </button>

          <button
            onClick={() => setActiveTab('REJECTED')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'REJECTED'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-rose-50 text-rose-900 border border-rose-200 hover:bg-rose-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Action Required / Declined</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-black/10">{counts.rejected}</span>
          </button>

          <button
            onClick={() => setActiveTab('NO_DOC')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'NO_DOC'
                ? 'bg-gray-700 text-white shadow-sm'
                : 'bg-[#F7F6F1] text-gray-700 hover:bg-[#EBE9DF]'
            }`}
          >
            <span>No Document</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-black/10">{counts.noDoc}</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search agencies by company name, TALA license #, country, or user email..."
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-black/10 bg-[#FAF9F5] text-xs font-medium text-[#193A38] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 hover:text-gray-700"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Main Table Container */}
      <div className="surface-card rounded-3xl border border-black/5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#E4DBB4] text-[#193A38] uppercase font-bold tracking-wider border-b border-[#DEDCCF]">
              <tr>
                <th className="px-6 py-4">Tour Agency</th>
                <th className="px-6 py-4">Country &amp; Contact</th>
                <th className="px-6 py-4">TALA License #</th>
                <th className="px-6 py-4">Official Document</th>
                <th className="px-6 py-4">Verification Status</th>
                <th className="px-6 py-4 text-right">Owner Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE9DF] font-medium bg-white">
              {filteredOperators.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[var(--ink-muted)]">
                    <Building2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-bold text-sm text-[#193A38]">No agencies found matching your criteria</p>
                    <p className="text-xs mt-1">Try switching tabs or resetting the search filter.</p>
                  </td>
                </tr>
              ) : (
                filteredOperators.map((op) => {
                  const docUrl = op.tala.documentUrl || op.licenseDocumentUrl;
                  const hasDoc = Boolean(docUrl);

                  return (
                    <tr key={op.id} className="hover:bg-[#F7F6F1] transition-colors">
                      {/* Agency Name */}
                      <td className="px-6 py-4 font-bold text-[#193A38]">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[var(--brand-soft)] text-[#193A38] flex items-center justify-center font-bold text-sm shrink-0">
                            {op.companyName.charAt(0)}
                          </div>
                          <div>
                            <span className="text-sm font-bold block">{op.companyName}</span>
                            <span className="text-[11px] font-semibold text-amber-600 block mt-0.5">
                              ★ {op.averageRating} <span className="text-gray-500">({op.totalReviews} reviews)</span>
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Country & Contact */}
                      <td className="px-6 py-4 text-[#344C49]">
                        <div className="font-bold text-[#193A38] flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[var(--brand)] shrink-0" />
                          <span>{op.countryOfOrigin}</span>
                        </div>
                        {op.user?.email && (
                          <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-1 font-mono">
                            <Mail className="w-3 h-3 text-gray-400 shrink-0" />
                            <span>{op.user.email}</span>
                          </div>
                        )}
                      </td>

                      {/* TALA License # */}
                      <td className="px-6 py-4">
                        {op.tala.talaNumber || op.registrationNumber ? (
                          <div>
                            <span className="font-mono font-bold text-xs text-[#193A38] bg-[#F7F6F1] px-2.5 py-1 rounded-lg border border-black/5 inline-block">
                              {op.tala.talaNumber || op.registrationNumber}
                            </span>
                            {op.tala.issuingAuthority && (
                              <span className="block text-[10px] text-gray-500 mt-1 max-w-[160px] truncate" title={op.tala.issuingAuthority}>
                                {op.tala.issuingAuthority}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic text-xs">Not Provided</span>
                        )}
                      </td>

                      {/* Official Document Inspect Button */}
                      <td className="px-6 py-4">
                        {hasDoc ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setPreviewOperator(op)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-900 font-bold text-[11px] shadow-2xs transition-all"
                            >
                              <Eye className="w-3.5 h-3.5 text-blue-700" />
                              <span>Inspect Doc</span>
                            </button>
                            <a
                              href={docUrl!}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                              title="Open document in new window"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic text-xs">No File Uploaded</span>
                        )}
                      </td>

                      {/* Verification Status */}
                      <td className="px-6 py-4">
                        {op.isVerified ? (
                          <div>
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-950 border border-emerald-300 rounded-full font-bold text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> Verified Active
                            </span>
                            {op.verificationDate && (
                              <span className="block text-[10px] text-gray-500 mt-1">
                                {new Date(op.verificationDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        ) : op.tala.status === 'PENDING' ? (
                          <div>
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-950 border border-amber-300 rounded-full font-bold text-[11px] animate-pulse">
                              <Clock className="w-3.5 h-3.5 text-amber-700" /> Pending Owner Review
                            </span>
                            {op.tala.submittedAt && (
                              <span className="block text-[10px] text-gray-500 mt-1">
                                Submitted {new Date(op.tala.submittedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        ) : op.tala.status === 'REJECTED' || op.tala.status === 'REVOKED' ? (
                          <div>
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose-100 text-rose-950 border border-rose-300 rounded-full font-bold text-[11px]">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-700" /> {op.tala.status === 'REVOKED' ? 'Revoked' : 'Changes Requested'}
                            </span>
                            {op.tala.reviewNotes && (
                              <span className="block text-[10px] text-rose-800 mt-1 max-w-[170px] truncate" title={op.tala.reviewNotes}>
                                &ldquo;{op.tala.reviewNotes}&rdquo;
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 border border-gray-300 rounded-full font-bold text-[11px]">
                            <XCircle className="w-3.5 h-3.5 text-gray-500" /> Unverified
                          </span>
                        )}
                      </td>

                      {/* Owner Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!op.isVerified ? (
                            <>
                              <button
                                onClick={() => handleOpenActionModal(op, 'APPROVE')}
                                className="px-3.5 py-1.5 rounded-xl bg-[var(--brand)] hover:bg-[var(--brand-deep)] text-white font-bold text-xs shadow-xs transition-all inline-flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>

                              {hasDoc && (
                                <button
                                  onClick={() => handleOpenActionModal(op, 'REJECT')}
                                  className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition-all inline-flex items-center gap-1"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>Decline</span>
                                </button>
                              )}
                            </>
                          ) : (
                            <button
                              onClick={() => handleOpenActionModal(op, 'REVOKE')}
                              className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs transition-all inline-flex items-center gap-1"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Revoke License</span>
                            </button>
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

      {/* TALA Document Inspection Modal */}
      {previewOperator && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-black/10 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-black/5 bg-[#F7F6F1] flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--brand)]">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Owner Document Inspection</span>
                </div>
                <h3 className="text-xl font-bold font-display text-[#193A38] mt-0.5">
                  {previewOperator.companyName} &bull; TALA Certificate
                </h3>
                <p className="text-xs text-[#344C49] mt-0.5 font-medium">
                  Reg #: <strong className="font-mono text-[#193A38]">{previewOperator.registrationNumber || 'Pending'}</strong> | Country: <strong>{previewOperator.countryOfOrigin}</strong>
                </p>
              </div>

              <div className="flex items-center gap-2">
                {previewOperator.licenseDocumentUrl && (
                  <a
                    href={previewOperator.licenseDocumentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary text-xs py-2 inline-flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open in New Tab</span>
                  </a>
                )}
                <button
                  onClick={() => setPreviewOperator(null)}
                  className="w-9 h-9 rounded-xl bg-black/5 hover:bg-black/10 flex items-center justify-center text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Document Viewer */}
            <div className="flex-1 overflow-y-auto p-6 bg-[#FAF9F5] flex flex-col items-center justify-center min-h-[420px]">
              {previewOperator.licenseDocumentUrl ? (
                previewOperator.licenseDocumentUrl.toLowerCase().includes('.pdf') ||
                previewOperator.licenseDocumentUrl.includes('/api/media/') ? (
                  <iframe
                    src={previewOperator.licenseDocumentUrl}
                    title="TALA Document Preview"
                    className="w-full h-[520px] rounded-2xl border border-black/10 bg-white shadow-xs"
                  />
                ) : (
                  // Image Preview
                  <div className="max-h-[520px] overflow-auto rounded-2xl border border-black/10 bg-white p-2 shadow-xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewOperator.licenseDocumentUrl}
                      alt="TALA Document Scan"
                      className="max-w-full max-h-[500px] object-contain rounded-xl mx-auto"
                    />
                  </div>
                )
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-40" />
                  <p className="font-bold">No document file attached</p>
                </div>
              )}
            </div>

            {/* Modal Footer: Quick Decision Actions */}
            <div className="p-5 border-t border-black/5 bg-white flex flex-wrap items-center justify-between gap-4">
              <div className="text-xs text-gray-600 font-medium">
                Review official seals, expiration dates, and registered company names before approving.
              </div>

              <div className="flex items-center gap-3">
                {!previewOperator.isVerified ? (
                  <>
                    <button
                      onClick={() => handleOpenActionModal(previewOperator, 'REJECT')}
                      className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs"
                    >
                      Decline with Notes
                    </button>
                    <button
                      onClick={() => handleOpenActionModal(previewOperator, 'APPROVE')}
                      className="px-5 py-2 rounded-xl bg-[var(--brand)] hover:bg-[var(--brand-deep)] text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve &amp; Grant Verified Badge</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleOpenActionModal(previewOperator, 'REVOKE')}
                    className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs"
                  >
                    Revoke Verification
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Action Confirmation Modal (Approve / Reject / Revoke) */}
      {actionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-black/10 overflow-hidden">
            
            <div className="p-6 border-b border-black/5 flex items-center justify-between">
              <h3 className="text-lg font-bold font-display text-[#193A38] flex items-center gap-2">
                {actionModal.action === 'APPROVE' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                {actionModal.action === 'REJECT' && <AlertTriangle className="w-5 h-5 text-rose-600" />}
                {actionModal.action === 'REVOKE' && <XCircle className="w-5 h-5 text-red-600" />}
                <span>
                  {actionModal.action === 'APPROVE'
                    ? 'Approve TALA License'
                    : actionModal.action === 'REJECT'
                    ? 'Decline TALA Submission'
                    : 'Revoke Agency Verification'}
                </span>
              </h3>
              <button
                onClick={() => setActionModal(null)}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-[#344C49] leading-relaxed">
                Agency: <strong className="text-[#193A38]">{actionModal.operator.companyName}</strong> ({actionModal.operator.countryOfOrigin})
                <br />
                TALA Reg #: <strong className="font-mono text-[#193A38]">{actionModal.operator.registrationNumber || 'N/A'}</strong>
              </p>

              {actionModal.action === 'APPROVE' && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs font-medium">
                  Approving will immediately grant this tour operator the <strong>Verified Agency</strong> trust badge across all search pages and booking flows.
                </div>
              )}

              {actionModal.action === 'REJECT' && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 text-xs font-medium">
                  Please provide a clear reason for rejecting this document (e.g. expired license, blurred image, name mismatch). This will be shown directly to the operator so they can fix it.
                </div>
              )}

              {actionModal.action === 'REVOKE' && (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-950 text-xs font-medium">
                  Revoking will immediately remove the verified trust badge from the agency&apos;s public profile.
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#193A38] uppercase tracking-wider">
                  {actionModal.action === 'REJECT' ? 'Reason for Rejection *' : 'Owner Notes (Optional)'}
                </label>
                <textarea
                  rows={3}
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  placeholder={
                    actionModal.action === 'APPROVE'
                      ? 'e.g. Verified with TTLB official portal. In good standing.'
                      : actionModal.action === 'REJECT'
                      ? 'e.g. The uploaded license expired on Dec 31, 2025. Please provide your 2026 renewal certificate.'
                      : 'e.g. License expired or reported for compliance non-adherence.'
                  }
                  required={actionModal.action === 'REJECT'}
                  className="w-full px-4 py-2.5 rounded-xl border border-black/15 bg-white text-xs font-medium text-[#193A38] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
                />
              </div>

              {actionError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-black/5 bg-[#F7F6F1] flex items-center justify-end gap-3">
              <button
                onClick={() => setActionModal(null)}
                disabled={submittingAction}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-200/50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={submittingAction}
                className={`px-5 py-2 rounded-xl text-white font-bold text-xs shadow-sm flex items-center gap-1.5 disabled:opacity-50 ${
                  actionModal.action === 'APPROVE'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : actionModal.action === 'REJECT'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {submittingAction ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Confirm {actionModal.action === 'APPROVE' ? 'Approval' : actionModal.action === 'REJECT' ? 'Decline' : 'Revocation'}</span>
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
