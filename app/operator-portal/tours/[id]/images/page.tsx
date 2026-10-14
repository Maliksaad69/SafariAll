'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  ArrowLeft,
  ImagePlus,
  Loader2,
  Star,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Images,
} from 'lucide-react';

interface ImageRow {
  id: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  altText: string | null;
  isCover: boolean;
  sortOrder: number;
  url: string;
}

const MAX_BYTES = 5 * 1024 * 1024;

const kb = (n: number) => (n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`);

export default function TourImagesPage() {
  const params = useParams<{ id: string }>();
  const tourId = params?.id as string;

  const [images, setImages] = useState<ImageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/operator/tours/${tourId}/images`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load images.');
      setImages(Array.isArray(data.images) ? data.images : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load images.');
    } finally {
      setLoading(false);
    }
  }, [tourId]);

  useEffect(() => {
    if (tourId) load();
  }, [tourId, load]);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError('');
    setNotice('');
    setUploading(true);

    let uploaded = 0;
    const failures: string[] = [];

    for (const file of Array.from(files)) {
      if (file.size > MAX_BYTES) {
        failures.push(`${file.name} (${kb(file.size)} — over the 5 MB limit)`);
        continue;
      }
      const body = new FormData();
      body.append('file', file);
      try {
        const res = await fetch(`/api/operator/tours/${tourId}/images`, { method: 'POST', body });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Upload failed.');
        uploaded += 1;
        setImages((prev) => [...prev, data.image as ImageRow]);
      } catch (err) {
        failures.push(`${file.name} (${err instanceof Error ? err.message : 'upload failed'})`);
      }
    }

    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
    if (uploaded > 0) setNotice(`${uploaded} image${uploaded === 1 ? '' : 's'} uploaded and saved to the database.`);
    if (failures.length > 0) setError(`Could not upload: ${failures.join('; ')}`);
    if (uploaded > 0) load();
  };

  const setCover = async (imageId: string) => {
    setBusyId(imageId);
    setError('');
    try {
      const res = await fetch(`/api/operator/tours/${tourId}/images?imageId=${imageId}`, { method: 'PATCH' });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to set cover.');
      setImages((prev) => prev.map((i) => ({ ...i, isCover: i.id === imageId })));
      setNotice('Cover image updated.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set cover.');
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (imageId: string) => {
    setBusyId(imageId);
    setError('');
    try {
      const res = await fetch(`/api/operator/tours/${tourId}/images?imageId=${imageId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to delete.');
      setImages((prev) => prev.filter((i) => i.id !== imageId));
      setNotice('Image deleted.');
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-screen font-sans text-[var(--ink-body)]">
      <Navbar />

      <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          href="/operator-portal"
          className="inline-flex items-center gap-2 text-xs font-bold text-[var(--brand-ink)] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Back to portal
        </Link>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--brand-ink)]">
              Package gallery
            </p>
            <h1 className="mt-1 text-3xl font-semibold text-[var(--ink)]">Package photos</h1>
            <p className="mt-1 max-w-2xl text-sm text-[var(--ink-secondary)]">
              Upload photos of this package. Images are stored as binary blobs in the database and shown to
              travellers on the package page. The cover image is used as the hero.
            </p>
          </div>
          <span className="rounded-full bg-[var(--surface-sunk)] px-3 py-1.5 text-xs font-semibold text-[var(--ink-secondary)]">
            {images.length} image{images.length === 1 ? '' : 's'}
          </span>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mt-5 flex items-start gap-2 rounded-2xl border border-[rgba(220,38,38,0.25)] bg-[var(--danger-soft)] px-4 py-3 text-sm font-semibold text-[var(--danger)]">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {notice && !error && (
          <div className="mt-5 flex items-start gap-2 rounded-2xl border border-[rgba(21,128,61,0.25)] bg-[var(--success-soft)] px-4 py-3 text-sm font-semibold text-[var(--success)]">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        {/* Upload */}
        <div className="mt-6 rounded-3xl border border-[var(--glass-border)] bg-white p-6 shadow-[0_18px_44px_rgba(1,45,50,0.08)]">
          <label
            htmlFor="tour-image-input"
            className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
              uploading
                ? 'border-[var(--brand)] bg-[var(--brand-soft)]'
                : 'border-[var(--border-strong)] hover:border-[var(--brand)] hover:bg-[var(--brand-soft)]'
            }`}
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-soft)] text-[var(--brand-ink)]">
              {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <ImagePlus className="h-6 w-6" />}
            </span>
            <span className="mt-3 text-sm font-bold text-[var(--ink)]">
              {uploading ? 'Uploading…' : 'Click to choose photos'}
            </span>
            <span className="mt-1 text-xs text-[var(--ink-muted)]">
              JPEG, PNG, WebP, AVIF or GIF · up to 5 MB each · you can select several at once
            </span>
            <input
              ref={inputRef}
              id="tour-image-input"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
              multiple
              disabled={uploading}
              onChange={(e) => handleFiles(e.target.files)}
              className="sr-only"
            />
          </label>
        </div>

        {/* Grid */}
        <section className="mt-6">
          {loading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-44 animate-pulse rounded-2xl bg-[var(--surface-sunk)]" />
              ))}
            </div>
          ) : images.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[var(--border)] px-6 py-14 text-center">
              <Images className="mx-auto h-8 w-8 text-[var(--ink-muted)]" />
              <p className="mt-3 text-sm font-semibold text-[var(--ink)]">No photos yet</p>
              <p className="mt-1 text-xs text-[var(--ink-muted)]">
                The package page falls back to a stock image until you upload the first photo.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {images.map((img) => (
                <figure
                  key={img.id}
                  className="group overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm"
                >
                  <div className="relative h-44 w-full overflow-hidden bg-[var(--surface-sunk)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={img.altText || img.filename}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {img.isCover && (
                      <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-[var(--brand)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow">
                        <Star className="h-3 w-3 fill-current" /> Cover
                      </span>
                    )}
                  </div>
                  <figcaption className="space-y-2.5 p-3">
                    <div className="min-w-0">
                      <div className="truncate text-[13px] font-semibold text-[var(--ink)]" title={img.filename}>
                        {img.filename}
                      </div>
                      <div className="text-[11px] text-[var(--ink-muted)]">
                        {kb(img.sizeBytes)} · {img.mimeType.replace('image/', '').toUpperCase()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setCover(img.id)}
                        disabled={img.isCover || busyId === img.id}
                        className="btn btn-secondary btn-sm flex-1"
                      >
                        {busyId === img.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Star className="h-3.5 w-3.5" />}
                        {img.isCover ? 'Cover' : 'Set cover'}
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(img.id)}
                        disabled={busyId === img.id}
                        aria-label={`Delete ${img.filename}`}
                        className="btn btn-danger btn-sm"
                      >
                        {busyId === img.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
