'use client';

import { useCallback, useEffect, useState } from 'react';
import { useLiveRefresh } from '@/lib/use-live';
import ChatWorkspace from '@/components/ChatWorkspace';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import {
  Mail,
  Phone,
  Globe,
  Calendar,
  Users,
  X,
  Loader2,
  MapPin,
  Bus,
  CheckCircle2,
  Star,
  Flag,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Clock,
} from 'lucide-react';

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

function computeTripProgress(startDateStr: string, durationDays: number = 1) {
  const start = new Date(startDateStr);
  const now = new Date();
  const dayMs = 86_400_000;
  const end = new Date(start.getTime() + durationDays * dayMs);

  const isUpcoming = now < start;
  const isStarted = now >= start && now < end;
  const isDaysComplete = now >= end;

  const daysElapsed = Math.floor((now.getTime() - start.getTime()) / dayMs);
  const currentDay = Math.min(durationDays, Math.max(1, daysElapsed + 1));
  const progressPct = Math.min(100, Math.max(0, Math.round((currentDay / durationDays) * 100)));

  return {
    isUpcoming,
    isStarted,
    isDaysComplete,
    currentDay,
    durationDays,
    progressPct,
    endDate: end,
  };
}

export default function MyTripsPage() {
  const router = useRouter();
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Review modal state
  const [reviewModalTrip, setReviewModalTrip] = useState<any | null>(null);
  const [overallRating, setOverallRating] = useState(5);
  const [guideRating, setGuideRating] = useState(5);
  const [vehicleRating, setVehicleRating] = useState(5);
  const [valueRating, setValueRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const loadTrips = useCallback(() => {
    fetch('/api/reservations', { cache: 'no-store' })
      .then((r) => r.json())
      .then(({ reservations }) => {
        setTrips(reservations || []);
        setSelectedId((cur) => cur ?? (reservations?.length > 0 ? reservations[0].id : null));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(loadTrips, [loadTrips]);

  // Reservation status changes appear live
  useLiveRefresh('scope=me', loadTrips);

  // Cancel reservation
  const handleCancel = async () => {
    if (!selectedId) return;
    if (!window.confirm('Cancel this reservation? Your seats will be released to other travellers.')) return;
    setBusyAction('cancel');
    setError('');
    try {
      const res = await fetch(`/api/reservations/${selectedId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update reservation.');
      loadTrips();
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setBusyAction(null);
    }
  };

  // Finish / Complete Tour
  const handleFinishTour = async (tripToFinish: any) => {
    setBusyAction('finish');
    setError('');
    try {
      const res = await fetch(`/api/reservations/${tripToFinish.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to mark tour as completed.');

      setActionSuccess(`Tour marked as completed! We hope you had an extraordinary safari.`);
      setTimeout(() => setActionSuccess(''), 5000);
      loadTrips();

      // Open review modal automatically
      setReviewModalTrip(tripToFinish);
      setReviewTitle(`Unforgettable Safari with ${tripToFinish.operator?.companyName}`);
    } catch (err: any) {
      setError(err.message || 'Failed to finish tour.');
    } finally {
      setBusyAction(null);
    }
  };

  // Submit Review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModalTrip) return;
    setSubmittingReview(true);
    setReviewError('');

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operatorId: reviewModalTrip.operator?.id,
          tourId: reviewModalTrip.tour?.id,
          reservationId: reviewModalTrip.id,
          rating: overallRating,
          guideRating,
          vehicleRating,
          valueRating,
          title: reviewTitle,
          comment: reviewComment,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit review.');

      setReviewModalTrip(null);
      setReviewTitle('');
      setReviewComment('');
      setActionSuccess('Thank you! Your verified review has been published.');
      setTimeout(() => setActionSuccess(''), 5000);
      loadTrips();
    } catch (err: any) {
      setReviewError(err.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--canvas)] text-[var(--ink)]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin h-8 w-8 text-[var(--brand)]" />
        </main>
        <Footer />
      </div>
    );
  }

  const trip = trips.find((t) => t.id === selectedId);
  const tripProgress = trip?.startDate
    ? computeTripProgress(trip.startDate, trip.tour?.durationDays || 1)
    : null;

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
            <p className="text-xs sm:text-sm text-[var(--ink-muted)] mt-1">
              Track tour departure progress, assigned vehicles, live communications, and post-trip reviews.
            </p>
          </div>
          <Link href="/tours" className="btn btn-secondary text-xs px-4 py-2 rounded-xl">
            Browse Tours
          </Link>
        </div>

        {actionSuccess && (
          <div className="mb-6 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-800 text-sm flex items-center gap-2 shadow-sm">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {trips.length === 0 ? (
          <div className="surface-card rounded-3xl p-12 border border-black/5 text-center shadow-sm max-w-lg mx-auto">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand-soft)] text-[var(--brand)]">
              <Calendar className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-bold font-display text-[var(--brand-deep)] mb-2">No trips yet</h2>
            <p className="text-xs sm:text-sm text-[var(--ink-muted)] max-w-md mx-auto mb-6">
              Request a reservation for any safari package to start tracking your itinerary, car allocation, and conversations here.
            </p>
            <Link href="/tours" className="btn btn-primary px-6 py-3 rounded-xl text-xs font-semibold shadow-sm">
              Browse Safari Tours
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column: Trip Cards */}
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {trips.map((t) => {
                  const progress = t.startDate ? computeTripProgress(t.startDate, t.tour?.durationDays || 1) : null;
                  const isSelected = trip?.id === t.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedId(t.id)}
                      className={`cursor-pointer block rounded-2xl border p-5 transition-all shadow-sm ${
                        isSelected
                          ? 'border-[var(--brand)] bg-[var(--brand-soft)]/60'
                          : 'surface-card border-black/5 hover:border-[var(--brand)]/30 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`badge ${STATUS_BADGE[t.status] || 'badge-warning'}`}>
                            {STATUS_LABEL[t.status] || t.status}
                          </span>
                          {t.status === 'APPROVED' && progress?.isStarted && (
                            <span className="badge badge-brand animate-pulse">
                              Tour Started · Day {progress.currentDay}/{progress.durationDays}
                            </span>
                          )}
                          {t.status === 'APPROVED' && progress?.isDaysComplete && (
                            <span className="badge badge-success">
                              Target Days Complete
                            </span>
                          )}
                          {t.status === 'COMPLETED' && (
                            <span className="badge badge-neutral">
                              {t.isReviewed ? '★ Reviewed' : 'Review Pending'}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-mono text-[var(--ink-muted)]">
                          #{t.reference?.slice(-8)?.toUpperCase()}
                        </span>
                      </div>

                      <h3 className="font-bold text-[var(--brand-deep)] font-display truncate mb-1.5">
                        {t.tour?.title}
                      </h3>

                      <div className="text-xs text-gray-500 flex items-center gap-2 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {t.adultsCount + t.childrenCount} travelers
                        </span>
                        {t.startDate && (
                          <>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {new Date(t.startDate).toLocaleDateString()}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Vehicle summary on card */}
                      {t.vehicle ? (
                        <div className="mt-2.5 pt-2.5 border-t border-black/5 flex items-center gap-1.5 text-xs text-[var(--brand-deep)] font-semibold">
                          <Bus className="h-3.5 w-3.5 text-[var(--brand)]" />
                          <span className="truncate">{t.vehicle.name} ({t.vehicle.vehicleType})</span>
                        </div>
                      ) : (
                        <div className="mt-1 text-xs text-gray-400">{t.operator?.companyName}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Trip Detail & Action Panel */}
            <div>
              {trip ? (
                <div className="space-y-4">
                  {/* Tour Status & Progress Card */}
                  {trip.status === 'APPROVED' && tripProgress && (
                    <div className="surface-card rounded-2xl border border-[var(--brand)]/30 bg-gradient-to-br from-white to-[var(--brand-soft)]/20 p-6 shadow-sm space-y-4">
                      {tripProgress.isStarted ? (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--brand)]">
                              <Sparkles className="h-4 w-4" /> Tour Currently In Progress
                            </span>
                            <span className="text-xs font-bold text-[var(--brand-deep)]">
                              Day {tripProgress.currentDay} of {tripProgress.durationDays}
                            </span>
                          </div>
                          {/* Progress bar */}
                          <div className="h-2.5 w-full bg-gray-200 rounded-full overflow-hidden mb-2">
                            <div
                              className="h-full bg-[var(--brand)] transition-all duration-500 rounded-full"
                              style={{ width: `${tripProgress.progressPct}%` }}
                            />
                          </div>
                          <p className="text-xs text-[var(--ink-muted)]">
                            Your safari is actively underway. Have questions or schedule adjustments? Message your operator below.
                          </p>
                        </div>
                      ) : tripProgress.isDaysComplete ? (
                        <div>
                          <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm mb-1">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                            Targeted {tripProgress.durationDays} Days Complete!
                          </div>
                          <p className="text-xs text-[var(--ink-muted)] mb-3">
                            All scheduled itinerary days have concluded. You can now finish the tour and share your review!
                          </p>
                          <button
                            type="button"
                            onClick={() => handleFinishTour(trip)}
                            disabled={busyAction === 'finish'}
                            className="btn btn-primary btn-sm w-full rounded-xl inline-flex items-center justify-center gap-2"
                          >
                            {busyAction === 'finish' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Flag className="h-4 w-4" />}
                            Finish Tour &amp; Leave Review
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs text-[var(--brand-deep)]">
                          <Clock className="h-4 w-4 text-[var(--brand)] shrink-0" />
                          <span>
                            Confirmed! Safari starts on{' '}
                            <strong>{new Date(trip.startDate).toLocaleDateString(undefined, { timeZone: 'UTC' })}</strong>.
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Main Details Card */}
                  <div className="surface-card rounded-2xl border border-black/5 p-6 shadow-sm">
                    <div className="flex items-start justify-between gap-2 mb-4">
                      <div>
                        <h2 className="font-bold font-display text-[var(--brand-deep)] text-lg">
                          {trip.tour?.title}
                        </h2>
                        <p className="text-xs text-[var(--ink-muted)] mt-0.5">{trip.operator?.companyName}</p>
                      </div>
                      <span className={`badge ${STATUS_BADGE[trip.status] || 'badge-warning'}`}>
                        {STATUS_LABEL[trip.status] || trip.status}
                      </span>
                    </div>

                    <div className="grid gap-3 text-xs sm:text-sm text-[var(--ink)]/80">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-[var(--brand)]" />
                        <span>
                          Starts {trip.startDate ? new Date(trip.startDate).toLocaleDateString(undefined, { timeZone: 'UTC' }) : '—'}
                          {trip.departureTime ? ` at ${trip.departureTime}` : ''}
                          {trip.route ? ` · ${trip.route}` : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-[var(--brand)]" />
                        <span>
                          {trip.adultsCount + trip.childrenCount} travelers ({trip.adultsCount} adults, {trip.childrenCount} children)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-4 w-4 rounded-full bg-[var(--brand-soft)] flex items-center justify-center text-xs text-[var(--brand-deep)] font-bold">
                          $
                        </span>
                        <span>
                          Estimated total: <strong>${Math.round(trip.estimatedTotalUsd || 0).toLocaleString()}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Assigned Vehicle Section */}
                    <div className="mt-4 pt-4 border-t border-black/5">
                      <span className="text-xs font-semibold text-[var(--ink-muted)] uppercase tracking-wider">
                        Assigned Safari Vehicle
                      </span>
                      {trip.vehicle ? (
                        <div className="mt-2 rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] p-3 flex items-start gap-3">
                          <div className="h-9 w-9 rounded-lg bg-[var(--brand-soft)] flex items-center justify-center text-[var(--brand)] shrink-0">
                            <Bus className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-bold text-sm text-[var(--ink)]">{trip.vehicle.name}</div>
                            <div className="text-xs text-[var(--ink-secondary)]">
                              {trip.vehicle.vehicleType}
                              {trip.vehicle.plateNumber ? ` · Plate ${trip.vehicle.plateNumber}` : ''}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="mt-1 text-xs text-[var(--ink-muted)] italic">
                          Vehicle will be automatically allocated by the operator upon departure confirmation.
                        </p>
                      )}
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
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--brand-deep)]">
                          Your agency contact
                        </span>
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
                  </div>

                  {/* Trip Actions / Review Options */}
                  {trip.status === 'COMPLETED' && (
                    <div className="surface-card rounded-2xl border border-black/5 p-5 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          Tour Finished
                        </span>
                        {trip.completedAt && (
                          <span className="text-[11px] text-[var(--ink-muted)]">
                            {new Date(trip.completedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      {trip.isReviewed ? (
                        <div className="rounded-xl bg-amber-50/60 border border-amber-200/60 p-3 text-xs text-amber-900 space-y-1">
                          <div className="flex items-center gap-1 font-bold">
                            <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                            You rated this safari: {trip.userReview?.rating}/5
                          </div>
                          {trip.userReview?.title && (
                            <div className="font-semibold">{trip.userReview.title}</div>
                          )}
                          {trip.userReview?.comment && (
                            <p className="text-[11px] text-amber-800/90">{trip.userReview.comment}</p>
                          )}
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs text-[var(--ink-muted)] mb-3">
                            Help fellow travellers by rating your experience, guide, and safari vehicle!
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setReviewModalTrip(trip);
                              setReviewTitle(`Unforgettable Safari with ${trip.operator?.companyName}`);
                            }}
                            className="btn btn-primary btn-sm w-full rounded-xl inline-flex items-center justify-center gap-2 font-bold"
                          >
                            <Star className="h-4 w-4 fill-amber-300 text-amber-300" />
                            Write a Review
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Manual Finish option if trip days completed but still APPROVED */}
                  {trip.status === 'APPROVED' && tripProgress?.isDaysComplete && (
                    <div className="surface-card rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 shadow-sm space-y-2">
                      <p className="text-xs text-emerald-900 font-semibold">
                        Ready to mark your safari complete?
                      </p>
                      <button
                        type="button"
                        onClick={() => handleFinishTour(trip)}
                        disabled={busyAction === 'finish'}
                        className="btn btn-primary btn-sm w-full rounded-xl"
                      >
                        {busyAction === 'finish' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Flag className="h-4 w-4" />}
                        Finish Tour &amp; Review
                      </button>
                    </div>
                  )}

                  {/* Cancellation */}
                  {(trip.status === 'PENDING' || trip.status === 'APPROVED') && (
                    <div className="surface-card rounded-2xl border border-black/5 p-5 shadow-sm">
                      <p className="text-xs sm:text-sm text-[var(--ink-muted)] mb-3">
                        {trip.status === 'PENDING'
                          ? 'Your seats are held while the agency reviews the request. This page updates as soon as they respond.'
                          : 'Confirmed. If your plans change, cancel here so the seats go to other travellers.'}
                      </p>
                      <button
                        onClick={handleCancel}
                        disabled={busyAction === 'cancel'}
                        className="btn btn-sm btn-danger rounded-xl"
                      >
                        {busyAction === 'cancel' ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                        Cancel reservation
                      </button>
                      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
                    </div>
                  )}
                </div>
              ) : (
                <div className="surface-card rounded-2xl border border-black/5 p-8 text-center text-xs sm:text-sm text-[var(--ink-muted)] shadow-sm">
                  Select a trip to see details and messages.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Chat Workspace */}
        {!loading && trip && (
          <section className="mt-8">
            <h2 className="mb-3 text-lg font-bold font-display text-[var(--brand-deep)]">
              Chat with {trip.operator?.companyName ?? 'your operator'}
            </h2>
            <ChatWorkspace key={trip.id} onlyReservationId={trip.id} heightClass="h-[560px]" />
          </section>
        )}
      </main>

      {/* Review Modal Dialog */}
      {reviewModalTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="surface-card w-full max-w-lg rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border border-[var(--border)] max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="badge badge-brand mb-1">Safari Review</span>
                <h3 className="text-xl font-bold font-display text-[var(--ink)]">
                  Review Your Safari Experience
                </h3>
                <p className="text-xs text-[var(--ink-secondary)] mt-0.5">
                  {reviewModalTrip.tour?.title} · {reviewModalTrip.operator?.companyName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReviewModalTrip(null)}
                className="p-1 rounded-lg text-[var(--ink-muted)] hover:bg-[var(--surface-sunk)] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {reviewError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold">
                {reviewError}
              </div>
            )}

            <form onSubmit={handleSubmitReview} className="space-y-4">
              {/* Overall Star Rating */}
              <div>
                <label className="form-label mb-1">Overall Experience *</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setOverallRating(star)}
                      className="p-1 text-2xl transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-7 w-7 ${
                          star <= overallRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-[var(--ink)] ml-2">
                    {overallRating} / 5 Stars
                  </span>
                </div>
              </div>

              {/* Specific Category Ratings */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border)]">
                <div>
                  <label className="text-[11px] font-bold text-[var(--ink-secondary)] block mb-1">
                    Safari Guide
                  </label>
                  <select
                    value={guideRating}
                    onChange={(e) => setGuideRating(Number(e.target.value))}
                    className="form-control text-xs"
                  >
                    <option value="5">5 - Excellent</option>
                    <option value="4">4 - Good</option>
                    <option value="3">3 - Average</option>
                    <option value="2">2 - Fair</option>
                    <option value="1">1 - Poor</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[var(--ink-secondary)] block mb-1">
                    Safari Car &amp; Comfort
                  </label>
                  <select
                    value={vehicleRating}
                    onChange={(e) => setVehicleRating(Number(e.target.value))}
                    className="form-control text-xs"
                  >
                    <option value="5">5 - Pristine &amp; Spacious</option>
                    <option value="4">4 - Comfortable</option>
                    <option value="3">3 - Acceptable</option>
                    <option value="2">2 - Worn / Bumpy</option>
                    <option value="1">1 - Poor Condition</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[var(--ink-secondary)] block mb-1">
                    Value for Money
                  </label>
                  <select
                    value={valueRating}
                    onChange={(e) => setValueRating(Number(e.target.value))}
                    className="form-control text-xs"
                  >
                    <option value="5">5 - Worth every penny</option>
                    <option value="4">4 - Great value</option>
                    <option value="3">3 - Fair price</option>
                    <option value="2">2 - Overpriced</option>
                    <option value="1">1 - Not worth it</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label" htmlFor="r-title">Review Headline *</label>
                <input
                  id="r-title"
                  type="text"
                  required
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  className="form-control"
                  placeholder="e.g. Highlight of our Africa trip — saw the Big Five!"
                />
              </div>

              <div>
                <label className="form-label" htmlFor="r-comment">Your Safari Story &amp; Details *</label>
                <textarea
                  id="r-comment"
                  rows={4}
                  required
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="form-control text-xs"
                  placeholder="Tell other travelers about your guide, the vehicle condition, wildlife sightings, and overall organization..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModalTrip(null)}
                  className="btn btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="btn btn-primary text-xs font-bold inline-flex items-center gap-2"
                >
                  {submittingReview ? <Loader2 className="h-4 w-4 animate-spin" /> : <Star className="h-4 w-4 fill-white" />}
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
