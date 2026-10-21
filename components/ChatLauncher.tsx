'use client';

import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, MessageCircle, X } from 'lucide-react';
import ReservationChat from '@/components/ReservationChat';
import { useLiveRefresh } from '@/lib/use-live';

interface Conversation {
  reservationId: string;
  reference: string;
  status: string;
  tourTitle: string;
  startDate: string;
  counterpart: string;
  unread: number;
  lastAt: string;
  lastMessage: { mine: boolean; text: string } | null;
}

const when = (iso: string) => {
  const d = new Date(iso);
  const today = new Date();
  return d.toDateString() === today.toDateString()
    ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

/** Open the chat drawer from anywhere: window.dispatchEvent(new CustomEvent('chat:open', { detail: { reservationId } })) */
export function openChat(reservationId?: string) {
  window.dispatchEvent(new CustomEvent('chat:open', { detail: { reservationId } }));
}

/**
 * Header chat button: shows how many unread chat messages the user has and opens
 * a drawer with all their reservation conversations and the chat itself.
 * Works the same for travellers and tour operators.
 */
export default function ChatLauncher({ className = '' }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[] | null>(null);
  const [totalUnread, setTotalUnread] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);

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
  // New messages and read receipts update the badge without reloading.
  useLiveRefresh('scope=me', load);

  useEffect(() => {
    const onOpen = (e: Event) => {
      const id = (e as CustomEvent<{ reservationId?: string }>).detail?.reservationId ?? null;
      setActiveId(id);
      setOpen(true);
      load();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('chat:open', onOpen);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('chat:open', onOpen);
      window.removeEventListener('keydown', onKey);
    };
  }, [load]);

  const active = conversations?.find((c) => c.reservationId === activeId) ?? null;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          load();
        }}
        className={`relative flex items-center text-[var(--ink-secondary)] transition-colors hover:text-[var(--ink)] ${className}`}
        aria-label={totalUnread ? `Chats, ${totalUnread} unread` : 'Chats'}
        title="Chats"
      >
        <MessageCircle className="h-5 w-5" strokeWidth={1.6} />
        {totalUnread > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-[var(--danger,#dc2626)] px-1 text-[9px] font-bold text-white shadow">
            {totalUnread > 99 ? '99+' : totalUnread}
          </span>
        )}
      </button>

      {/* Portal to <body>: the header's backdrop blur would otherwise trap the fixed panel inside it. */}
      {open && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[70] flex justify-end bg-black/30 backdrop-blur-[1px]" onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
          <aside className="flex h-full w-full max-w-[440px] flex-col bg-[var(--canvas,#fff)] shadow-2xl" role="dialog" aria-label="Chats">
            <div className="flex items-center gap-2 border-b border-black/5 px-4 py-3">
              {active ? (
                <button
                  type="button"
                  className="rounded-lg p-1 text-[var(--ink-secondary)] hover:bg-[var(--surface-sunk)]"
                  onClick={() => {
                    setActiveId(null);
                    load();
                  }}
                  aria-label="Back to conversations"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
              ) : (
                <MessageCircle className="h-4 w-4 text-[var(--brand)]" />
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold text-[var(--ink)]">{active ? active.counterpart : 'Chats'}</div>
                {active && <div className="truncate text-[11px] text-[var(--ink-muted)]">{active.tourTitle} · #{active.reference}</div>}
              </div>
              <button type="button" className="rounded-lg p-1 text-[var(--ink-secondary)] hover:bg-[var(--surface-sunk)]" onClick={() => setOpen(false)} aria-label="Close chats">
                <X className="h-4 w-4" />
              </button>
            </div>

            {active ? (
              <div className="flex-1 overflow-hidden p-3">
                <ReservationChat key={active.reservationId} reservationId={active.reservationId} counterpartName={active.counterpart} heightClass="h-[calc(100vh-260px)]" />
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                {conversations === null ? (
                  <p className="p-6 text-center text-sm text-[var(--ink-muted)]">Loading…</p>
                ) : conversations.length === 0 ? (
                  <p className="p-6 text-center text-sm text-[var(--ink-muted)]">No chats yet. A chat opens with the tour operator as soon as you make a reservation.</p>
                ) : (
                  conversations.map((c) => (
                    <button
                      key={c.reservationId}
                      type="button"
                      onClick={() => setActiveId(c.reservationId)}
                      className="flex w-full items-start gap-3 border-b border-black/5 px-4 py-3 text-left transition-colors hover:bg-[var(--brand-soft)]"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--brand-soft)] text-sm font-bold text-[var(--brand-deep)]">
                        {c.counterpart.slice(0, 1).toUpperCase()}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className={`truncate text-[13px] ${c.unread ? 'font-bold text-[var(--ink)]' : 'font-semibold text-[var(--ink)]'}`}>{c.counterpart}</span>
                          <span className="ml-auto shrink-0 text-[10px] text-[var(--ink-muted)]">{when(c.lastAt)}</span>
                        </span>
                        <span className="block truncate text-[11px] text-[var(--ink-muted)]">{c.tourTitle}</span>
                        <span className="mt-0.5 flex items-center gap-2">
                          <span className={`truncate text-[12px] ${c.unread ? 'font-semibold text-[var(--ink)]' : 'text-[var(--ink-secondary)]'}`}>
                            {c.lastMessage ? `${c.lastMessage.mine ? 'You: ' : ''}${c.lastMessage.text}` : 'No messages yet. Say hello!'}
                          </span>
                          {c.unread > 0 && (
                            <span className="ml-auto flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full bg-[var(--brand)] px-1 text-[10px] font-bold text-white">{c.unread}</span>
                          )}
                        </span>
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </aside>
        </div>,
        document.body
      )}
    </>
  );
}
