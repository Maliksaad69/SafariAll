'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CalendarDays, Clock, MapPin, MessageCircle, Search, Truck, Users } from 'lucide-react';
import ReservationChat from '@/components/ReservationChat';
import { useLiveRefresh } from '@/lib/use-live';

export interface Conversation {
  reservationId: string;
  reference: string;
  status: string;
  tourTitle: string;
  startDate: string;
  counterpart: string;
  side: 'traveler' | 'agency';
  unread: number;
  lastAt: string;
  lastMessage: { mine: boolean; text: string } | null;
  details: {
    tourSlug: string;
    durationDays: number;
    departureTime: string | null;
    route: string | null;
    vehicle: string | null;
    travellers: number;
    adults: number;
    children: number;
    estimatedTotalUsd: number;
    travellerCountry: string | null;
    operatorSlug: string;
    bookingLink: string;
  };
}

const when = (iso: string) => {
  const d = new Date(iso);
  return d.toDateString() === new Date().toDateString()
    ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
const STATUS: Record<string, string> = { PENDING: 'badge-warning', APPROVED: 'badge-success', COMPLETED: 'badge-neutral', DECLINED: 'badge-danger', CANCELLED: 'badge-neutral' };

/** Loads the signed-in user's conversations and keeps them live. Shared by every chat view. */
export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[] | null>(null);
  const [totalUnread, setTotalUnread] = useState(0);
  const load = useCallback(() => {
    fetch('/api/chat/conversations', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return;
        setConversations(d.conversations ?? []);
        setTotalUnread(d.totalUnread ?? 0);
      })
      .catch(() => {});
  }, []);
  useEffect(load, [load]);
  useLiveRefresh('scope=me', load);
  return { conversations, totalUnread, reload: load };
}

function Details({ c }: { c: Conversation }) {
  return (
    <div className="space-y-2 border-b border-black/5 bg-[var(--brand-soft)]/40 px-4 py-3 text-[12px] text-[var(--ink-secondary)]">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-[13px] font-bold text-[var(--ink)]">{c.counterpart}</div>
          <Link href={`/tours/${c.details.tourSlug}`} className="block truncate font-semibold text-[var(--brand-ink)] hover:underline">{c.tourTitle}</Link>
        </div>
        <span className={`badge ${STATUS[c.status] ?? 'badge-neutral'} shrink-0 text-[10px]`}>{c.status.toLowerCase()}</span>
      </div>
      <div className="grid grid-cols-1 gap-x-3 gap-y-1 @sm:grid-cols-2">
        <span className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5 shrink-0" />{fmtDate(c.startDate)}</span>
        <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 shrink-0" />{c.details.departureTime ?? '—'} · {c.details.durationDays} days</span>
        <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 shrink-0" />{c.details.adults} adult{c.details.adults === 1 ? '' : 's'}{c.details.children ? `, ${c.details.children} child${c.details.children === 1 ? '' : 'ren'}` : ''}</span>
        <span className="truncate">#{c.reference} · ${Math.round(c.details.estimatedTotalUsd).toLocaleString()}</span>
        {c.details.route && <span className="@sm:col-span-2 flex items-center gap-1.5 truncate"><MapPin className="h-3.5 w-3.5 shrink-0" />{c.details.route}</span>}
        {c.details.vehicle && <span className="@sm:col-span-2 flex items-center gap-1.5 truncate"><Truck className="h-3.5 w-3.5 shrink-0" />{c.details.vehicle}</span>}
        {c.details.travellerCountry && <span className="@sm:col-span-2">Traveller from {c.details.travellerCountry}</span>}
      </div>
      <Link href={c.details.bookingLink} className="inline-block font-semibold text-[var(--brand-ink)] hover:underline">View booking →</Link>
    </div>
  );
}

/**
 * The one chat view used everywhere (header chat panel, operator Messages page,
 * My Trips, reservation pages). Left: conversation details and the list of chats.
 * Right: the conversation with the message input. On narrow screens it shows one
 * side at a time with a back button.
 */
export default function ChatWorkspace({
  initialReservationId = null,
  onlyReservationId = null,
  heightClass = 'h-[70vh]',
  onUnreadChange,
}: {
  initialReservationId?: string | null;
  /** Show just this reservation's conversation (still with its details on the left). */
  onlyReservationId?: string | null;
  heightClass?: string;
  onUnreadChange?: (n: number) => void;
}) {
  const { conversations, totalUnread, reload } = useConversations();
  const [activeId, setActiveId] = useState<string | null>(initialReservationId ?? onlyReservationId);
  const [query, setQuery] = useState('');

  useEffect(() => onUnreadChange?.(totalUnread), [totalUnread, onUnreadChange]);

  const list = useMemo(() => {
    const all = (conversations ?? []).filter((c) => !onlyReservationId || c.reservationId === onlyReservationId);
    const q = query.trim().toLowerCase();
    return q ? all.filter((c) => `${c.counterpart} ${c.tourTitle} ${c.reference}`.toLowerCase().includes(q)) : all;
  }, [conversations, onlyReservationId, query]);

  // Select the first conversation on wide screens when none is chosen yet.
  const effectiveId = activeId ?? (onlyReservationId || null);
  const active = (conversations ?? []).find((c) => c.reservationId === effectiveId) ?? null;

  // Container query (@2xl): two panes when this box is wide enough, one pane at a time otherwise.
  return (
    <div className="@container h-full">
    <div className={`grid grid-rows-[minmax(0,1fr)] overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm @2xl:grid-cols-[minmax(260px,340px)_1fr] ${heightClass}`}>
      {/* Left: details + conversations */}
      <div className={`flex min-h-0 flex-col border-r border-black/5 ${active ? 'hidden @2xl:flex' : 'flex'}`}>
        {active && <Details c={active} />}
        {!onlyReservationId && (
          <>
            <div className="flex items-center gap-2 border-b border-black/5 px-3 py-2">
              <Search className="h-4 w-4 text-[var(--ink-muted)]" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search chats" className="w-full bg-transparent text-[13px] outline-none" aria-label="Search chats" />
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              {conversations === null ? (
                <p className="p-6 text-center text-sm text-[var(--ink-muted)]">Loading…</p>
              ) : list.length === 0 ? (
                <p className="p-6 text-center text-sm text-[var(--ink-muted)]">
                  {query ? 'No chats match your search.' : 'No chats yet. A chat opens between traveller and tour operator as soon as a reservation is made.'}
                </p>
              ) : (
                list.map((c) => (
                  <button
                    key={c.reservationId}
                    type="button"
                    onClick={() => setActiveId(c.reservationId)}
                    className={`flex w-full items-start gap-3 border-b border-black/5 px-3 py-3 text-left transition-colors hover:bg-[var(--brand-soft)] ${c.reservationId === effectiveId ? 'bg-[var(--brand-soft)]' : ''}`}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--brand-soft)] text-sm font-bold text-[var(--brand-deep)]">{c.counterpart.slice(0, 1).toUpperCase()}</span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className={`truncate text-[13px] ${c.unread ? 'font-bold' : 'font-semibold'} text-[var(--ink)]`}>{c.counterpart}</span>
                        <span className="ml-auto shrink-0 text-[10px] text-[var(--ink-muted)]">{when(c.lastAt)}</span>
                      </span>
                      <span className="block truncate text-[11px] text-[var(--ink-muted)]">{c.tourTitle}</span>
                      <span className="mt-0.5 flex items-center gap-2">
                        <span className={`truncate text-[12px] ${c.unread ? 'font-semibold text-[var(--ink)]' : 'text-[var(--ink-secondary)]'}`}>
                          {c.lastMessage ? `${c.lastMessage.mine ? 'You: ' : ''}${c.lastMessage.text}` : 'No messages yet. Say hello!'}
                        </span>
                        {c.unread > 0 && <span className="ml-auto flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full bg-[var(--brand)] px-1 text-[10px] font-bold text-white">{c.unread}</span>}
                      </span>
                    </span>
                  </button>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* Right: the conversation and the message input */}
      <div className={`min-h-0 flex-col ${active ? 'flex' : 'hidden @2xl:flex'}`}>
        {active ? (
          <>
            {!onlyReservationId && (
              <button type="button" onClick={() => { setActiveId(null); reload(); }} className="flex items-center gap-1.5 border-b border-black/5 px-3 py-2 text-xs font-semibold text-[var(--brand-ink)] @2xl:hidden">
                <ArrowLeft className="h-3.5 w-3.5" /> All chats
              </button>
            )}
            <div className="@2xl:hidden"><Details c={active} /></div>
            <div className="min-h-0 flex-1 p-2">
              <ReservationChat key={active.reservationId} reservationId={active.reservationId} counterpartName={active.counterpart} fill />
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center text-sm text-[var(--ink-muted)]">
            <MessageCircle className="h-8 w-8" />
            {conversations && conversations.length > 0 ? 'Choose a chat on the left to start messaging.' : 'Your chats will appear here.'}
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
