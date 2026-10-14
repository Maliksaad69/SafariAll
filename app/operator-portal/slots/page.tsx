'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ArrowLeft, Calendar, Plus, Trash2, Loader2, AlertTriangle } from 'lucide-react';

export default function SlotManagerPage() {
  const router = useRouter();
  const [tourId, setTourId] = useState<string>('');
  const [tourName, setTourName] = useState<{ id: string; title: string; slug: string; } | null>(null);
  const [tours, setTours] = useState<{ id: string; title: string; slug: string; }[]>([]);
  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState<{ id: string; startDate: string; maxTravelers: number; bookedTravelers: number; note: string | null; }[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [addForm, setAddForm] = useState({ startDate: '', maxTravelers: 10, note: '' });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/operator/tours')
      .then((r) => r.json())
      .then(({ tours } = {}) => {
        const items = (tours || []).map((t: any) => ({ id: t.id, title: t.title, slug: t.slug }));
        setTours(items);
        if (items.length > 0 && !tourId) {
          setTourId(items[0].id);
          setTourName(items[0]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const loadSlots = (targetTourId: string) => {
    if (!targetTourId) {
      setSlots([]);
      return;
    }
    setLoadingSlots(true);
    fetch(`/api/tours/${targetTourId}/slots`)
      .then((r) => r.json())
      .then(({ availability } = {}) => {
        const items = (availability || []).map((a: any) => ({
          id: a.slotId,
          startDate: a.startDate.slice(0, 10),
          maxTravelers: a.maxTravelers,
          bookedTravelers: a.bookedTravelers,
          note: a.note,
        }));
        setSlots(items);
        setLoadingSlots(false);
      })
      .catch(() => setLoadingSlots(false));
  };

  useEffect(() => {
    if (!tourId) {
      setSlots([]);
      setTourName(null);
      return;
    }
    const found = tours.find((t) => t.id === tourId);
    if (found) setTourName(found);
    loadSlots(tourId);
  }, [tourId, tours]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.startDate || addForm.maxTravelers < 1) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/tours/${tourId}/slots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add departure.');
      setAddForm({ startDate: '', maxTravelers: 10, note: '' });
      loadSlots(tourId);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  const del = async (slotId: string) => {
    setDeletingId(slotId);
    try {
      const res = await fetch(`/api/tours/${tourId}/slots`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to remove departure.');
      loadSlots(tourId);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--surface-page)] text-[var(--ink-body)]">
      <Navbar />
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-7">
        <div className="flex items-center gap-3">
          <Link href="/operator-portal" className="inline-flex items-center gap-2 text-xs font-bold text-[var(--ink-secondary)] hover:underline">
            <ArrowLeft className="h-3.5 w-3.5"/> Back to portal
          </Link>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)]">Departure Slots</span>
        </div>

        <div className="surface-card grid grid-cols-1 md:grid-cols-2 gap-5">
          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <label className="form-label">Safari package</label>
            {loading ? (
              <div className="animate-pulse h-9 rounded-xl bg-[var(--surface-sunk)]"/>
            ) : (
              <select value={tourId} onChange={(e) => setTourId(e.target.value)} className="form-control">
                <option value="">Select a package…</option>
                {tours.map((t) => (
                  <option key={t.id} value={t.id}>{t.title} — {t.slug}</option>
                ))}
              </select>
            )}
            <p className="text-xs text-[var(--ink-secondary)]">Define fixed departure dates for each package with a maximum number of travelers. Once a slot is full, the booking form shows “fully booked” and no traveler can request it.</p>
          </form>
          {!tourId && (
            <div className="flex items-center justify-center border-2 border-dashed border-[var(--border)] rounded-xl h-32 text-center">
              <div className="max-w-xs text-center">
                <Calendar className="h-8 w-8 text-[var(--ink-muted)] mx-auto mb-3"/>
                <p className="text-sm font-semibold text-[var(--ink-secondary)]">Choose a safari package above</p>
                <p className="mt-1 text-xs text-[var(--ink-muted)]">Departure slots will appear here.</p>
              </div>
            </div>
          )}
        </div>

        {tourId && (
          <section className="surface-card">
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[var(--ink)]">{tourName?.title ?? ''}</span>
                <span className="text-xs text-[var(--ink-muted)]">{tourName?.slug ?? ''}</span>
              </div>
              <span className="badge badge-on-dark text-xs">{slots.length} departure{slots.length !== 1 ? 's' : ''}</span>
            </div>

            <form onSubmit={add} className="px-5 sm:px-6 pt-4 pb-3 flex flex-col sm:flex-row gap-3">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div><label htmlFor="as-date" className="form-label">Departure date</label><input id="as-date" type="date" min={new Date().toISOString().split('T')[0]} value={addForm.startDate} onChange={(e) => setAddForm(s => ({ ...s, startDate: e.target.value }))} className="form-control"/></div>
                <div><label htmlFor="as-cap" className="form-label">Max group size</label><input id="as-cap" type="number" min="1" max="200" value={addForm.maxTravelers} onChange={(e) => setAddForm(s => ({ ...s, maxTravelers: Number(e.target.value) }))} className="form-control"/></div>
                <div className="sm:col-span-3"><label htmlFor="as-note" className="form-label">Note (optional)</label><input id="as-note" value={addForm.note} onChange={(e) => setAddForm(s => ({ ...s, note: e.target.value }))} className="form-control"/></div>
              </div>
              <button type="submit" disabled={saving || !addForm.startDate || addForm.maxTravelers < 1} className="btn btn-primary">
                {saving ? <Loader2 className="h-4 w-4 animate-spin"/> : <Plus className="h-4 w-4"/>} Add departure
              </button>
            </form>

            {error && <p className="mx-5 mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{error}</p>}

            {loadingSlots ? (
              <div className="px-5 py-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-[var(--ink-muted)]"/></div>
            ) : slots.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Calendar className="h-8 w-8 text-[var(--ink-muted)] mx-auto mb-3"/>
                <p className="text-sm font-semibold text-[var(--ink-secondary)]">No departures yet for this package</p>
                <p className="mt-1 text-xs text-[var(--ink-muted)]">Use the form above to define fixed dates and their capacities.</p>
              </div>
            ) : (
              <ul className="divide-y divide-[var(--border-soft)]">
                {slots.map((s) => {
                  const full = s.bookedTravelers >= s.maxTravelers;
                  const pct = s.maxTravelers > 0 ? Math.round((s.bookedTravelers / s.maxTravelers) * 100) : 0;
                  return (
                    <li key={s.id} className="px-5 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-3 min-w-0">
                        {full ? (
                          <span className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold uppercase bg-red-100 text-red-700">FULL</span>
                        ) : (
                          <span className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold uppercase bg-[var(--success-soft)] text-[var(--success)]">OPEN</span>
                        )}
                        <div className="min-w-0">
                          <div className="font-semibold text-[var(--ink)]">{new Date(s.startDate).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}</div>
                          <div className="text-xs text-[var(--ink-secondary)]">
                            {s.bookedTravelers} of {s.maxTravelers} travelers · {pct}% capacity
                            {s.note ? ` — ${s.note}` : ''}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center shrink-0">
                        <div className="flex items-center gap-0.5 h-4 w-[100px] rounded-full bg-[var(--surface-sunk)] overflow-hidden">
                          <div className="h-full rounded-l-full" style={{ width: `${Math.min(100, pct)}%`, background: full ? 'var(--danger)' : 'var(--warning)' }}/>
                        </div>
                        <button type="button" onClick={() => del(s.id)} disabled={deletingId === s.id || s.bookedTravelers > 0} className="btn btn-sm btn-danger" title="Remove departure (only allowed when no active bookings)">
                          {deletingId === s.id ? <Loader2 className="h-3.5 w-3.5 animate-spin"/> : <Trash2 className="h-3.5 w-3.5"/>}
                          {s.bookedTravelers > 0 ? 'Has bookings' : 'Remove'}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
