'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
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
  Pencil,
  Trash2,
  Settings,
  Image as ImageIcon,
  Phone,
  Tag,
  Globe,
} from 'lucide-react';
import { parseTalaData, type TalaVerificationData } from '@/lib/tala-verification';
import { parseNameRequest } from '@/lib/name-requests';
import { SAFARI_COUNTRY_LIST } from '@/lib/countries';

export interface OperatorRecord {
  id: string;
  companyName: string;
  slug?: string;
  countryOfOrigin: string;
  headquartersAddress?: string | null;
  yearEstablished?: number | null;
  priceTier?: string | null;
  overviewText?: string | null;
  officesIn?: string[];
  logoUrl?: string | null;
  bannerUrl?: string | null;
  registrationNumber: string | null;
  licenseDocumentUrl: string | null;
  isVerified: boolean;
  verificationDate: string | null;
  averageRating: number;
  totalReviews: number;
  serviceSummary: string | null;
  createdAt?: string;
  user?: {
    id?: string;
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
}

export default function OperatorVerificationTable({ initialOperators }: { initialOperators: OperatorRecord[] }) {
  const [operators, setOperators] = useState<OperatorRecord[]>(initialOperators);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'VERIFIED' | 'REJECTED' | 'NO_DOC'>('ALL');
  
  // Modals state
  const [previewOperator, setPreviewOperator] = useState<OperatorRecord | null>(null);
  const [editingOperator, setEditingOperator] = useState<OperatorRecord | null>(null);
  const [deletingOperator, setDeletingOperator] = useState<OperatorRecord | null>(null);
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
                  const nameReq = parseNameRequest(op.serviceSummary);

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
                            {nameReq && nameReq.status === 'PENDING' && (
                              <Link
                                href="/admin/name-requests"
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-950 border border-amber-300 mt-1 hover:bg-amber-200 transition-colors"
                                title={`Requested rename to "${nameReq.requestedName}"`}
                              >
                                <Clock className="w-2.5 h-2.5 text-amber-700" />
                                <span>Rename: &ldquo;{nameReq.requestedName}&rdquo;</span>
                              </Link>
                            )}
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
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {!op.isVerified ? (
                            <>
                              <button
                                onClick={() => handleOpenActionModal(op, 'APPROVE')}
                                className="px-3 py-1.5 rounded-xl bg-[var(--brand)] hover:bg-[var(--brand-deep)] text-white font-bold text-xs shadow-xs transition-all inline-flex items-center gap-1"
                                title="Approve TALA license"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>

                              {hasDoc && (
                                <button
                                  onClick={() => handleOpenActionModal(op, 'REJECT')}
                                  className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition-all inline-flex items-center gap-1"
                                  title="Decline submission"
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
                              title="Revoke verified status"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Revoke</span>
                            </button>
                          )}

                          {/* Edit Agency Profile */}
                          <button
                            onClick={() => setEditingOperator(op)}
                            className="px-2.5 py-1.5 rounded-xl bg-[#F7F6F1] hover:bg-[#EBE9DF] border border-black/10 text-[#193A38] font-bold text-xs transition-all inline-flex items-center gap-1 shadow-2xs"
                            title="Edit any part of this agency profile"
                          >
                            <Pencil className="w-3.5 h-3.5 text-[#193A38]" />
                            <span>Edit</span>
                          </button>

                          {/* Delete Agency */}
                          <button
                            onClick={() => setDeletingOperator(op)}
                            className="px-2 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs transition-all inline-flex items-center gap-1 shadow-2xs"
                            title="Delete this agency and all associated records"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Public Profile Link */}
                          {op.slug && (
                            <a
                              href={`/operators/${op.slug}`}
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

      {/* Admin Edit Agency Modal */}
      {editingOperator && (
        <AdminEditOperatorModal
          operator={editingOperator}
          onClose={() => setEditingOperator(null)}
          onUpdated={(updated) => {
            setOperators((prev) =>
              prev.map((op) => (op.id === updated.id ? { ...op, ...updated } : op))
            );
            setEditingOperator(null);
          }}
        />
      )}

      {/* Admin Delete Agency Modal */}
      {deletingOperator && (
        <AdminDeleteOperatorModal
          operator={deletingOperator}
          onClose={() => setDeletingOperator(null)}
          onDeleted={(deletedId) => {
            setOperators((prev) => prev.filter((op) => op.id !== deletedId));
            setDeletingOperator(null);
          }}
        />
      )}

    </div>
  );
}

/**
 * Admin Edit Operator Modal
 * Allows website owner to modify ANY detail of a tour operator agency.
 */
function AdminEditOperatorModal({
  operator,
  onClose,
  onUpdated,
}: {
  operator: OperatorRecord;
  onClose: () => void;
  onUpdated: (updated: OperatorRecord) => void;
}) {
  const [companyName, setCompanyName] = useState(operator.companyName || '');
  const [slug, setSlug] = useState(operator.slug || '');
  const [countryOfOrigin, setCountryOfOrigin] = useState(operator.countryOfOrigin || 'Tanzania');
  const [headquartersAddress, setHeadquartersAddress] = useState(operator.headquartersAddress || '');
  const [yearEstablished, setYearEstablished] = useState(
    operator.yearEstablished ? String(operator.yearEstablished) : ''
  );
  const [priceTier, setPriceTier] = useState(operator.priceTier || 'MID_RANGE');
  const [overviewText, setOverviewText] = useState(operator.overviewText || '');
  const [officesIn, setOfficesIn] = useState<string[]>(operator.officesIn || []);
  const [registrationNumber, setRegistrationNumber] = useState(operator.registrationNumber || '');
  const [licenseDocumentUrl, setLicenseDocumentUrl] = useState(operator.licenseDocumentUrl || '');
  const [isVerified, setIsVerified] = useState(operator.isVerified);
  const [logoUrl, setLogoUrl] = useState(operator.logoUrl || '');
  const [bannerUrl, setBannerUrl] = useState(operator.bannerUrl || '');

  // Contact person
  const [firstName, setFirstName] = useState(operator.user?.firstName || '');
  const [lastName, setLastName] = useState(operator.user?.lastName || '');
  const [email, setEmail] = useState(operator.user?.email || '');
  const [phone, setPhone] = useState(operator.user?.phone || '');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleOffice = (cName: string) => {
    setOfficesIn((prev) =>
      prev.includes(cName) ? prev.filter((c) => c !== cName) : [...prev, cName]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/operators/${operator.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName,
          slug,
          countryOfOrigin,
          headquartersAddress,
          yearEstablished,
          priceTier,
          overviewText,
          officesIn,
          registrationNumber,
          licenseDocumentUrl,
          isVerified,
          logoUrl,
          bannerUrl,
          firstName,
          lastName,
          email,
          phone,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update agency details.');
      }

      onUpdated(data.operator);
    } catch (err: any) {
      setError(err.message || 'Error updating agency.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-black/10 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="p-6 border-b border-black/5 bg-[#F7F6F1] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--brand)] text-white flex items-center justify-center font-bold shadow-xs">
              <Pencil className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--brand)] bg-[var(--brand-soft)] px-2 py-0.5 rounded-full">
                  Admin Edit Mode
                </span>
                {operator.isVerified && (
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Verified
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold font-display text-[#193A38]">
                Edit Agency: {operator.companyName}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl hover:bg-gray-200/60 flex items-center justify-center text-gray-500 hover:text-black transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-6 sm:p-8 space-y-8 text-xs">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 font-semibold flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Core Company Profile */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--brand)] flex items-center gap-2 border-b border-black/5 pb-2">
              <Building2 className="w-4 h-4" />
              <span>1. Agency Identity &amp; Classification</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-[#193A38]">Company / Brand Name *</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 bg-white text-xs font-medium text-[#193A38] focus:ring-2 focus:ring-[var(--brand)] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-[#193A38]">URL Slug (Unique Public URL) *</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 bg-white text-xs font-mono text-[#193A38] focus:ring-2 focus:ring-[var(--brand)] focus:outline-none"
                />
                <p className="text-[10.5px] text-gray-500 font-mono">
                  safarirequest.com/operators/{slug || '...'}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-[#193A38]">Country of Origin *</label>
                <select
                  value={countryOfOrigin}
                  onChange={(e) => setCountryOfOrigin(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 bg-white text-xs font-medium text-[#193A38] focus:ring-2 focus:ring-[var(--brand)] focus:outline-none"
                >
                  {SAFARI_COUNTRY_LIST.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-[#193A38]">Year Established</label>
                <input
                  type="number"
                  min="1950"
                  max={new Date().getFullYear()}
                  value={yearEstablished}
                  onChange={(e) => setYearEstablished(e.target.value)}
                  placeholder="e.g. 2014"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 bg-white text-xs font-medium text-[#193A38] focus:ring-2 focus:ring-[var(--brand)] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-[#193A38]">Price / Comfort Level</label>
                <select
                  value={priceTier}
                  onChange={(e) => setPriceTier(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 bg-white text-xs font-medium text-[#193A38] focus:ring-2 focus:ring-[var(--brand)] focus:outline-none"
                >
                  <option value="CAMPING">Camping / Backpacker</option>
                  <option value="BUDGET">Budget Friendly</option>
                  <option value="MID_RANGE">Mid-Range (Standard Lodge)</option>
                  <option value="LUXURY">Luxury Tented &amp; Private Reserve</option>
                  <option value="SUPER_LUXURY">Super Luxury / Bespoke VIP</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-[#193A38]">Headquarters Physical Address</label>
                <input
                  type="text"
                  value={headquartersAddress}
                  onChange={(e) => setHeadquartersAddress(e.target.value)}
                  placeholder="e.g. Plot 14, Haile Selassie Rd, Arusha, Tanzania"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 bg-white text-xs font-medium text-[#193A38] focus:ring-2 focus:ring-[var(--brand)] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Operating Destinations */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--brand)] flex items-center gap-2 border-b border-black/5 pb-2">
              <Globe className="w-4 h-4" />
              <span>2. Operational Destinations ({officesIn.length} Selected)</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 pt-1">
              {SAFARI_COUNTRY_LIST.map((c) => {
                const checked = officesIn.includes(c.name);
                return (
                  <label
                    key={c.name}
                    onClick={() => toggleOffice(c.name)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all select-none ${
                      checked
                        ? 'border-[var(--brand)] bg-[var(--brand-soft)] text-[#193A38] shadow-2xs'
                        : 'border-black/10 bg-[#F7F6F1]/50 text-gray-700 hover:bg-[#F7F6F1]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {}}
                      className="rounded text-[var(--brand)] focus:ring-0"
                    />
                    <span>{c.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Section 3: Overview Story */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--brand)] flex items-center gap-2 border-b border-black/5 pb-2">
              <FileText className="w-4 h-4" />
              <span>3. Overview &amp; Marketing Story</span>
            </h4>
            <textarea
              rows={4}
              value={overviewText}
              onChange={(e) => setOverviewText(e.target.value)}
              placeholder="Describe the company's background, safari vehicles, guides, wildlife focus..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 bg-white text-xs font-medium text-[#193A38] focus:ring-2 focus:ring-[var(--brand)] focus:outline-none"
            />
          </div>

          {/* Section 4: Brand Media Assets */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--brand)] flex items-center gap-2 border-b border-black/5 pb-2">
              <ImageIcon className="w-4 h-4" />
              <span>4. Brand Media &amp; Imagery</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="font-bold text-[#193A38]">Agency Logo Image URL</label>
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... or hosted CDN URL"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 bg-white text-xs font-mono text-[#193A38] focus:ring-2 focus:ring-[var(--brand)] focus:outline-none"
                />
                {logoUrl && (
                  <div className="mt-2 flex items-center gap-3 p-2 bg-[#F7F6F1] rounded-xl border border-black/5">
                    <img
                      src={logoUrl}
                      alt="Logo Preview"
                      className="w-12 h-12 rounded-lg object-cover border bg-white"
                      onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
                    />
                    <span className="text-[11px] text-gray-500">Logo preview</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="font-bold text-[#193A38]">Banner / Hero Cover Image URL</label>
                <input
                  type="url"
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... or hosted CDN URL"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 bg-white text-xs font-mono text-[#193A38] focus:ring-2 focus:ring-[var(--brand)] focus:outline-none"
                />
                {bannerUrl && (
                  <div className="mt-2 p-1.5 bg-[#F7F6F1] rounded-xl border border-black/5">
                    <img
                      src={bannerUrl}
                      alt="Banner Preview"
                      className="w-full h-16 rounded-lg object-cover"
                      onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 5: TALA Document & Trust */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--brand)] flex items-center gap-2 border-b border-black/5 pb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>5. TALA Registration &amp; Verification Status</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-[#193A38]">TALA / Government Registration #</label>
                <input
                  type="text"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  placeholder="e.g. TALA/2026/0491 or MNRT/TR/9821"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 bg-white text-xs font-mono text-[#193A38] focus:ring-2 focus:ring-[var(--brand)] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-[#193A38]">License Certificate Document URL</label>
                <input
                  type="url"
                  value={licenseDocumentUrl}
                  onChange={(e) => setLicenseDocumentUrl(e.target.value)}
                  placeholder="https://... PDF or JPEG doc URL"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 bg-white text-xs font-mono text-[#193A38] focus:ring-2 focus:ring-[var(--brand)] focus:outline-none"
                />
              </div>
            </div>

            <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-black/10 bg-[#F7F6F1] cursor-pointer hover:bg-[#EBE9DF]/60 transition-colors">
              <input
                type="checkbox"
                checked={isVerified}
                onChange={(e) => setIsVerified(e.target.checked)}
                className="w-4 h-4 rounded text-[var(--brand)] focus:ring-0"
              />
              <div>
                <span className="font-bold text-[#193A38] block text-xs">
                  Mark this Operator as Official &ldquo;Verified Agency&rdquo;
                </span>
                <span className="text-[11px] text-gray-500 block">
                  Enables the verified green badge across the entire platform.
                </span>
              </div>
            </label>
          </div>

          {/* Section 6: Primary User Account */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--brand)] flex items-center gap-2 border-b border-black/5 pb-2">
              <User className="w-4 h-4" />
              <span>6. Primary Account Holder &amp; Login Contact</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-[#193A38]">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 bg-white text-xs font-medium text-[#193A38] focus:ring-2 focus:ring-[var(--brand)] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-[#193A38]">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 bg-white text-xs font-medium text-[#193A38] focus:ring-2 focus:ring-[var(--brand)] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-[#193A38]">Login Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 bg-white text-xs font-medium text-[#193A38] focus:ring-2 focus:ring-[var(--brand)] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-[#193A38]">Phone / WhatsApp</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+255 7..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 bg-white text-xs font-medium text-[#193A38] focus:ring-2 focus:ring-[var(--brand)] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-black/5 flex items-center justify-end gap-3 sticky bottom-0 bg-white py-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[var(--brand)] hover:bg-[var(--brand-deep)] text-white shadow-sm flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Agency Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * Admin Delete Operator Modal
 * Confirmation dialog before permanently deleting an agency and cascading child records.
 */
function AdminDeleteOperatorModal({
  operator,
  onClose,
  onDeleted,
}: {
  operator: OperatorRecord;
  onClose: () => void;
  onDeleted: (deletedId: string) => void;
}) {
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConfirmed = confirmText.trim().toLowerCase() === operator.companyName.trim().toLowerCase();

  const handleDelete = async () => {
    if (!isConfirmed) return;
    setDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/operators/${operator.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete agency.');
      }
      onDeleted(operator.id);
    } catch (err: any) {
      setError(err.message || 'Error deleting agency.');
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-black/10 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-rose-100 bg-rose-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-display text-rose-950">
                Permanently Delete Tour Agency
              </h3>
              <p className="text-xs text-rose-800">
                Irreversible administrative deletion
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-rose-100 flex items-center justify-center text-rose-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200 text-rose-950 space-y-1.5">
            <p className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Warning: This action cannot be reversed!</span>
            </p>
            <p className="text-[11.5px] text-rose-900 leading-relaxed">
              Deleting <strong>{operator.companyName}</strong> will permanently erase all associated safari packages, vehicle fleet listings, customer reservations, and review ratings from the database.
            </p>
          </div>

          <div className="space-y-1 bg-[#F7F6F1] p-3.5 rounded-2xl border border-black/5 text-[#193A38]">
            <p className="font-semibold text-xs">Agency Details:</p>
            <p className="text-gray-600">Company: <strong className="text-black">{operator.companyName}</strong></p>
            <p className="text-gray-600">Country: <strong className="text-black">{operator.countryOfOrigin}</strong></p>
            {operator.user?.email && (
              <p className="text-gray-600">Account: <strong className="text-black">{operator.user.email}</strong> (will be downgraded to Traveler)</p>
            )}
            {operator._count && (
              <p className="text-gray-600">
                Data impacted: <strong className="text-black">{operator._count.tours}</strong> tours, <strong className="text-black">{operator._count.vehicles}</strong> vehicles, <strong className="text-black">{operator._count.reservations}</strong> reservations
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block font-bold text-[#193A38]">
              Type &ldquo;<span className="text-rose-700 underline font-mono">{operator.companyName}</span>&rdquo; to confirm deletion:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={operator.companyName}
              className="w-full px-3.5 py-2.5 rounded-xl border border-rose-300 bg-white font-mono text-xs text-[#193A38] focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-black/5 bg-[#F7F6F1] flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={deleting}
            className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-200/50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={!isConfirmed || deleting}
            className="px-5 py-2 rounded-xl text-white font-bold text-xs shadow-sm flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {deleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Deleting Agency...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Permanently Delete Agency</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
