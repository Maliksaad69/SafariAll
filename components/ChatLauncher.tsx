'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { MessageCircle, X } from 'lucide-react';
import ChatWorkspace, { useConversations } from '@/components/ChatWorkspace';

/** Open the chat panel from anywhere, optionally on a specific reservation's chat. */
export function openChat(reservationId?: string) {
  window.dispatchEvent(new CustomEvent('chat:open', { detail: { reservationId } }));
}

/**
 * Header chat button: shows how many unread chat messages the user has and opens
 * the chat panel (the same two-pane chat view as the Messages page) for
 * travellers and tour operators alike.
 */
export default function ChatLauncher({ className = '' }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [startId, setStartId] = useState<string | null>(null);
  const { totalUnread, reload } = useConversations();

  useEffect(() => {
    const onOpen = (e: Event) => {
      setStartId((e as CustomEvent<{ reservationId?: string }>).detail?.reservationId ?? null);
      setOpen(true);
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
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setStartId(null);
          setOpen(true);
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
      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[70] flex justify-end bg-black/30 backdrop-blur-[1px]"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setOpen(false);
                reload();
              }
            }}
          >
            <aside className="flex h-full w-full max-w-[980px] flex-col bg-[var(--canvas,#fff)] shadow-2xl" role="dialog" aria-label="Chats">
              <div className="flex items-center gap-2 border-b border-black/5 px-4 py-3">
                <MessageCircle className="h-4 w-4 text-[var(--brand)]" />
                <div className="flex-1 text-sm font-bold text-[var(--ink)]">Chats</div>
                <button
                  type="button"
                  className="rounded-lg p-1 text-[var(--ink-secondary)] hover:bg-[var(--surface-sunk)]"
                  onClick={() => {
                    setOpen(false);
                    reload();
                  }}
                  aria-label="Close chats"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="min-h-0 flex-1 p-3">
                <ChatWorkspace key={startId ?? 'all'} initialReservationId={startId} heightClass="h-full" />
              </div>
            </aside>
          </div>,
          document.body
        )}
    </>
  );
}
