'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Mail, Phone, Globe, Calendar, Users, Check, X, ArrowRight, Loader2, Send, MapPin } from 'lucide-react';

const STATUS_BADGE: Record<string, string> = {
  APPROVED: 'badge-success',
  PENDING: 'badge-warning',
  DECLINED: 'badge-danger',
  CANCELLED: 'badge-neutral',
  COMPLETED: 'badge-info',
};

const STATUS_LABEL: Record<string, string> = {
  APPROVED: 'Confirmed',
  PENDING: 'Awaiting decision',
  DECLINED: 'Declined',
  CANCELLED: 'Cancelled',
  COMPLETED: 'Trip completed',
};

const statusBadge = (s: string) => STATUS_BADGE[s] || 'badge-warning';
const statusLabel = (s: string) => STATUS_LABEL[s] || s;

export default function MyTripsPage() {
  const router = useRouter();
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedMessages, setSelectedMessages] = useState<any[]>([]);
  const [msgBody, setMsgBody] = useState('');
  const [sending, setSending] = useState(false);
  const [deciding, setDeciding] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/reservations')
      .then((r) => r.json())
      .then(({ reservations }) => {
        setTrips(reservations || []);
        if (reservations?.length > 0) setSelectedId(reservations[0].id);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const loadMessages = (rid: string) => {
    fetch(`/api/reservations/${rid}/messages`)
      .then((r) => r.json())
      .then(({ messages }) => setSelectedMessages(messages || []))
      .catch(() => {});
  };

  useEffect(() => {
    if (!selectedId) return;
    loadMessages(selectedId);
  }, [selectedId]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgBody.trim() || !selectedId) return;
    setSending(true);
    setMsgBody('');
    try {
      const res = await fetch(`/api/reservations/${selectedId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: msgBody }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send message.');
      loadMessages(selectedId);
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Could not send message.');
    } finally {
      setSending(false);
    }
  };

  const decide = async (status: 'APPROVED' | 'DECLINED') => {
    if (!selectedId) return;
    setDeciding(selectedId);
    setError('');
    try {
      const res = await fetch(`/api/reservations/${selectedId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update reservation.');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally { setDeciding(null); }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--canvas)] text-[var(--ink)]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-[var(--brand)]"/></main>
        <Footer />
      </div>
    );
  }

  const trip = trips.find((t) => t.id === selectedId);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--canvas)] text-[var(--ink)]">
      <Navbar />

      {/* Top Breadcrumb Bar */}
      <div className="border-b border-black/5 py-2.5 text-xs text-[var(--ink-muted)] bg-[var(--canvas)]/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1.5">
          <Link href="/" className="hover:text-[var(--brand)] transition-colors">Home</Link>
          <span className="text-[var(--ink-muted)] opacity-60">/</span>
          <span className="text-[var(--ink)] font-medium">My Trips</span>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold font-display text-[var(--brand-deep)]">My Safari Trips</h1>
            <p className="text-xs sm:text-sm text-[var(--ink-muted)] mt-1">Track reservation requests, communications, and operator responses.</p>
          </div>
          <Link href="/tours" className="btn btn-secondary text-xs px-4 py-2 rounded-xl">Browse Tours</Link>
        </div>

        {trips.length === 0 ? (
          <div className="surface-card rounded-3xl p-12 border border-black/5 text-center shadow-sm max-w-lg mx-auto">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand-soft)] text-[var(--brand)]">
              <Calendar className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-bold font-display text-[var(--brand-deep)] mb-2">No trips yet</h2>
            <p className="text-xs sm:text-sm text-[var(--ink-muted)] max-w-md mx-auto mb-6">
              Request a reservation for any safari package to start tracking your itinerary and conversations here.
            </p>
            <Link href="/tours" className="btn btn-primary px-6 py-3 rounded-xl text-xs font-semibold shadow-sm">
              Browse Safari Tours
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {trips.map((t) => (
                  <Link 
                    key={t.id} 
                    href={`/my-trips?trip=${t.id}`} 
                    onClick={() => setSelectedId(t.id)} 
                    className={`block rounded-2xl border p-5 transition-all shadow-sm ${
                      trip?.id === t.id 
                        ? 'border-[var(--brand)] bg-[var(--brand-soft)]/60' 
                        : 'surface-card border-black/5 hover:border-[var(--brand)]/30 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <span className={`badge ${statusBadge(t.status)}`}>{statusLabel(t.status)}</span>
                      <span className="text-[11px] font-mono text-[var(--ink-muted)]">#{t.reference?.slice(-8)?.toUpperCase()}</span>
                    </div>
                    <h3 className="font-bold text-[var(--brand-deep)] font-display truncate mb-1.5">{t.tour?.title}</h3>
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                      <Users className="h-3.5 w-3.5" />
                      {t.adultsCount + t.childrenCount} travelers
                      {t.startDate && (
                        <>
                          <span className="mx-1">·</span>
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(t.startDate).toLocaleDateString()}
                        </>
                      )}
                    </div>
                    {t.operator?.companyName && (
                      <div className="mt-1 text-xs text-gray-400">{t.operator?.companyName}</div>
                    )}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              {trip ? (
                <div className="space-y-4">
                  <div className="surface-card rounded-2xl border border-black/5 p-6 shadow-sm">
                    <div className="flex items-start justify-between gap-2 mb-4">
                      <div>
                        <h2 className="font-bold font-display text-[var(--brand-deep)] text-lg">{trip.tour?.title}</h2>
                        <p className="text-xs text-[var(--ink-muted)] mt-0.5">{trip.operator?.companyName}</p>
                      </div>
                      <span className={`badge ${statusBadge(trip.status)}`}>{statusLabel(trip.status)}</span>
                    </div>

                    <div className="grid gap-3 text-xs sm:text-sm text-[var(--ink)]/80">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-[var(--brand)]" />
                        <span>Starts {trip.startDate ? new Date(trip.startDate).toLocaleDateString() : '—'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-[var(--brand)]" />
                        <span>{trip.adultsCount + trip.childrenCount} travelers ({trip.adultsCount} adults, {trip.childrenCount} children)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-4 w-4 rounded-full bg-[var(--brand-soft)] flex items-center justify-center text-xs text-[var(--brand-deep)] font-bold">$</span>
                        <span>Estimated total: <strong>${Math.round(trip.estimatedTotalUsd || 0).toLocaleString()}</strong></span>
                      </div>
                    </div>

                    {trip.specialRequests && (
                      <div className="mt-4 pt-4 border-t border-black/5">
                        <span className="text-xs font-semibold text-[var(--ink-muted)]">Special requests</span>
                        <p className="text-xs sm:text-sm text-[var(--ink)] mt-1">{trip.specialRequests}</p>
                      </div>
                    )}

                    {trip.operatorNote && (
                      <div className="mt-4 rounded-xl bg-[var(--sand)] p-3 text-xs sm:text-sm text-[var(--ink)]">
                        <span className="font-semibold text-[var(--ink-muted)]">Agency note: </span>
                        {trip.operatorNote}
                      </div>
                    )}

                    {trip.operator?.contact ? (
                      <div className="mt-4 rounded-2xl border border-[var(--brand-pale)] bg-[var(--brand-soft)]/50 p-4">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--brand-deep)]">Your agency contact</span>
                        <div className="mt-2 space-y-1.5 text-xs text-[var(--ink)]">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 text-[var(--brand)]" />
                            <span className="font-semibold">{trip.operator.companyName}</span>
                            {trip.operator.isVerified && <span className="badge badge-brand">Verified</span>}
                          </div>
                          {trip.operator.contact.email && (
                            <a href={`mailto:${trip.operator.contact.email}`} className="flex items-center gap-2 hover:text-[var(--brand)] transition-colors">
                              <Mail className="h-3.5 w-3.5" />
                              {trip.operator.contact.email}
                            </a>
                          )}
                          {trip.operator.contact.phone && (
                            <a href={`tel:${trip.operator.contact.phone}`} className="flex items-center gap-2 hover:text-[var(--brand)] transition-colors">
                              <Phone className="h-3.5 w-3.5" />
                              {trip.operator.contact.phone}
                            </a>
                          )}
                          {trip.operator.contact.address && (
                            <div className="flex items-center gap-2">
                              <Globe className="h-3.5 w-3.5" />
                              {trip.operator.contact.address}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="mt-4 rounded-xl border border-dashed border-black/10 p-3 text-xs text-[var(--ink-muted)]">
                        Agency contact details are shared here as soon as your booking is confirmed.
                      </p>
                    )}

                    {trip.traveler && (
                    <div className="mt-4 pt-4 border-t border-black/5">
                      <span className="text-xs font-semibold text-[var(--ink-muted)]">Traveler</span>
                      <div className="mt-2 space-y-1.5">
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-[var(--ink)]">
                          <span className="w-6 h-6 rounded-full bg-[var(--sand)] flex items-center justify-center text-xs font-bold text-[var(--brand-deep)]">
                            {trip.traveler?.firstName?.charAt(0) ?? '?'}
                          </span>
                          <span className="font-medium">{trip.traveler?.firstName} {trip.traveler?.lastName}</span>
                        </div>
                        {trip.traveler?.email && (
                          <a href={`mailto:${trip.traveler.email}`} className="flex items-center gap-2 text-xs text-[var(--ink-muted)] hover:text-[var(--brand)] transition-colors">
                            <Mail className="h-3.5 w-3.5" />
                            {trip.traveler.email}
                          </a>
                        )}
                        {trip.traveler?.phone && (
                          <a href={`tel:${trip.traveler.phone}`} className="flex items-center gap-2 text-xs text-[var(--ink-muted)] hover:text-[var(--brand)] transition-colors">
                            <Phone className="h-3.5 w-3.5" />
                            {trip.traveler.phone}
                          </a>
                        )}
                        {trip.traveler?.country && (
                          <div className="flex items-center gap-2 text-xs text-[var(--ink-muted)]">
                            <Globe className="h-3.5 w-3.5" />
                            {trip.traveler.country}
                          </div>
                        )}
                      </div>
                    </div>
                    )}
                  </div>

                  {trip.status === 'PENDING' && (
                    <div className="surface-card rounded-2xl border border-black/5 p-5 shadow-sm">
                      <p className="text-xs sm:text-sm text-[var(--ink-muted)] mb-3">Awaiting agency decision — approve or decline to move forward.</p>
                      <div className="flex gap-2">
                        <button onClick={() => decide('APPROVED')} disabled={deciding === trip.id} className="btn btn-sm btn-success flex-1 rounded-xl">
                          {deciding === trip.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                          Approve
                        </button>
                        <button onClick={() => decide('DECLINED')} disabled={deciding === trip.id} className="btn btn-sm btn-danger flex-1 rounded-xl">
                          {deciding === trip.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                          Decline
                        </button>
                      </div>
                      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
                    </div>
                  )}

                  <div className="surface-card rounded-2xl border border-black/5 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs sm:text-sm font-bold font-display text-[var(--brand-deep)]">Message thread</span>
                      <span className="text-xs text-[var(--ink-muted)]">{selectedMessages.length} messages</span>
                    </div>
                    {selectedMessages.length === 0 ? (
                      <p className="text-xs text-[var(--ink-muted)]">No messages yet.</p>
                    ) : (
                      <div className="max-h-40 overflow-y-auto space-y-2 rounded-xl bg-[var(--sand)]/50 p-3">
                        {selectedMessages.map((m, idx) => (
                          <div key={m.id || idx} className="text-xs">
                            <div className="text-[11px] font-semibold text-[var(--brand-deep)] mb-0.5">{m.sender?.firstName} {m.sender?.lastName}</div>
                            <div className="text-[var(--ink)]">{m.body}</div>
                            <div className="text-[10px] text-[var(--ink-muted)] mt-0.5">{new Date(m.createdAt).toLocaleTimeString()}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    <form onSubmit={send} className="flex gap-2 mt-3">
                      <input
                        value={msgBody}
                        onChange={(e) => setMsgBody(e.target.value)}
                        placeholder="Write a message…"
                        className="form-control text-xs flex-1"
                        disabled={sending}
                      />
                      <button
                        type="submit"
                        disabled={sending || !msgBody.trim()}
                        className="btn btn-sm btn-primary rounded-xl px-3"
                      >
                        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="surface-card rounded-2xl border border-black/5 p-8 text-center text-xs sm:text-sm text-[var(--ink-muted)] shadow-sm">
                  Select a trip to see details and messages.
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
