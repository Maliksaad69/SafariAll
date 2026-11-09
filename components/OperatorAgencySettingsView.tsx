'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  MapPin,
  Calendar,
  Globe,
  Tag,
  FileText,
  Image as ImageIcon,
  User,
  Mail,
  Phone,
  Save,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { SAFARI_COUNTRY_LIST } from '@/lib/countries';

interface OperatorAgencySettingsViewProps {
  initialOperator: {
    id: string;
    companyName: string;
    slug: string;
    countryOfOrigin: string;
    headquartersAddress: string | null;
    yearEstablished: number | null;
    priceTier: string | null;
    overviewText: string | null;
    officesIn: string[];
    logoUrl: string | null;
    bannerUrl: string | null;
    registrationNumber: string | null;
    isVerified: boolean;
    user?: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string | null;
    } | null;
    _count?: {
      tours: number;
      vehicles: number;
      reservations: number;
    };
  };
}

export default function OperatorAgencySettingsView({ initialOperator }: OperatorAgencySettingsViewProps) {
  const router = useRouter();

  // Profile state
  const [companyName, setCompanyName] = useState(initialOperator.companyName);
  const [slug, setSlug] = useState(initialOperator.slug);
  const [countryOfOrigin, setCountryOfOrigin] = useState(initialOperator.countryOfOrigin);
  const [headquartersAddress, setHeadquartersAddress] = useState(initialOperator.headquartersAddress || '');
  const [yearEstablished, setYearEstablished] = useState(initialOperator.yearEstablished ? String(initialOperator.yearEstablished) : '');
  const [priceTier, setPriceTier] = useState(initialOperator.priceTier || 'MID_RANGE');
  const [overviewText, setOverviewText] = useState(initialOperator.overviewText || '');
  const [officesIn, setOfficesIn] = useState<string[]>(initialOperator.officesIn || []);
  const [logoUrl, setLogoUrl] = useState(initialOperator.logoUrl || '');
  const [bannerUrl, setBannerUrl] = useState(initialOperator.bannerUrl || '');

  // Contact person state
  const [firstName, setFirstName] = useState(initialOperator.user?.firstName || '');
  const [lastName, setLastName] = useState(initialOperator.user?.lastName || '');
  const [phone, setPhone] = useState(initialOperator.user?.phone || '');

  // UI status
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmDeleteText, setConfirmDeleteText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const toggleOffice = (countryName: string) => {
    setOfficesIn((prev) =>
      prev.includes(countryName) ? prev.filter((c) => c !== countryName) : [...prev, countryName]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/operator/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: companyName.trim(),
          slug: slug.trim().toLowerCase(),
          countryOfOrigin,
          headquartersAddress: headquartersAddress.trim() || null,
          yearEstablished: yearEstablished.trim() || null,
          priceTier,
          overviewText: overviewText.trim() || null,
          officesIn,
          logoUrl: logoUrl.trim() || null,
          bannerUrl: bannerUrl.trim() || null,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update agency profile.');
      }

      setFeedback({ type: 'success', message: 'Your agency profile has been successfully saved!' });
      router.refresh();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Something went wrong.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (confirmDeleteText.trim().toLowerCase() !== 'delete') {
      setDeleteError('Please type DELETE to confirm.');
      return;
    }

    setDeleting(true);
    setDeleteError(null);

    try {
      const res = await fetch('/api/operator/profile', {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete agency.');
      }

      window.location.href = '/dashboard';
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete agency.');
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-start gap-3 border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Section 1: Core Company Profile */}
        <div className="surface-card rounded-3xl border border-black/5 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-black/5 pb-4 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-lg font-bold font-display text-[var(--brand-deep)] flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[var(--brand)]" />
                <span>Agency Details &amp; Identity</span>
              </h3>
              <p className="text-xs text-[var(--ink-muted)] mt-1">
                Manage your agency name, URL identifier, headquarters, and safari pricing tier.
              </p>
            </div>

            {initialOperator.slug && (
              <a
                href={`/operators/${initialOperator.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary text-xs py-2 inline-flex items-center gap-1.5"
              >
                <span>View Public Profile</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-60" />
              </a>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            
            {/* Company Name */}
            <div className="space-y-1.5">
              <label htmlFor="companyName" className="block text-xs font-bold text-[#193A38] uppercase tracking-wider">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                disabled={saving}
                className="w-full px-4 py-2.5 rounded-xl border border-black/15 bg-white text-xs font-bold text-[#193A38] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
              />
            </div>

            {/* Public URL Slug */}
            <div className="space-y-1.5">
              <label htmlFor="slug" className="block text-xs font-bold text-[#193A38] uppercase tracking-wider">
                Public URL Slug <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-mono">
                  /operators/
                </span>
                <input
                  type="text"
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                  disabled={saving}
                  className="w-full pl-28 pr-4 py-2.5 rounded-xl border border-black/15 bg-white text-xs font-mono font-bold text-[#193A38] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
                />
              </div>
              <span className="text-[11px] text-[var(--ink-muted)]">Unique website address for your agency page</span>
            </div>

            {/* Country of Origin */}
            <div className="space-y-1.5">
              <label htmlFor="countryOfOrigin" className="block text-xs font-bold text-[#193A38] uppercase tracking-wider">
                Primary Country of Origin <span className="text-red-500">*</span>
              </label>
              <select
                id="countryOfOrigin"
                value={countryOfOrigin}
                onChange={(e) => setCountryOfOrigin(e.target.value)}
                required
                disabled={saving}
                className="w-full px-4 py-2.5 rounded-xl border border-black/15 bg-white text-xs font-bold text-[#193A38] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
              >
                {SAFARI_COUNTRY_LIST.map((c) => (
                  <option key={c.slug} value={c.name}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Headquarters Address */}
            <div className="space-y-1.5">
              <label htmlFor="headquartersAddress" className="block text-xs font-bold text-[#193A38] uppercase tracking-wider">
                Headquarters Address
              </label>
              <input
                type="text"
                id="headquartersAddress"
                value={headquartersAddress}
                onChange={(e) => setHeadquartersAddress(e.target.value)}
                placeholder="e.g. Arusha Tourism Complex, Arusha, Tanzania"
                disabled={saving}
                className="w-full px-4 py-2.5 rounded-xl border border-black/15 bg-white text-xs font-medium text-[#193A38] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
              />
            </div>

            {/* Year Established */}
            <div className="space-y-1.5">
              <label htmlFor="yearEstablished" className="block text-xs font-bold text-[#193A38] uppercase tracking-wider">
                Year Established
              </label>
              <input
                type="number"
                id="yearEstablished"
                min="1950"
                max="2027"
                value={yearEstablished}
                onChange={(e) => setYearEstablished(e.target.value)}
                placeholder="e.g. 2012"
                disabled={saving}
                className="w-full px-4 py-2.5 rounded-xl border border-black/15 bg-white text-xs font-semibold text-[#193A38] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
              />
            </div>

            {/* Price Tier */}
            <div className="space-y-1.5">
              <label htmlFor="priceTier" className="block text-xs font-bold text-[#193A38] uppercase tracking-wider">
                Default Pricing / Comfort Tier
              </label>
              <select
                id="priceTier"
                value={priceTier}
                onChange={(e) => setPriceTier(e.target.value)}
                disabled={saving}
                className="w-full px-4 py-2.5 rounded-xl border border-black/15 bg-white text-xs font-bold text-[#193A38] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
              >
                <option value="CAMPING">Camping / Backpacker ($)</option>
                <option value="BUDGET">Budget / Affordable ($$)</option>
                <option value="MID_RANGE">Mid-Range / Comfort ($$$)</option>
                <option value="LUXURY">Luxury / High-End ($$$$)</option>
                <option value="SUPER_LUXURY">Super Luxury / Ultra-Exclusive ($$$$$)</option>
              </select>
            </div>

          </div>
        </div>

        {/* Section 2: Operating Destinations & Overview */}
        <div className="surface-card rounded-3xl border border-black/5 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-black/5 pb-4">
            <h3 className="text-lg font-bold font-display text-[var(--brand-deep)] flex items-center gap-2">
              <Globe className="w-5 h-5 text-[var(--brand)]" />
              <span>Operating Destinations &amp; Agency Story</span>
            </h3>
            <p className="text-xs text-[var(--ink-muted)] mt-1">
              Select all safari countries where you conduct guided tours and manage local ground operations.
            </p>
          </div>

          {/* Operating countries checkboxes */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#193A38] uppercase tracking-wider">
              Countries Operated In (Select all that apply)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {SAFARI_COUNTRY_LIST.map((c) => {
                const isSelected = officesIn.includes(c.name);
                return (
                  <button
                    type="button"
                    key={c.name}
                    onClick={() => toggleOffice(c.name)}
                    className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                      isSelected
                        ? 'border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand-deep)] shadow-2xs'
                        : 'border-black/10 bg-[#FAF9F5] text-gray-700 hover:bg-[#F2EFE6]'
                    }`}
                  >
                    <span>{c.flag}</span>
                    <span className="truncate">{c.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Overview / Story */}
          <div className="space-y-1.5">
            <label htmlFor="overviewText" className="block text-xs font-bold text-[#193A38] uppercase tracking-wider">
              About Us / Agency Story
            </label>
            <textarea
              id="overviewText"
              rows={4}
              value={overviewText}
              onChange={(e) => setOverviewText(e.target.value)}
              placeholder="Tell travelers about your guides, specialized routes, vehicle maintenance, conservation initiatives, and safari experience..."
              disabled={saving}
              className="w-full px-4 py-3 rounded-xl border border-black/15 bg-white text-xs font-medium text-[#193A38] focus:outline-none focus:ring-2 focus:ring-[var(--brand)] leading-relaxed"
            />
          </div>
        </div>

        {/* Section 3: Visual Branding (Logo & Banner) */}
        <div className="surface-card rounded-3xl border border-black/5 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-black/5 pb-4">
            <h3 className="text-lg font-bold font-display text-[var(--brand-deep)] flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-[var(--brand)]" />
              <span>Branding &amp; Imagery</span>
            </h3>
            <p className="text-xs text-[var(--ink-muted)] mt-1">
              Provide direct image URLs for your company logo and hero banner.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label htmlFor="logoUrl" className="block text-xs font-bold text-[#193A38] uppercase tracking-wider">
                Logo Image URL
              </label>
              <input
                type="url"
                id="logoUrl"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://.../logo.png"
                disabled={saving}
                className="w-full px-4 py-2.5 rounded-xl border border-black/15 bg-white text-xs font-mono text-[#193A38] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
              />
              {logoUrl ? (
                <div className="w-20 h-20 rounded-2xl bg-white border border-black/10 p-2 shadow-xs flex items-center justify-center overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logoUrl} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-[#F7F6F1] border border-dashed border-black/15 flex items-center justify-center text-[10px] text-gray-400 font-bold">
                  No Logo
                </div>
              )}
            </div>

            <div className="space-y-3">
              <label htmlFor="bannerUrl" className="block text-xs font-bold text-[#193A38] uppercase tracking-wider">
                Banner Image URL
              </label>
              <input
                type="url"
                id="bannerUrl"
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                placeholder="https://.../banner.jpg"
                disabled={saving}
                className="w-full px-4 py-2.5 rounded-xl border border-black/15 bg-white text-xs font-mono text-[#193A38] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
              />
              {bannerUrl ? (
                <div className="w-full h-24 rounded-2xl bg-white border border-black/10 overflow-hidden shadow-xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={bannerUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-full h-24 rounded-2xl bg-[#F7F6F1] border border-dashed border-black/15 flex items-center justify-center text-[10px] text-gray-400 font-bold">
                  No Banner Image
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 4: Contact Person & User Information */}
        <div className="surface-card rounded-3xl border border-black/5 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-black/5 pb-4">
            <h3 className="text-lg font-bold font-display text-[var(--brand-deep)] flex items-center gap-2">
              <User className="w-5 h-5 text-[var(--brand)]" />
              <span>Primary Representative Contact Details</span>
            </h3>
            <p className="text-xs text-[var(--ink-muted)] mt-1">
              Contact person displayed on client inquiries and reservation notifications.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="space-y-1.5">
              <label htmlFor="firstName" className="block text-xs font-bold text-[#193A38] uppercase tracking-wider">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={saving}
                className="w-full px-4 py-2.5 rounded-xl border border-black/15 bg-white text-xs font-medium text-[#193A38] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="lastName" className="block text-xs font-bold text-[#193A38] uppercase tracking-wider">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={saving}
                className="w-full px-4 py-2.5 rounded-xl border border-black/15 bg-white text-xs font-medium text-[#193A38] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="phone" className="block text-xs font-bold text-[#193A38] uppercase tracking-wider">
                Direct WhatsApp / Phone
              </label>
              <input
                type="text"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+255 754 000 000"
                disabled={saving}
                className="w-full px-4 py-2.5 rounded-xl border border-black/15 bg-white text-xs font-medium text-[#193A38] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
              />
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-4 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 rounded-2xl bg-[var(--brand)] hover:bg-[var(--brand-deep)] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Agency Profile Changes</span>
              </>
            )}
          </button>
        </div>

      </form>

      {/* Danger Zone: Delete Agency */}
      <div className="surface-card rounded-3xl border-2 border-rose-200 p-6 sm:p-8 bg-rose-50/40 space-y-5">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="space-y-1">
            <h4 className="text-base font-bold font-display text-rose-950 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-rose-600" />
              <span>Danger Zone: Delete Tour Agency Profile</span>
            </h4>
            <p className="text-xs text-rose-900 font-medium max-w-xl">
              Permanently delete this agency from SafariRequest. This will immediately remove all your tour packages ({initialOperator._count?.tours ?? 0}),
              fleet vehicles ({initialOperator._count?.vehicles ?? 0}), and marketplace listings. This action cannot be undone.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete This Agency</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-black/10 overflow-hidden">
            <div className="p-6 border-b border-black/5 bg-rose-50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold font-display text-rose-950">
                  Delete Tour Agency
                </h3>
                <p className="text-xs text-rose-800">Permanent and irreversible action</p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-gray-700 leading-relaxed">
                You are about to permanently delete <strong>{initialOperator.companyName}</strong>.
                All tour packages, upcoming departures, fleet inventory, and reviews will be wiped immediately.
              </p>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  Type <span className="font-mono text-rose-600 font-black">DELETE</span> to confirm:
                </label>
                <input
                  type="text"
                  value={confirmDeleteText}
                  onChange={(e) => setConfirmDeleteText(e.target.value)}
                  placeholder="DELETE"
                  disabled={deleting}
                  className="w-full px-4 py-2 rounded-xl border border-black/20 text-xs font-mono font-bold text-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              {deleteError && (
                <div className="p-3 rounded-xl bg-rose-100 text-rose-900 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{deleteError}</span>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-black/5 bg-[#F7F6F1] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setConfirmDeleteText('');
                  setDeleteError(null);
                }}
                disabled={deleting}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-200/50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting || confirmDeleteText.trim().toLowerCase() !== 'delete'}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting Agency...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Permanently Delete</span>
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
