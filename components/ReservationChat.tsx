'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { Check, CheckCheck, Loader2, Send, Wifi, WifiOff } from 'lucide-react';
import { useLiveRefresh } from '@/lib/use-live';

interface ChatMessage {
  id: string;
  reservationId: string;
  senderId: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  sender: { firstName: string; lastName: string; role: string };
  pending?: boolean;
  failed?: boolean;
}

// One socket per browser tab, shared by every chat panel on the page.
let shared: Socket | null = null;
function getSocket() {
  if (!shared) shared = io({ path: '/socket.io', withCredentials: true, transports: ['websocket', 'polling'] });
  return shared;
}

const timeOf = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const dayOf = (iso: string) => new Date(iso).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

/**
 * Real-time chat between a reservation's traveller and its tour operator.
 * Uses socket.io when the custom server is running and falls back to HTTP plus
 * the /api/live stream otherwise, so messages are never lost.
 */
export default function ReservationChat({
  reservationId,
  counterpartName,
  heightClass = 'h-80',
}: {
  reservationId: string;
  counterpartName?: string;
  heightClass?: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[] | null>(null);
  const [me, setMe] = useState<string>('');
  const [connected, setConnected] = useState(false);
  const [online, setOnline] = useState<string[]>([]);
  const [typing, setTyping] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<number | null>(null);
  const sentTyping = useRef(false);

  const merge = useCallback((incoming: ChatMessage[]) => {
    setMessages((prev) => {
      const byId = new Map((prev ?? []).filter((m) => !m.pending).map((m) => [m.id, m]));
      for (const m of incoming) byId.set(m.id, m);
      const pending = (prev ?? []).filter((m) => m.pending || m.failed);
      return [...Array.from(byId.values()).sort((a, b) => a.createdAt.localeCompare(b.createdAt)), ...pending];
    });
  }, []);

  // HTTP history (also used as the fallback when the socket is down)
  const loadHistory = useCallback(() => {
    fetch(`/api/reservations/${reservationId}/messages`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.messages && merge(d.messages))
      .catch(() => {});
  }, [reservationId, merge]);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => setMe(d?.user?.userId ?? ''))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const socket = getSocket();
    const join = () =>
      socket.emit('chat:join', { reservationId }, (res: { ok: boolean; messages?: ChatMessage[]; online?: string[]; me?: string; error?: string }) => {
        if (!res?.ok) {
          setError(res?.error ?? 'Could not open the chat.');
          loadHistory();
          return;
        }
        if (res.me) setMe(res.me);
        setOnline(res.online ?? []);
        merge(res.messages ?? []);
      });

    const onConnect = () => {
      setConnected(true);
      join();
    };
    const onDisconnect = () => setConnected(false);
    const onMessage = (m: ChatMessage) => {
      if (m.reservationId !== reservationId) return;
      merge([m]);
      if (document.visibilityState === 'visible') socket.emit('chat:read', { reservationId });
    };
    const onTyping = (t: { reservationId: string; name: string; typing: boolean }) => {
      if (t.reservationId === reservationId) setTyping(t.typing ? t.name : null);
    };
    const onRead = (r: { reservationId: string; readerId: string }) => {
      if (r.reservationId !== reservationId) return;
      setMessages((prev) => prev?.map((m) => (m.senderId !== r.readerId ? { ...m, isRead: true } : m)) ?? prev);
    };
    const onPresence = (p: { reservationId: string; online: string[] }) => {
      if (p.reservationId === reservationId) setOnline(p.online);
    };
    const onStatus = (s: { reservationId: string }) => {
      if (s.reservationId === reservationId) loadHistory();
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onDisconnect);
    socket.on('chat:message', onMessage);
    socket.on('chat:typing', onTyping);
    socket.on('chat:read', onRead);
    socket.on('chat:presence', onPresence);
    socket.on('chat:status', onStatus);
    if (socket.connected) onConnect();
    else loadHistory();

    return () => {
      socket.emit('chat:leave', { reservationId });
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onDisconnect);
      socket.off('chat:message', onMessage);
      socket.off('chat:typing', onTyping);
      socket.off('chat:read', onRead);
      socket.off('chat:presence', onPresence);
      socket.off('chat:status', onStatus);
    };
  }, [reservationId, merge, loadHistory]);

  // Fallback when socket.io is unavailable: refresh on the /api/live stream.
  useLiveRefresh(connected ? null : 'scope=me', loadHistory);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages?.length, typing]);

  const emitTyping = (value: boolean) => {
    const socket = getSocket();
    if (!socket.connected || sentTyping.current === value) return;
    sentTyping.current = value;
    socket.emit('chat:typing', { reservationId, typing: value });
  };

  const onDraft = (v: string) => {
    setDraft(v);
    emitTyping(v.length > 0);
    if (typingTimer.current) window.clearTimeout(typingTimer.current);
    typingTimer.current = window.setTimeout(() => emitTyping(false), 2500);
  };

  const tempSeq = useRef(0);
  const send = async (text: string, retryId?: string) => {
    const tempId = retryId ?? `tmp-${++tempSeq.current}`;
    const body = text.trim();
    if (!body) return;
    setError('');
    emitTyping(false);
    setMessages((prev) => [
      ...(prev ?? []).filter((m) => m.id !== tempId),
      { id: tempId, reservationId, senderId: me, body, isRead: false, createdAt: new Date().toISOString(), sender: { firstName: 'You', lastName: '', role: '' }, pending: true },
    ]);
    const done = (m: ChatMessage | null, err?: string) => {
      if (!m) setError(err ?? 'Message not sent.');
      setMessages((prev) => {
        const rest = (prev ?? []).filter((x) => x.id !== tempId && (!m || x.id !== m.id));
        if (m) return [...rest, m].sort((a, b) => Number(!!a.pending) - Number(!!b.pending) || a.createdAt.localeCompare(b.createdAt));
        return [...rest, { id: tempId, reservationId, senderId: me, body, isRead: false, createdAt: new Date().toISOString(), sender: { firstName: 'You', lastName: '', role: '' }, failed: true }];
      });
    };

    const socket = getSocket();
    if (socket.connected) {
      socket.timeout(8000).emit('chat:send', { reservationId, body }, (err: Error | null, res: { ok: boolean; message?: ChatMessage; error?: string }) => {
        if (!err && res?.ok && res.message) return done(res.message);
        if (!err && res && !res.ok) return done(null, res.error);
        void postHttp();
      });
    } else {
      await postHttp();
    }

    async function postHttp() {
      try {
        const r = await fetch(`/api/reservations/${reservationId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ body }),
        });
        const d = await r.json();
        if (r.ok && d.message) done(d.message);
        else done(null, d.error);
      } catch {
        done(null, 'Could not reach the server.');
      }
    }
  };

  const otherOnline = online.some((id) => id !== me);
  let lastDay = '';

  return (
    <div className="flex flex-col rounded-2xl border border-black/5 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-black/5 px-4 py-3">
        <div className="min-w-0">
          <div className="text-sm font-bold text-[var(--brand-deep)]">Chat{counterpartName ? ` with ${counterpartName}` : ''}</div>
          <div className="flex items-center gap-1.5 text-[11px] text-[var(--ink-muted)]">
            <span className={`inline-block h-2 w-2 rounded-full ${otherOnline ? 'bg-emerald-500' : 'bg-gray-300'}`} />
            {otherOnline ? 'Online now' : 'Offline. They will see your message when they return.'}
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${connected ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}
          title={connected ? 'Connected for real-time chat' : 'Reconnecting; messages still send'}
        >
          {connected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />} {connected ? 'Live' : 'Reconnecting'}
        </span>
      </div>

      <div ref={listRef} className={`${heightClass} space-y-2 overflow-y-auto bg-[var(--sand)]/40 px-3 py-3`} aria-live="polite">
        {messages === null ? (
          <div className="flex h-full items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-[var(--ink-muted)]" /></div>
        ) : messages.length === 0 ? (
          <p className="py-8 text-center text-xs text-[var(--ink-muted)]">No messages yet. Say hello and ask anything about your trip.</p>
        ) : (
          messages.map((m) => {
            const mine = m.senderId === me;
            const day = dayOf(m.createdAt);
            const showDay = day !== lastDay;
            lastDay = day;
            return (
              <div key={m.id}>
                {showDay && <div className="my-2 text-center text-[10px] font-semibold uppercase tracking-wide text-[var(--ink-muted)]">{day}</div>}
                <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs shadow-sm ${
                      mine ? 'rounded-br-sm bg-[var(--brand)] text-white' : 'rounded-bl-sm bg-white text-[var(--ink)]'
                    } ${m.failed ? 'opacity-60 ring-1 ring-red-400' : ''}`}
                  >
                    {!mine && <div className="mb-0.5 text-[10px] font-bold text-[var(--brand-deep)]">{m.sender.firstName} {m.sender.lastName}</div>}
                    <div className="whitespace-pre-wrap break-words">{m.body}</div>
                    <div className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${mine ? 'text-white/80' : 'text-[var(--ink-muted)]'}`}>
                      {timeOf(m.createdAt)}
                      {mine && (m.pending ? <Loader2 className="h-3 w-3 animate-spin" /> : m.failed ? (
                        <button type="button" className="underline" onClick={() => send(m.body, m.id)}>Retry</button>
                      ) : m.isRead ? <CheckCheck className="h-3 w-3" aria-label="Read" /> : <Check className="h-3 w-3" aria-label="Sent" />)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        {typing && <div className="text-[11px] italic text-[var(--ink-muted)]">{typing} is typing…</div>}
      </div>

      {error && <p className="px-4 pt-2 text-xs font-semibold text-red-600">{error}</p>}
      <form
        className="flex items-end gap-2 border-t border-black/5 p-3"
        onSubmit={(e) => {
          e.preventDefault();
          const text = draft;
          setDraft('');
          void send(text);
        }}
      >
        <textarea
          rows={1}
          value={draft}
          maxLength={4000}
          onChange={(e) => onDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
          placeholder="Write a message… (Enter to send, Shift+Enter for a new line)"
          className="form-control max-h-32 min-h-[40px] flex-1 resize-y text-xs"
          aria-label="Message"
        />
        <button type="submit" disabled={!draft.trim()} className="btn btn-primary btn-sm h-10 rounded-xl" aria-label="Send message">
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
