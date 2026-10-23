'use client';

import { useCallback, useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ArrowLeft, Bus, Calendar, Loader2, Lock, Plus, Radio, Trash2, Unlock } from 'lucide-react';
import { useLiveRefresh } from '@/lib/use-live';

interface Vehicle {
  id: string;
  name: string;
  vehicleType: string;
  seats: number;
  plateNumber: string | null;
  isActive: boolean;
  upcomingDepartures: number;
}

interface Departure {
  slotId: string;
  startDate: string;
  departureTime: string;
  route: string | null;
  maxTravelers: number;
  bookedTravelers: number;
  spotsLeft: number;
  maxGroup: number;
  isFull: boolean;
  status: 'OPEN' | 'CLOSED';
  note: string | null;
  vehicles: { vehicleId: string; name: string; vehicleType: string; seats: number; bookedSeats: number; plateNumber?: string | null }[];
}

const fmtDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

async function send(url: string, method: string, body: unknown) {
  const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong.');
  return data;
}

function SeatBar({ booked, total }: { booked: number; total: number }) {
  const pct = total > 0 ? Math.min(100, Math.round((booked / total) * 100)) : 0;
  const color = booked >= total ? 'var(--danger)' : pct >= 75 ? 'var(--warning)' : 'var(--success)';
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--surface-sunk)]">
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

export default function SlotManagerPage() {
  const [tours, setTours] = useState<{ id: string; title: string; slug: string }[]>([]);
  const [tourId, setTourId] = useState('');
  const [loadingTours, setLoadingTours] = useState(true);
  const [fleet, setFleet] = useState<Vehicle[]>([]);
  const [departures, setDepartures] = useState<Departure[] | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const [vehicleForm, setVehicleForm] = useState({ name: '', vehicleType: '4x4 Land Cruiser', seats: 7, plateNumber: '' });
  const [depForm, setDepForm] = useState({ startDate: '', departureTime: '07:30', route: '', note: '', maxTravelers: 10, vehicleIds: [] as string[] });

  useEffect(() => {
    fetch('/api/operator/tours')
      .then((r) => r.json())
      .then(({ tours: items = [] }) => {
        const list = items.map((t: { id: string; title: string; slug: string }) => ({ id: t.id, title: t.title, slug: t.slug }));
        setTours(list);
        if (list.length) setTourId(list[0].id);
      })
      .finally(() => setLoadingTours(false));
  }, []);

  const loadFleet = useCallback(() => {
    fetch('/api/operator/vehicles', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : { vehicles: [] }))
      .then((d) => setFleet(d.vehicles ?? []));
  }, []);

  const loadDepartures = useCallback(() => {
    if (!tourId) return;
    fetch(`/api/tours/${tourId}/slots?manage=1`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : { availability: [] }))
      .then((d) => {
        setDepartures(d.availability ?? []);
        setLastUpdate(new Date());
      });
  }, [tourId]);

  useEffect(loadFleet, [loadFleet]);
  useEffect(loadDepartures, [loadDepartures]);

  // Seats change on screen the moment a traveller books or cancels.
  useLiveRefresh(tourId ? `tour=${encodeURIComponent(tourId)}` : null, loadDepartures);

  const run = async (key: string, fn: () => Promise<unknown>) => {
    setBusy(key);
    setError('');
    try {
      await fn();
      loadDepartures();
      loadFleet();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setBusy(null);
    }
  };

  const activeFleet = fleet.filter((v) => v.isActive);
  const selectedSeats = activeFleet.filter((v) => depForm.vehicleIds.includes(v.id)).reduce((n, v) => n + v.seats, 0);
  const tourName = tours.find((t) => t.id === tourId)?.title ?? '';

  return (
    <div className="min-h-screen flex flex-col bg-[var(--surface-page)] text-[var(--ink-body)]">
      <Navbar />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-7">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/operator-portal" className="inline-flex items-center gap-2 text-xs font-bold text-[var(--ink-secondary)] hover:underline">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to portal
          </Link>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)]">Fleet &amp; Departures</span>
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-[var(--success-soft)] px-3 py-1 text-[11px] font-bold text-[var(--success)]">
            <Radio className="h-3.5 w-3.5" /> Live{lastUpdate ? ` · updated ${lastUpdate.toLocaleTimeString()}` : ''}
          </span>
        </div>

        {error && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{error}</p>}

        {/* ── Fleet ── */}
        <section className="surface-card">
          <div className="flex items-center gap-2 border-b border-[var(--border)] px-5 py-4 sm:px-6">
            <Bus className="h-4 w-4 text-[var(--brand-ink)]" />
            <h2 className="font-bold text-[var(--ink)]">Your fleet</h2>
            <span className="text-xs text-[var(--ink-muted)]">{activeFleet.length} active · {activeFleet.reduce((n, v) => n + v.seats, 0)} seats</span>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              run('vehicle-add', async () => {
                await send('/api/operator/vehicles', 'POST', vehicleForm);
                setVehicleForm((f) => ({ ...f, name: '', plateNumber: '' }));
              });
            }}
            className="grid grid-cols-1 gap-3 px-5 pt-4 pb-3 sm:grid-cols-5 sm:px-6"
          >
            <div className="sm:col-span-2"><label className="form-label" htmlFor="v-name">Vehicle name</label><input id="v-name" className="form-control" placeholder="Land Cruiser 1" value={vehicleForm.name} onChange={(e) => setVehicleForm((f) => ({ ...f, name: e.target.value }))} /></div>
            <div><label className="form-label" htmlFor="v-type">Type</label><input id="v-type" className="form-control" value={vehicleForm.vehicleType} onChange={(e) => setVehicleForm((f) => ({ ...f, vehicleType: e.target.value }))} /></div>
            <div><label className="form-label" htmlFor="v-seats">Seats</label><input id="v-seats" type="number" min={1} max={100} className="form-control" value={vehicleForm.seats} onChange={(e) => setVehicleForm((f) => ({ ...f, seats: Number(e.target.value) }))} /></div>
            <div><label className="form-label" htmlFor="v-plate">Plate (optional)</label><input id="v-plate" className="form-control" value={vehicleForm.plateNumber} onChange={(e) => setVehicleForm((f) => ({ ...f, plateNumber: e.target.value }))} /></div>
            <div className="sm:col-span-5">
              <button type="submit" className="btn btn-primary btn-sm" disabled={busy === 'vehicle-add' || !vehicleForm.name || vehicleForm.seats < 1}>
                {busy === 'vehicle-add' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add vehicle
              </button>
            </div>
          </form>
          {fleet.length > 0 && (
            <ul className="divide-y divide-[var(--border-soft)]">
              {fleet.map((v) => (
                <li key={v.id} className={`flex flex-wrap items-center gap-3 px-5 py-3 text-sm sm:px-6 ${v.isActive ? '' : 'opacity-50'}`}>
                  <span className="font-semibold text-[var(--ink)]">{v.name}</span>
                  <span className="text-xs text-[var(--ink-secondary)]">{v.vehicleType} · {v.seats} seats{v.plateNumber ? ` · ${v.plateNumber}` : ''}</span>
                  <span className="text-xs text-[var(--ink-muted)]">{v.upcomingDepartures} upcoming departure{v.upcomingDepartures === 1 ? '' : 's'}</span>
                  <span className="ml-auto flex gap-2">
                    <button type="button" className="btn btn-sm btn-ghost" disabled={busy === v.id} onClick={() => run(v.id, () => send(`/api/operator/vehicles/${v.id}`, 'PATCH', { isActive: !v.isActive }))}>
                      {v.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    {v.upcomingDepartures === 0 && (
                      <button type="button" className="btn btn-sm btn-danger" disabled={busy === v.id} onClick={() => run(v.id, () => send(`/api/operator/vehicles/${v.id}`, 'DELETE', {}))}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ── Departures ── */}
        <section className="surface-card">
          <div className="flex flex-wrap items-center gap-3 border-b border-[var(--border)] px-5 py-4 sm:px-6">
            <Calendar className="h-4 w-4 text-[var(--brand-ink)]" />
            <h2 className="font-bold text-[var(--ink)]">Departures</h2>
            {loadingTours ? (
              <div className="h-9 w-64 animate-pulse rounded-xl bg-[var(--surface-sunk)]" />
            ) : (
              <select value={tourId} onChange={(e) => setTourId(e.target.value)} className="form-control max-w-md">
                {tours.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
              </select>
            )}
          </div>

          {tourId && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                run('dep-add', async () => {
                  await send(`/api/tours/${tourId}/slots`, 'POST', {
                    ...depForm,
                    vehicleIds: depForm.vehicleIds,
                    maxTravelers: depForm.vehicleIds.length ? undefined : depForm.maxTravelers,
                  });
                  setDepForm((f) => ({ ...f, startDate: '', note: '' }));
                });
              }}
              className="space-y-3 px-5 pt-4 pb-4 sm:px-6"
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                <div><label className="form-label" htmlFor="d-date">Date</label><input id="d-date" type="date" min={new Date().toISOString().slice(0, 10)} className="form-control" value={depForm.startDate} onChange={(e) => setDepForm((f) => ({ ...f, startDate: e.target.value }))} /></div>
                <div><label className="form-label" htmlFor="d-time">Departure time</label><input id="d-time" type="time" className="form-control" value={depForm.departureTime} onChange={(e) => setDepForm((f) => ({ ...f, departureTime: e.target.value }))} /></div>
                <div className="sm:col-span-2"><label className="form-label" htmlFor="d-route">Route</label><input id="d-route" className="form-control" placeholder="Arusha → Tarangire → Serengeti" value={depForm.route} onChange={(e) => setDepForm((f) => ({ ...f, route: e.target.value }))} /></div>
              </div>
              <div>
                <span className="form-label">Vehicles on this departure</span>
                {activeFleet.length === 0 ? (
                  <p className="text-xs text-[var(--ink-muted)]">Add vehicles above to sell seats per vehicle, or set a group size below.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {activeFleet.map((v) => {
                      const on = depForm.vehicleIds.includes(v.id);
                      return (
                        <button
                          type="button"
                          key={v.id}
                          onClick={() => setDepForm((f) => ({ ...f, vehicleIds: on ? f.vehicleIds.filter((x) => x !== v.id) : [...f.vehicleIds, v.id] }))}
                          className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${on ? 'border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand-ink)]' : 'border-[var(--border)] text-[var(--ink-secondary)]'}`}
                        >
                          {v.name} · {v.seats} seats
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-end gap-3">
                {depForm.vehicleIds.length === 0 ? (
                  <div><label className="form-label" htmlFor="d-cap">Max group size</label><input id="d-cap" type="number" min={1} max={500} className="form-control w-32" value={depForm.maxTravelers} onChange={(e) => setDepForm((f) => ({ ...f, maxTravelers: Number(e.target.value) }))} /></div>
                ) : (
                  <div className="text-sm font-semibold text-[var(--ink)]">Capacity: {selectedSeats} seats</div>
                )}
                <div className="flex-1 min-w-[200px]"><label className="form-label" htmlFor="d-note">Note (optional)</label><input id="d-note" className="form-control" value={depForm.note} onChange={(e) => setDepForm((f) => ({ ...f, note: e.target.value }))} /></div>
                <button type="submit" className="btn btn-primary" disabled={busy === 'dep-add' || !depForm.startDate}>
                  {busy === 'dep-add' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add departure
                </button>
              </div>
            </form>
          )}

          {departures === null ? (
            <div className="flex justify-center px-5 py-8"><Loader2 className="h-6 w-6 animate-spin text-[var(--ink-muted)]" /></div>
          ) : departures.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Calendar className="mx-auto mb-3 h-8 w-8 text-[var(--ink-muted)]" />
              <p className="text-sm font-semibold text-[var(--ink-secondary)]">No departures for {tourName || 'this package'} yet</p>
              <p className="mt-1 text-xs text-[var(--ink-muted)]">Without departures, travellers can request any date.</p>
            </div>
          ) : (
            <ul className="divide-y divide-[var(--border-soft)]">
              {departures.map((d) => {
                const past = d.startDate < new Date().toISOString().slice(0, 10);
                const label = d.status === 'CLOSED' ? 'CLOSED' : d.spotsLeft <= 0 ? 'FULL' : 'OPEN';
                return (
                  <li key={d.slotId} className={`space-y-3 px-5 py-4 sm:px-6 ${past ? 'opacity-60' : ''}`}>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${label === 'OPEN' ? 'bg-[var(--success-soft)] text-[var(--success)]' : label === 'FULL' ? 'bg-red-100 text-red-700' : 'bg-[var(--surface-sunk)] text-[var(--ink-secondary)]'}`}>{label}</span>
                      <div className="min-w-0">
                        <div className="font-semibold text-[var(--ink)]">{fmtDate(d.startDate)} · {d.departureTime}{past ? ' (departed)' : ''}</div>
                        <div className="text-xs text-[var(--ink-secondary)]">
                          {d.route ? `${d.route} · ` : ''}{d.bookedTravelers} of {d.maxTravelers} seats booked · {d.spotsLeft} left{d.note ? ` · ${d.note}` : ''}
                        </div>
                      </div>
                      <div className="ml-auto flex gap-2">
                        {!past && (
                          <button
                            type="button"
                            className="btn btn-sm btn-ghost"
                            disabled={busy === d.slotId}
                            onClick={() => run(d.slotId, () => send(`/api/tours/${tourId}/slots`, 'PATCH', { slotId: d.slotId, status: d.status === 'OPEN' ? 'CLOSED' : 'OPEN' }))}
                          >
                            {d.status === 'OPEN' ? <><Lock className="h-3.5 w-3.5" /> Close sales</> : <><Unlock className="h-3.5 w-3.5" /> Reopen</>}
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          disabled={busy === d.slotId || d.bookedTravelers > 0}
                          title={d.bookedTravelers > 0 ? 'Has bookings: close it instead' : 'Delete departure'}
                          onClick={() => run(d.slotId, () => send(`/api/tours/${tourId}/slots`, 'DELETE', { slotId: d.slotId }))}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <SeatBar booked={d.bookedTravelers} total={d.maxTravelers} />
                    {d.vehicles.length > 0 && (
                      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {d.vehicles.map((v) => (
                          <div key={v.vehicleId} className="rounded-xl border border-[var(--border-soft)] p-2.5 text-xs">
                            <div className="flex justify-between font-semibold text-[var(--ink)]">
                              <span>{v.name}</span>
                              <span className={v.bookedSeats >= v.seats ? 'text-red-700' : ''}>{v.bookedSeats >= v.seats ? 'Full' : `${v.seats - v.bookedSeats} free`}</span>
                            </div>
                            <div className="mb-1.5 text-[var(--ink-muted)]">{v.vehicleType}{v.plateNumber ? ` · ${v.plateNumber}` : ''} · {v.bookedSeats}/{v.seats}</div>
                            <SeatBar booked={v.bookedSeats} total={v.seats} />
                          </div>
                        ))}
                      </div>
                    )}
                    {!past && activeFleet.length > 0 && (
                      <details className="text-xs">
                        <summary className="cursor-pointer font-semibold text-[var(--brand-ink)]">Change vehicles</summary>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {activeFleet.map((v) => {
                            const on = d.vehicles.some((x) => x.vehicleId === v.id);
                            const ids = on ? d.vehicles.filter((x) => x.vehicleId !== v.id).map((x) => x.vehicleId) : [...d.vehicles.map((x) => x.vehicleId), v.id];
                            return (
                              <button
                                key={v.id}
                                type="button"
                                disabled={busy === d.slotId}
                                onClick={() => run(d.slotId, () => send(`/api/tours/${tourId}/slots`, 'PATCH', { slotId: d.slotId, vehicleIds: ids, maxTravelers: ids.length ? undefined : d.maxTravelers }))}
                                className={`rounded-full border px-3 py-1.5 font-semibold ${on ? 'border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand-ink)]' : 'border-[var(--border)] text-[var(--ink-secondary)]'}`}
                              >
                                {on ? '✓ ' : '+ '}{v.name} ({v.seats})
                              </button>
                            );
                          })}
                        </div>
                      </details>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
