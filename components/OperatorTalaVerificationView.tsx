'use client';

import { useState } from 'react';
import {
  ShieldCheck,
  FileText,
  Upload,
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileCheck,
  AlertTriangle,
  Loader2,
  Calendar,
  Building,
  HelpCircle,
} from 'lucide-react';
import type { TalaVerificationData } from '@/lib/tala-verification';

interface OperatorTalaVerificationViewProps {
  operatorId: string;
  companyName: string;
  countryOfOrigin: string;
  isVerified: boolean;
  verificationDate: string | null;
  registrationNumber: string | null;
  licenseDocumentUrl: string | null;
  initialTalaData: TalaVerificationData;
}

export default function OperatorTalaVerificationView({
  operatorId,
  companyName,
  countryOfOrigin,
  isVerified,
  verificationDate,
  registrationNumber,
  licenseDocumentUrl,
  initialTalaData,
}: OperatorTalaVerificationViewProps) {
  const [talaData, setTalaData] = useState<TalaVerificationData>(initialTalaData);
  const [verifiedState, setVerifiedState] = useState(isVerified);
  const [verDate, setVerDate] = useState<string | null>(verificationDate);

  // Form states
  const [file, setFile] = useState<File | null>(null);
  const [talaNumber, setTalaNumber] = useState(talaData.talaNumber || registrationNumber || '');
  const [issuingAuthority, setIssuingAuthority] = useState(talaData.issuingAuthority || '');
  const [expiryDate, setExpiryDate] = useState(talaData.expiryDate || '');
  const [notes, setNotes] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setFeedback(null);
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowed.includes(selectedFile.type)) {
      setFeedback({
        type: 'error',
        message: 'Unsupported file type. Please upload a PDF or an image scan (JPEG, PNG, WebP).',
      });
      return;
    }
    if (selectedFile.size > 15 * 1024 * 1024) {
      setFeedback({
        type: 'error',
        message: 'File size exceeds 15 MB limit. Please compress or optimize your document scan.',
      });
      return;
    }
    setFile(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!file && !talaData.documentUrl) {
      setFeedback({
        type: 'error',
        message: 'Please choose or drag-and-drop your official TALA document file.',
      });
      return;
    }

    if (!talaNumber.trim()) {
      setFeedback({
        type: 'error',
        message: 'Official TALA License / Registration Number is required.',
      });
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      if (file) formData.append('file', file);
      formData.append('talaNumber', talaNumber.trim());
      formData.append('issuingAuthority', issuingAuthority.trim());
      formData.append('expiryDate', expiryDate.trim());
      if (notes.trim()) formData.append('notes', notes.trim());

      const res = await fetch('/api/operator/verification-document', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit TALA document.');
      }

      setTalaData(data.talaData);
      setVerifiedState(false);
      setVerDate(null);
      setFile(null);
      setNotes('');
      setFeedback({
        type: 'success',
        message: 'Your TALA document has been successfully imported and submitted to the website owner for review!',
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Something went wrong while submitting your document.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const effectiveStatus = verifiedState ? 'APPROVED' : talaData.status;

  return (
    <div className="space-y-8">
      {/* Dynamic Status Banner */}
      {effectiveStatus === 'APPROVED' && (
        <div className="rounded-3xl border-2 border-emerald-300 bg-emerald-50/90 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900 font-bold text-xs uppercase tracking-wider mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Verified Agency Active</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold font-display text-emerald-950">
                  Your TALA License is Fully Verified
                </h2>
                <p className="text-sm text-emerald-900/90 mt-1 max-w-2xl font-medium">
                  {companyName} has been independently verified by the platform owner. Your safari listings
                  proudly display the <strong>Verified Agency</strong> trust badge.
                </p>
                {verDate && (
                  <p className="text-xs text-emerald-800 font-semibold mt-2">
                    Verified Date: {new Date(verDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                )}
              </div>
            </div>

            {talaData.documentUrl && (
              <a
                href={talaData.documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-emerald-300 hover:bg-emerald-100/50 text-emerald-900 font-bold text-xs shadow-xs transition-all shrink-0"
              >
                <FileCheck className="w-4 h-4 text-emerald-700" />
                <span>View On-File Document</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-60" />
              </a>
            )}
          </div>
        </div>
      )}

      {effectiveStatus === 'PENDING' && (
        <div className="rounded-3xl border-2 border-amber-300 bg-amber-50/95 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-200/80 text-amber-900 font-bold text-xs uppercase tracking-wider mb-1">
                  <span>Owner Verification in Progress</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold font-display text-amber-950">
                  TALA Document Submitted &amp; Under Owner Review
                </h2>
                <p className="text-sm text-amber-900/90 mt-1 max-w-2xl font-medium">
                  Your official TALA license was received and queued for manual inspection by the website owner.
                  You will receive an in-app notification once verified.
                </p>
                {talaData.submittedAt && (
                  <p className="text-xs text-amber-800 font-semibold mt-2">
                    Submitted: {new Date(talaData.submittedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                )}
              </div>
            </div>

            {talaData.documentUrl && (
              <a
                href={talaData.documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-amber-300 hover:bg-amber-100/50 text-amber-900 font-bold text-xs shadow-xs transition-all shrink-0"
              >
                <FileText className="w-4 h-4 text-amber-700" />
                <span>Inspect Submitted Document</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-60" />
              </a>
            )}
          </div>
        </div>
      )}

      {effectiveStatus === 'REJECTED' && (
        <div className="rounded-3xl border-2 border-rose-300 bg-rose-50/95 p-6 sm:p-8 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-3 flex-1">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-rose-200/80 text-rose-900 font-bold text-xs uppercase tracking-wider mb-1">
                  <span>Action Required</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold font-display text-rose-950">
                  Verification Declined: Owner Feedback Provided
                </h2>
                <p className="text-sm text-rose-900 font-medium mt-1">
                  The website owner reviewed your submission and requested corrections before verification can be granted.
                </p>
              </div>

              {talaData.reviewNotes && (
                <div className="bg-white/90 border border-rose-200 rounded-2xl p-4 text-xs text-rose-950 font-semibold shadow-xs">
                  <p className="text-[11px] uppercase tracking-wider text-rose-600 font-bold mb-1">Website Owner&apos;s Review Feedback:</p>
                  <p className="text-sm text-rose-900 italic font-mono bg-rose-50/50 p-2.5 rounded-xl border border-rose-100">
                    &ldquo;{talaData.reviewNotes}&rdquo;
                  </p>
                  {talaData.reviewedAt && (
                    <p className="text-[11px] text-rose-700 mt-2 font-medium">
                      Reviewed on {new Date(talaData.reviewedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  )}
                </div>
              )}

              <p className="text-xs text-rose-900 font-medium">
                Please review the owner&apos;s feedback above, attach an updated or higher-resolution document below, and resubmit.
              </p>
            </div>
          </div>
        </div>
      )}

      {effectiveStatus === 'NOT_SUBMITTED' && (
        <div className="rounded-3xl border border-[#DEDCCF] bg-[#F7F6F1] p-6 sm:p-8 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[var(--brand)] text-white flex items-center justify-center shrink-0 shadow-md">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[var(--brand-soft)] text-[var(--brand-deep)] font-bold text-xs uppercase tracking-wider mb-1">
                <span>Compliance Step 1</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-[var(--brand-deep)]">
                Submit Your TALA License for Platform Verification
              </h2>
              <p className="text-sm text-[#344C49] mt-1 max-w-2xl font-medium">
                To build authentic trust with international safari travelers, all operators must submit their official
                Tourism Agency Licensing Authority (TALA) certificate. Once imported, the website owner reviews and certifies your agency.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Form on Left, Guidelines on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Upload / Import Form (2 Columns) */}
        <div className="lg:col-span-2 surface-card rounded-3xl border border-black/5 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-black/5 pb-4">
            <h3 className="text-lg font-bold font-display text-[var(--brand-deep)] flex items-center gap-2">
              <Upload className="w-5 h-5 text-[var(--brand)]" />
              <span>Import Official TALA Document</span>
            </h3>
            <p className="text-xs text-[var(--ink-muted)] mt-1">
              Upload your official governmental tourism license. Supported formats: PDF, PNG, JPG (up to 15MB).
            </p>
          </div>

          {feedback && (
            <div
              className={`p-4 rounded-2xl text-xs font-semibold flex items-start gap-2.5 border ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  : 'bg-rose-50 text-rose-900 border-rose-200'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Drag and Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-3xl p-8 text-center transition-all ${
                dragActive
                  ? 'border-[var(--brand)] bg-[var(--brand-soft)]/50 scale-[1.01]'
                  : 'border-black/15 hover:border-[var(--brand)] bg-[#FAF9F5]'
              }`}
            >
              <input
                type="file"
                id="tala-file-input"
                accept=".pdf,image/jpeg,image/png,image/webp,image/jpg"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={submitting}
              />
              
              <div className="flex flex-col items-center justify-center space-y-3 pointer-events-none">
                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-black/5 flex items-center justify-center text-[var(--brand)]">
                  {file ? (
                    <FileCheck className="w-7 h-7 text-emerald-600" />
                  ) : (
                    <Upload className="w-7 h-7 text-[var(--brand)]" />
                  )}
                </div>

                {file ? (
                  <div>
                    <p className="text-sm font-bold text-[#193A38]">{file.name}</p>
                    <p className="text-xs text-[var(--ink-muted)] mt-0.5">
                      {(file.size / 1024 / 1024).toFixed(2)} MB &bull; {file.type || 'Document'}
                    </p>
                    <span className="inline-block mt-2 px-3 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full">
                      Ready to upload
                    </span>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-bold text-[#193A38]">
                      Drag and drop your TALA certificate file here, or <span className="text-[var(--brand)] underline">browse files</span>
                    </p>
                    <p className="text-xs text-[var(--ink-muted)] mt-1">
                      PDF, JPEG, or PNG &bull; Max file size 15 MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Document currently on file indicator */}
            {!file && talaData.documentUrl && (
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F7F6F1] border border-black/5 text-xs">
                <div className="flex items-center gap-2.5 font-semibold text-[#193A38]">
                  <FileText className="w-4 h-4 text-[var(--brand)]" />
                  <span>Existing File on Record: <strong>{talaData.documentName || 'TALA_License.pdf'}</strong></span>
                </div>
                <a
                  href={talaData.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-[var(--brand)] hover:underline inline-flex items-center gap-1"
                >
                  <span>Preview</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              {/* TALA Registration # */}
              <div className="space-y-1.5">
                <label htmlFor="talaNumber" className="block text-xs font-bold text-[#193A38] uppercase tracking-wider">
                  TALA License / Reg # <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="talaNumber"
                  value={talaNumber}
                  onChange={(e) => setTalaNumber(e.target.value)}
                  placeholder="e.g. TALA-TZ-2026-9841"
                  required
                  disabled={submitting}
                  className="w-full px-4 py-2.5 rounded-xl border border-black/15 bg-white text-sm font-mono font-bold text-[#193A38] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
                />
                <span className="text-[11px] text-[var(--ink-muted)]">Official number issued on your license</span>
              </div>

              {/* Issuing Authority */}
              <div className="space-y-1.5">
                <label htmlFor="issuingAuthority" className="block text-xs font-bold text-[#193A38] uppercase tracking-wider">
                  Issuing Licensing Body
                </label>
                <input
                  type="text"
                  id="issuingAuthority"
                  value={issuingAuthority}
                  onChange={(e) => setIssuingAuthority(e.target.value)}
                  placeholder="e.g. Tanzania Tourism Licensing Board"
                  disabled={submitting}
                  className="w-full px-4 py-2.5 rounded-xl border border-black/15 bg-white text-sm font-semibold text-[#193A38] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
                />
                <span className="text-[11px] text-[var(--ink-muted)]">Ministry or government regulatory board</span>
              </div>

              {/* License Expiry Date */}
              <div className="space-y-1.5">
                <label htmlFor="expiryDate" className="block text-xs font-bold text-[#193A38] uppercase tracking-wider">
                  License Expiry Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="expiryDate"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    disabled={submitting}
                    className="w-full px-4 py-2.5 rounded-xl border border-black/15 bg-white text-sm font-semibold text-[#193A38] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
                  />
                </div>
                <span className="text-[11px] text-[var(--ink-muted)]">As printed on your annual certificate</span>
              </div>

              {/* Country of Registration */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#193A38] uppercase tracking-wider">
                  Registration Jurisdiction
                </label>
                <div className="w-full px-4 py-2.5 rounded-xl border border-black/10 bg-[#FAF9F5] text-sm font-bold text-[#344C49] flex items-center gap-2">
                  <Building className="w-4 h-4 text-[var(--brand)]" />
                  <span>{countryOfOrigin}</span>
                </div>
                <span className="text-[11px] text-[var(--ink-muted)]">Registered operating headquarters</span>
              </div>

            </div>

            {/* Operator remarks */}
            <div className="space-y-1.5">
              <label htmlFor="operatorNotes" className="block text-xs font-bold text-[#193A38] uppercase tracking-wider">
                Notes for Website Owner (Optional)
              </label>
              <textarea
                id="operatorNotes"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional details regarding licensing renewal, multi-country permits, or tax identification..."
                disabled={submitting}
                className="w-full px-4 py-2.5 rounded-xl border border-black/15 bg-white text-sm font-medium text-[#193A38] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
              />
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex items-center justify-end gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 rounded-2xl bg-[var(--brand)] hover:bg-[var(--brand-deep)] text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Importing &amp; Submitting Document...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Submit TALA Document for Owner Approval</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

        {/* Informational Sidebar (1 Column) */}
        <div className="space-y-6">
          <div className="surface-card rounded-3xl border border-black/5 p-6 shadow-sm space-y-4">
            <h4 className="font-bold text-sm font-display text-[var(--brand-deep)] flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[var(--brand)]" />
              <span>What is TALA Verification?</span>
            </h4>
            <p className="text-xs text-[#344C49] leading-relaxed font-medium">
              The <strong>Tourism Agency Licensing Authority (TALA)</strong> certificate is the mandatory government
              license issued to commercial safari tour operators in East &amp; Southern Africa.
            </p>
            <p className="text-xs text-[#344C49] leading-relaxed font-medium">
              SafariRequest requires manual owner verification of your TALA license to guarantee traveler safety, ethical wildlife tracking, and legitimate park concessions.
            </p>
          </div>

          <div className="surface-card rounded-3xl border border-black/5 p-6 shadow-sm space-y-4 bg-[#F7F6F1]">
            <h4 className="font-bold text-sm font-display text-[var(--brand-deep)]">Verification Standards</h4>
            <ul className="text-xs space-y-2.5 font-medium text-[#344C49]">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Certificate must match your registered agency company name.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>License must be currently valid with an unexpired term date.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Document scan must be clearly legible (300 DPI recommended).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Reviewed by the platform owner within 24 to 48 hours.</span>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
