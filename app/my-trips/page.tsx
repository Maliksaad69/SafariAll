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
      <div className="min-h-screen flex flex-col bg-[#f8f5f0] text-[#1d1a17]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-[var(--brand)]"/></main>
        <Footer />
      </div>
    );
  }

  const trip = trips.find((t) => t.id === selectedId);

  return (
    <div className="min-h-screen bg-[#f8f5f0] text-[#1d1a17]">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold font-serif">My trips</h1>
          <Link href="/tours" className="btn btn-secondary btn-sm">Browse tours</Link>
        </div>

        {trips.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)]">
              <Calendar className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No trips yet</h2>
            <p className="text-sm text-gray-500 max-w-md mx-auto">Request a reservation for any safari to start tracking them here.</p>
            <Link href="/tours" className="btn btn-primary mt-4">Browse safari tours</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {trips.map((t) => (
                  <Link key={t.id} href={`/my-trips?trip=${t.id}`} onClick={() => setSelectedId(t.id)} className={`block rounded-xl border p-4 transition-colors ${trip?.id === t.id ? 'border-[var(--brand)] bg-[var(--brand-soft)]' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className={`badge ${statusBadge(t.status)}`}>{statusLabel(t.status)}</span>
                      <span className="text-xs text-gray-400">#{t.reference?.slice(-8)?.toUpperCase()}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 truncate mb-1">{t.tour?.title}</h3>
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
                  <div className="rounded-xl bg-white border border-gray-200 p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-2 mb-4">
                      <div>
                        <h2 className="font-semibold text-gray-900">{trip.tour?.title}</h2>
                        <p className="text-sm text-gray-500 mt-0.5">{trip.operator?.companyName}</p>
                      </div>
                      <span className={`badge ${statusBadge(trip.status)}`}>{statusLabel(trip.status)}</span>
                    </div>

                    <div className="grid gap-3 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>Starts {trip.startDate ? new Date(trip.startDate).toLocaleDateString() : '—'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>{trip.adultsCount + trip.childrenCount} travelers ({trip.adultsCount} adults, {trip.childrenCount} children)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-4 w-4 rounded-full bg-[var(--brand-soft)] flex items-center justify-center text-xs text-[var(--brand-ink)] font-bold">$</span>
                        <span>Estimated total: ${Math.round(trip.estimatedTotalUsd || 0).toLocaleString()}</span>
                      </div>
                    </div>

                    {trip.specialRequests && (
                      <div className="mt-4 pt-4 border-t border-dashed border-gray-200">
                        <span className="text-xs font-semibold text-gray-500">Special requests</span>
                        <p className="text-sm text-gray-700 mt-1">{trip.specialRequests}</p>
                      </div>
                    )}

                    {trip.operatorNote && (
                      <div className="mt-4 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
                        <span className="font-semibold text-gray-500">Agency note: </span>
                        {trip.operatorNote}
                      </div>
                    )}

                    {trip.operator?.contact ? (
                      <div className="mt-4 rounded-xl border border-[var(--brand)]/25 bg-[var(--brand-soft)] p-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-[var(--brand-ink)]">Your agency contact</span>
                        <div className="mt-2 space-y-1.5 text-sm text-[var(--ink-body)]">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 text-[var(--brand)]" />
                            <span className="font-semibold">{trip.operator.companyName}</span>
                            {trip.operator.isVerified && <span className="badge badge-brand">Verified</span>}
                          </div>
                          {trip.operator.contact.email && (
                            <a href={`mailto:${trip.operator.contact.email}`} className="flex items-center gap-2 hover:text-[var(--brand-ink)] transition-colors">
                              <Mail className="h-3.5 w-3.5" />
                              {trip.operator.contact.email}
                            </a>
                          )}
                          {trip.operator.contact.phone && (
                            <a href={`tel:${trip.operator.contact.phone}`} className="flex items-center gap-2 hover:text-[var(--brand-ink)] transition-colors">
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
                      <p className="mt-4 rounded-xl border border-dashed border-[var(--border)] p-3 text-xs text-[var(--ink-muted)]">
                        Agency contact details are shared here as soon as your booking is confirmed.
                      </p>
                    )}

                    {trip.traveler && (
                    <div className="mt-4 pt-4 border-t border-dashed border-gray-200">
                      <span className="text-xs font-semibold text-gray-500">Traveler</span>
                      <div className="mt-2 space-y-1.5">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                            {trip.traveler?.firstName?.charAt(0) ?? '?'}
                          </span>
                          <span className="font-medium">{trip.traveler?.firstName} {trip.traveler?.lastName}</span>
                        </div>
                        {trip.traveler?.email && (
                          <a href={`mailto:${trip.traveler.email}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-[var(--brand-ink)] transition-colors">
                            <Mail className="h-3.5 w-3.5" />
                            {trip.traveler.email}
                          </a>
                        )}
                        {trip.traveler?.phone && (
                          <a href={`tel:${trip.traveler.phone}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-[var(--brand-ink)] transition-colors">
                            <Phone className="h-3.5 w-3.5" />
                            {trip.traveler.phone}
                          </a>
                        )}
                        {trip.traveler?.country && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Globe className="h-3.5 w-3.5" />
                            {trip.traveler.country}
                          </div>
                        )}
                      </div>
                    </div>
                    )}
                  </div>

                  {trip.status === 'PENDING' && (
                    <div className="rounded-xl bg-white border border-gray-200 p-4 shadow-sm">
                      <p className="text-sm text-gray-600 mb-3">Awaiting agency decision — approve or decline to move forward.</p>
                      <div className="flex gap-2">
                        <button onClick={() => decide('APPROVED')} disabled={deciding === trip.id} className="btn btn-sm btn-success flex-1">
                          {deciding === trip.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                          Approve
                        </button>
                        <button onClick={() => decide('DECLINED')} disabled={deciding === trip.id} className="btn btn-sm btn-danger flex-1">
                          {deciding === trip.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                          Decline
                        </button>
                      </div>
                      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
                    </div>
                  )}

                  <div className="rounded-xl bg-white border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-gray-900">Message thread</span>
                      <span className="text-xs text-gray-400">{selectedMessages.length} messages</span>
                    </div>
                    {selectedMessages.length === 0 ? (
                      <p className="text-sm text-gray-500">No messages yet.</p>
                    ) : (
                      <div className="max-h-40 overflow-y-auto space-y-2 rounded-lg bg-gray-50 p-3">
                        {selectedMessages.map((m, idx) => (
                          <div key={m.id || idx} className="text-sm">
                            <div className="text-xs text-gray-400 mb-0.5">{m.sender?.firstName} {m.sender?.lastName}</div>
                            <div>{m.body}</div>
                            <div className="text-[10px] text-gray-400 mt-0.5">{new Date(m.createdAt).toLocaleTimeString()}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    <form onSubmit={send} className="flex gap-2 mt-3">
                      <input
                        value={msgBody}
                        onChange={(e) => setMsgBody(e.target.value)}
                        placeholder="Write a message…"
                        className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-[var(--brand)]"
                        disabled={sending}
                      />
                      <button
                        type="submit"
                        disabled={sending || !msgBody.trim()}
                        className="btn btn-sm btn-primary"
                      >
                        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl bg-white border border-gray-200 p-8 text-center text-sm text-gray-500 shadow-sm">
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
