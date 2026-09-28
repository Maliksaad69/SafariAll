'use client';

import { useState } from 'react';
import { CalendarDays, Users, Mail, Phone, Globe, Check, X, Loader2, Inbox } from 'lucide-react';

interface ReservationItem {
  id: string;
  reference: string;
  startDate: string;
  adultsCount: number;
  childrenCount: number;
  specialRequests: string | null;
  estimatedTotalUsd: number;
  status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'CANCELLED';
  operatorNote: string | null;
  decidedAt: string | null;
  createdAt: string;
  traveler: { firstName: string; lastName: string; email: string; phone: string | null; country: string | null };
  tour: { title: string; slug: string; durationDays: number };
}

function StatusBadge({ status }: { status: ReservationItem['status'] }) {
  if (status === 'APPROVED') return <span className="badge badge-success">Approved</span>;
  if (status === 'DECLINED') return <span className="badge badge-danger">Declined</span>;
  if (status === 'CANCELLED') return <span className="badge badge-neutral">Cancelled</span>;
  return <span className="badge badge-warning">Pending</span>;
}

export default function AgencyReservationsTable({ initialReservations }: { initialReservations: ReservationItem[] }) {
  const [reservations, setReservations] = useState(initialReservations);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'DECLINED'>('ALL');
  const [confirmDeclineId, setConfirmDeclineId] = useState<string | null>(null);
  const [successRef, setSuccessRef] = useState<string | null>(null);

  const decide = async (id: string, status: 'APPROVED' | 'DECLINED') => {
    setBusyId(id);
    setError('');
    setSuccessRef(null);
    try {
      const res = await fetch(`/api/reservations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update reservation.');

      setReservations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status, operatorNote: data.reservation?.operatorNote ?? r.operatorNote, decidedAt: data.reservation?.decidedAt ?? r.decidedAt } : r))
      );
      const decided = reservations.find((r) => r.id === id);
      setSuccessRef(decided ? decided.reference.slice(-8).toUpperCase() : null);
      setConfirmDeclineId(null);
      window.setTimeout(() => setSuccessRef(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setBusyId(null);
    }
  };

  const filtered = filter === 'ALL' ? reservations : reservations.filter((r) => r.status === filter);
  const pendingCount = reservations.filter((r) => r.status === 'PENDING').length;

  return (
    <section className="surface-card overflow-hidden">
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-[var(--border)]">
        <div>
          <h2 className="text-lg font-bold text-[var(--ink)]" style={{ fontFamily: 'var(--font-display), Georgia, serif' }}>
            Reservation Requests
          </h2>
          <p className="text-xs text-[var(--ink-secondary)] mt-0.5">
            {pendingCount} awaiting your approval
          </p>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(['ALL', 'PENDING', 'APPROVED', 'DECLINED'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
            >
              {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="mx-5 sm:mx-6 mt-3 rounded-lg border border-[rgba(185,28,28,0.25)] bg-[var(--danger-soft)] px-3 py-2 text-xs font-semibold text-[var(--danger)]">
          {error}
        </p>
      )}

      {successRef && (
        <p className="mx-5 sm:mx-6 mt-3 rounded-lg border border-[rgba(22,101,52,0.25)] bg-[var(--success-soft)] px-3 py-2 text-xs font-semibold text-[var(--success)]">
          Reservation #{successRef} updated — the traveler has been notified in their account.
        </p>
      )}

      {filtered.length === 0 ? (
        <div className="px-6 py-14 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--surface-sunk)] text-[var(--ink-muted)]">
            <Inbox className="h-6 w-6" />
          </div>
          <p className="text-sm font-semibold text-[var(--ink)]">No reservation requests here</p>
          <p className="mt-1 text-xs text-[var(--ink-secondary)]">
            When travelers request to book your safari packages, they will appear in this list.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-[var(--border-soft)]">
          {filtered.map((r) => (
            <li key={r.id} className="px-5 sm:px-6 py-5">
              <div className="flex flex-col lg:flex-row lg:items-start gap-4 lg:gap-6">
                {/* Traveler + tour info */}
                <div className="flex-1 min-w-0 space-y-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[15px] font-bold text-[var(--ink)]">
                      {r.traveler.firstName} {r.traveler.lastName}
                    </span>
                    <StatusBadge status={r.status} />
                    <span className="font-mono text-[11px] text-[var(--ink-muted)]">#{r.reference.slice(-8).toUpperCase()}</span>
                  </div>

                  <p className="text-sm font-semibold text-[var(--brand)]">{r.tour.title}</p>

                  <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-[var(--ink-secondary)]">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5" />
                      Starts {new Date(r.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      <span className="text-[var(--ink-muted)]">({r.tour.durationDays} days)</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      {r.adultsCount} adult{r.adultsCount !== 1 ? 's' : ''}
                      {r.childrenCount > 0 ? `, ${r.childrenCount} child${r.childrenCount !== 1 ? 'ren' : ''}` : ''}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" />
                      {r.traveler.email}
                    </span>
                    {r.traveler.phone && (
                      <span className="inline-flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5" />
                        {r.traveler.phone}
                      </span>
                    )}
                    {r.traveler.country && (
                      <span className="inline-flex items-center gap-1.5">
                        <Globe className="h-3.5 w-3.5" />
                        {r.traveler.country}
                      </span>
                    )}
                  </div>

                  {r.specialRequests && (
                    <p className="rounded-lg bg-[var(--surface-sunk)] px-3 py-2 text-xs text-[var(--ink-body)]">
                      <span className="font-bold text-[var(--ink-secondary)]">Special requests: </span>
                      {r.specialRequests}
                    </p>
                  )}
                </div>

                {/* Price + decision */}
                <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-3 lg:gap-2 shrink-0 lg:w-44">
                  <div className="lg:text-right">
                    <div className="text-[11px] uppercase tracking-wide text-[var(--ink-muted)] font-bold">Est. total</div>
                    <div className="text-lg font-bold text-[var(--ink)]">${Math.round(r.estimatedTotalUsd).toLocaleString()}</div>
                  </div>

                  {r.status === 'PENDING' ? (
                    confirmDeclineId === r.id ? (
                      <div className="flex flex-col items-end gap-1.5">
                        <span className="text-[11px] font-bold text-[var(--danger)]">Decline this request?</span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setConfirmDeclineId(null)}
                            disabled={busyId === r.id}
                            className="btn btn-sm btn-secondary"
                          >
                            Keep
                          </button>
                          <button
                            type="button"
                            onClick={() => decide(r.id, 'DECLINED')}
                            disabled={busyId === r.id}
                            className="btn btn-sm btn-danger"
                          >
                            {busyId === r.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                            Yes, decline
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => decide(r.id, 'APPROVED')}
                          disabled={busyId === r.id}
                          className="btn btn-sm btn-success"
                        >
                          {busyId === r.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeclineId(r.id)}
                          disabled={busyId === r.id}
                          className="btn btn-sm btn-secondary"
                        >
                          Decline
                        </button>
                      </div>
                    )
                  ) : (
                    <span className="text-[11px] text-[var(--ink-muted)]">
                      {r.decidedAt ? `Decided ${new Date(r.decidedAt).toLocaleDateString()}` : ''}
                    </span>
                  )}
                  {r.operatorNote && r.status !== 'PENDING' && (
                    <p className="rounded-lg bg-[var(--surface-sunk)] px-3 py-2 text-xs text-[var(--ink-body)]">
                      <span className="font-bold text-[var(--ink-secondary)]">Your note: </span>
                      {r.operatorNote}
                    </p>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
