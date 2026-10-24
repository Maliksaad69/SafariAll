'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ImageIcon,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export interface TourItem {
  id: string;
  title: string;
  slug: string;
  primaryCountry: string;
  durationDays: number;
  minPriceUsd: number;
  isPublished: boolean;
  reservationCount: number;
  mediaCount: number;
}

export default function AgencyToursTable({ initialTours }: { initialTours: TourItem[] }) {
  const router = useRouter();
  const [tours, setTours] = useState<TourItem[]>(initialTours);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const togglePublish = async (tour: TourItem) => {
    setBusyId(`pub-${tour.id}`);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/operator/tours/${tour.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !tour.isPublished }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update tour status.');

      setTours((prev) =>
        prev.map((t) => (t.id === tour.id ? { ...t, isPublished: !tour.isPublished } : t))
      );
      setSuccess(`"${tour.title}" is now ${!tour.isPublished ? 'Live on marketplace' : 'Draft'}.`);
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      setError(err.message || 'Error updating status.');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (tour: TourItem) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${tour.title}"?`)) {
      return;
    }

    setBusyId(`del-${tour.id}`);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/operator/tours/${tour.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete tour package.');

      setTours((prev) => prev.filter((t) => t.id !== tour.id));
      setSuccess(`Package "${tour.title}" has been deleted.`);
      setTimeout(() => setSuccess(''), 4000);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Error deleting package.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="surface-card overflow-hidden">
      <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[var(--border)]">
        <div>
          <h2 className="text-lg font-bold text-[var(--ink)] font-display">
            Your Safari Packages
          </h2>
          <p className="text-xs text-[var(--ink-secondary)] mt-0.5">
            {tours.length} packages created · {tours.filter((t) => t.isPublished).length} live
          </p>
        </div>
        <Link
          href="/operator-portal/tours/new"
          className="btn btn-primary btn-sm inline-flex items-center gap-1.5"
        >
          Add New Package <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {error && (
        <div className="mx-5 sm:mx-6 mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mx-5 sm:mx-6 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {tours.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="px-5 sm:px-6">Package</th>
                <th className="px-4">Country</th>
                <th className="px-4">Duration</th>
                <th className="px-4">Price from</th>
                <th className="px-4">Bookings</th>
                <th className="px-4">Status</th>
                <th className="px-4">Photos</th>
                <th className="px-5 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tours.map((tour) => (
                <tr key={tour.id}>
                  <td className="px-5 sm:px-6 font-semibold text-[var(--ink)] max-w-xs">
                    <Link href={`/tours/${tour.slug}`} className="link hover:underline block truncate">
                      {tour.title}
                    </Link>
                  </td>
                  <td className="px-4 whitespace-nowrap">{tour.primaryCountry}</td>
                  <td className="px-4 whitespace-nowrap">{tour.durationDays} days</td>
                  <td className="px-4 whitespace-nowrap font-semibold">
                    ${tour.minPriceUsd.toLocaleString()}
                  </td>
                  <td className="px-4 whitespace-nowrap">{tour.reservationCount}</td>
                  <td className="px-4 whitespace-nowrap">
                    <button
                      type="button"
                      disabled={busyId === `pub-${tour.id}`}
                      onClick={() => togglePublish(tour)}
                      className={`badge cursor-pointer transition-all hover:opacity-80 inline-flex items-center gap-1 ${
                        tour.isPublished ? 'badge-success' : 'badge-neutral'
                      }`}
                      title="Click to toggle Live/Draft"
                    >
                      {busyId === `pub-${tour.id}` ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : tour.isPublished ? (
                        <Eye className="h-3 w-3" />
                      ) : (
                        <EyeOff className="h-3 w-3" />
                      )}
                      {tour.isPublished ? 'Live' : 'Draft'}
                    </button>
                  </td>
                  <td className="px-4 whitespace-nowrap">
                    <Link
                      href={`/operator-portal/tours/${tour.id}/images`}
                      className="link inline-flex items-center gap-1.5 text-xs font-semibold"
                    >
                      <ImageIcon className="h-3.5 w-3.5" />
                      {tour.mediaCount > 0 ? `Photos (${tour.mediaCount})` : 'Upload'}
                    </Link>
                  </td>
                  <td className="px-5 sm:px-6 whitespace-nowrap text-right">
                    <div className="inline-flex items-center gap-2">
                      <Link
                        href={`/operator-portal/tours/${tour.id}/edit`}
                        className="btn btn-secondary btn-sm inline-flex items-center gap-1 text-xs"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(tour)}
                        disabled={busyId === `del-${tour.id}`}
                        className="btn btn-danger btn-sm p-1.5 text-xs"
                        title="Delete Package"
                      >
                        {busyId === `del-${tour.id}` ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="px-6 py-12 text-center">
          <p className="text-sm font-semibold text-[var(--ink)]">No packages published yet</p>
          <p className="mt-1 text-xs text-[var(--ink-secondary)]">
            Create your first safari package to start receiving bookings.
          </p>
          <Link
            href="/operator-portal/tours/new"
            className="btn btn-primary btn-sm mt-4 inline-flex items-center gap-1.5"
          >
            Create Tour Package
          </Link>
        </div>
      )}
    </section>
  );
}
