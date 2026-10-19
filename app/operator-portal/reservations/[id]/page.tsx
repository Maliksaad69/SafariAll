'use client';

import { useLiveRefresh } from '@/lib/use-live';
import ReservationChat from '@/components/ReservationChat';
import { useCallback, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, Globe, Check, X, Loader2, Calendar, Users } from 'lucide-react';

interface Reservation { id: string; reference: string; startDate: string; adultsCount: number; childrenCount: number; specialRequests: string | null; estimatedTotalUsd: number; status: string; operatorNote: string | null; decidedAt: string | null; createdAt: string; traveler: { firstName: string; lastName: string; email: string; phone: string | null; country: string | null; }; tour: { title: string; slug: string; durationDays: number; }; operatorName: string; slot?: { departureTime: string; route: string | null; bookedSeats: number; maxTravelers: number; spotsLeft: number } | null; vehicle?: { name: string; vehicleType: string; plateNumber?: string | null } | null; }

export default function ReservationDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loadingReservation, setLoadingReservation] = useState(true);
  const [deciding, setDeciding] = useState(false);
  const [error, setError] = useState('');

  const loadReservation = useCallback(async (rid: string) => {
    try {
      const res = await fetch(`/api/reservations/${rid}`, { cache: 'no-store' });
      if (res.ok) {
        const j = await res.json();
        if (j.reservation) {
          setReservation({
            ...j.reservation,
            operatorName: j.reservation.operator?.companyName ?? '',
          });
        }
      }
    } catch {}
    setLoadingReservation(false);
  }, []);

  useEffect(() => {
    if (id) void loadReservation(String(id));
  }, [id, loadReservation]);

  // Traveller cancellations appear without reloading (the chat below has its own socket).
  useLiveRefresh(id ? 'scope=me' : null, () => {
    if (id) void loadReservation(String(id));
  });

  const decide = async (status: 'APPROVED' | 'DECLINED') => {
    if (!id) return;
    setDeciding(true);
    setError('');
    try {
      const res = await fetch(`/api/reservations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update reservation.');
      loadReservation(String(id));
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally { setDeciding(false); }
  };

  if (loadingReservation || !reservation) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--surface-page)] text-[var(--ink-body)]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin h-8 w-8 text-[var(--brand)]" />
        </main>
        <Footer />
      </div>
    );
  }

  const isAgency = reservation.status !== 'PENDING' || reservation.operatorNote || false;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--surface-page)] text-[var(--ink-body)]">
      <Navbar />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex items-center gap-3 mt-2">
          <Link href="/operator-portal" className="inline-flex items-center gap-2 text-xs font-bold text-[var(--ink-secondary)] hover:underline">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to reservations
          </Link>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)]">Booking #{(reservation.reference || '').slice(-8).toUpperCase()}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="surface-card p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-xl font-bold text-[var(--ink)] font-display">{reservation.tour.title}</h1>
                  <p className="text-sm text-[var(--ink-secondary)] mt-1">{reservation.operatorName}</p>
                </div>
                {reservation.status === 'PENDING' && (
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => decide('APPROVED')} disabled={deciding} className="btn btn-success flex-1">
                      {deciding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Approve
                    </button>
                    <button onClick={() => decide('DECLINED')} disabled={deciding} className="btn btn-danger flex-1">
                      {deciding ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />} Decline
                    </button>
                  </div>
                )}
                {error && <p className="text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2 w-full">{error}</p>}
              </div>

              {reservation.tour.durationDays > 0 && (
                <div className="flex gap-4 text-xs text-[var(--ink-secondary)] border-b border-dashed border-[var(--border)] pb-4 mb-4">
                  <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5"/>Starts {new Date(reservation.startDate).toLocaleDateString(undefined, { timeZone: 'UTC' })}{reservation.slot ? ` at ${reservation.slot.departureTime}` : ''}</span>
                  {reservation.slot && (
                    <span className="inline-flex items-center gap-1.5">
                      {reservation.slot.route ? `${reservation.slot.route} · ` : ''}{reservation.vehicle ? `${reservation.vehicle.name}${reservation.vehicle.plateNumber ? ` (${reservation.vehicle.plateNumber})` : ''} · ` : ''}
                      departure {reservation.slot.bookedSeats}/{reservation.slot.maxTravelers} seats booked
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5"/>{reservation.adultsCount + reservation.childrenCount} pax ({reservation.adultsCount} + {reservation.childrenCount})</span>
                  <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--brand)]">{reservation.status}</span>
                </div>
              )}

              <div className="space-y-3 text-sm">
                <div className="flex gap-2"><span className="font-semibold text-[var(--ink)] min-w-[120px]">Traveler</span><span className="text-[var(--ink-secondary)]">{reservation.traveler.firstName} {reservation.traveler.lastName}</span></div>
                {reservation.traveler.email && (
                  <a href={`mailto:${reservation.traveler.email}`} className="flex gap-2 hover:text-[var(--brand)]"><Mail className="h-3.5 w-3.5 shrink-0"/><span className="text-[var(--ink-secondary)]">{reservation.traveler.email}</span></a>
                )}
                {reservation.traveler.phone && (
                  <div className="flex gap-2"><Phone className="h-3.5 w-3.5 shrink-0"/><span className="text-[var(--ink-secondary)]">{reservation.traveler.phone}</span></div>
                )}
                {reservation.traveler.country && (
                  <div className="flex gap-2"><Globe className="h-3.5 w-3.5 shrink-0"/><span className="text-[var(--ink-secondary)]">{reservation.traveler.country}</span></div>
                )}
                {reservation.specialRequests && (
                  <div className="mt-2 rounded-lg bg-[var(--surface-sunk)] px-3 py-2 text-xs text-[var(--ink-body)]">
                    <span className="font-semibold text-[var(--ink-secondary)]">Special requests: </span>{reservation.specialRequests}
                  </div>
                )}
                {reservation.status !== 'PENDING' && reservation.operatorNote && (
                  <div className="mt-2 rounded-lg bg-[var(--surface-sunk)] px-3 py-2 text-xs text-[var(--ink-body)]">
                    <span className="font-semibold text-[var(--ink-secondary)]">Your note: </span>{reservation.operatorNote}
                  </div>
                )}
                {reservation.decidedAt && (
                  <div className="text-xs text-[var(--ink-muted)] pt-1 border-t border-dashed border-[var(--border)]">Decided {new Date(reservation.decidedAt).toLocaleDateString()}</div>
                )}
              </div>
            </div>

            {/* Real-time chat with the traveller */}
            <div className="mt-6">
              <ReservationChat reservationId={reservation.id} counterpartName={`${reservation.traveler.firstName} ${reservation.traveler.lastName}`} heightClass="h-96" />
            </div>
          </div>

          {/* Sidebar contact card */}
          <div className="space-y-4">
            <div className="surface-card p-5 border-t-4 border-[var(--brand)]">
              <div className="flex items-center gap-2 text-[var(--brand)] mb-3"><span className="w-2 h-2 rounded-full bg-[var(--brand)]" /><span className="font-bold text-xs uppercase tracking-wider">Traveler</span></div>
              <h3 className="font-bold text-[var(--ink)]">{reservation.traveler.firstName} {reservation.traveler.lastName}</h3>
              <div className="mt-2 space-y-1 text-sm text-[var(--ink-secondary)]">
                {reservation.traveler.email && <div className="inline-flex items-center gap-2"><Mail className="h-3 w-3"/>{reservation.traveler.email}</div>}
                {reservation.traveler.phone && <div className="inline-flex items-center gap-2"><Phone className="h-3 w-3"/>{reservation.traveler.phone}</div>}
                {reservation.traveler.country && <div className="inline-flex items-center gap-2"><Globe className="h-3 w-3"/>{reservation.traveler.country}</div>}
              </div>
              <div className="mt-3 text-xs text-[var(--ink-muted)] border-t border-dashed border-[var(--border)] pt-3">
                Contacts are shared with this agency once the reservation is decided.
              </div>
            </div>

            <div className="rounded-xl bg-[var(--brand-soft)] border border-[var(--brand)] p-4 text-sm text-[var(--brand-ink)]">
              <span className="font-bold block mb-1">Next steps</span>
              {reservation.status === 'PENDING' ? (
                <span className="leading-relaxed">Approve or decline to notify the traveler. You can message them after the decision.</span>
              ) : (
                <span>Traveler is now able to message you about this booking.</span>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
