'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { Check, CheckCheck, FileText, Image as ImageIcon, Loader2, Paperclip, Send, Smile, Wifi, WifiOff, X, Zap } from 'lucide-react';

/* ── Types ─────────────────────────────────────────────────────────────── */

interface Attachment {
  id: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  isImage: boolean;
}

interface ChatMessage {
  id: string;
  reservationId: string;
  senderId: string;
  body: string;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
  sender: { firstName: string; lastName: string; role: string };
  attachments: Attachment[];
  pending?: boolean;
  failed?: boolean;
  localFiles?: File[];
}

type TransportName = 'socket' | 'pusher' | 'stream';
interface Handlers {
  message: (m: ChatMessage) => void;
  typing: (t: { typing: boolean; name: string; userId?: string }) => void;
  read: (r: { readerId: string }) => void;
  presence: (p: { online: string[] }) => void;
  status: () => void;
  connected: (on: boolean) => void;
}
interface Transport {
  name: TransportName;
  send?: (body: string) => Promise<ChatMessage>;
  typing: (on: boolean) => void;
  read: () => void;
  close: () => void;
}

/* ── Transports ────────────────────────────────────────────────────────── */

let sharedSocket: Socket | null = null;

async function socketTransport(reservationId: string, h: Handlers, onHistory: (m: ChatMessage[], me: string) => void): Promise<Transport> {
  const { io } = await import('socket.io-client');
  if (!sharedSocket) sharedSocket = io({ path: '/socket.io', withCredentials: true, transports: ['websocket', 'polling'] });
  const s = sharedSocket;
  const mine = (p: { reservationId?: string }) => p.reservationId === reservationId;
  const onMessage = (m: ChatMessage) => mine(m) && h.message(m);
  const onTyping = (t: { reservationId: string; typing: boolean; name: string; userId: string }) => mine(t) && h.typing(t);
  const onRead = (r: { reservationId: string; readerId: string }) => mine(r) && h.read(r);
  const onPresence = (p: { reservationId: string; online: string[] }) => mine(p) && h.presence(p);
  const onStatus = (p: { reservationId: string }) => mine(p) && h.status();
  const join = () =>
    s.emit('chat:join', { reservationId }, (res: { ok: boolean; messages?: ChatMessage[]; online?: string[]; me?: string }) => {
      if (!res?.ok) return;
      onHistory(res.messages ?? [], res.me ?? '');
      h.presence({ online: res.online ?? [] });
      h.connected(true);
    });
  const onConnect = () => join();
  const onDown = () => h.connected(false);
  s.on('connect', onConnect);
  s.on('disconnect', onDown);
  s.on('connect_error', onDown);
  s.on('chat:message', onMessage);
  s.on('chat:typing', onTyping);
  s.on('chat:read', onRead);
  s.on('chat:presence', onPresence);
  s.on('chat:status', onStatus);
  if (s.connected) join();
  return {
    name: 'socket',
    send: (body) =>
      new Promise((resolve, reject) => {
        if (!s.connected) return reject(new Error('offline'));
        s.timeout(8000).emit('chat:send', { reservationId, body }, (err: Error | null, res: { ok: boolean; message?: ChatMessage; error?: string }) => {
          if (err) return reject(new Error('offline'));
          if (res?.ok && res.message) resolve(res.message);
          else reject(new Error(res?.error ?? 'Message not sent.'));
        });
      }),
    typing: (on) => {
      if (s.connected) s.emit('chat:typing', { reservationId, typing: on });
    },
    read: () => {
      if (s.connected) s.emit('chat:read', { reservationId });
    },
    close: () => {
      s.emit('chat:leave', { reservationId });
      s.off('connect', onConnect);
      s.off('disconnect', onDown);
      s.off('connect_error', onDown);
      s.off('chat:message', onMessage);
      s.off('chat:typing', onTyping);
      s.off('chat:read', onRead);
      s.off('chat:presence', onPresence);
      s.off('chat:status', onStatus);
    },
  };
}

type PusherChannel = { bind: (e: string, f: (d: never) => void) => void };
type PusherClient = {
  subscribe: (c: string) => PusherChannel;
  unsubscribe: (c: string) => void;
  connection: { bind: (e: string, f: (d: { current: string }) => void) => void };
};
declare global {
  interface Window {
    Pusher?: new (key: string, opts: Record<string, unknown>) => PusherClient;
  }
}
let pusherClient: PusherClient | null = null;
function loadPusherScript(): Promise<void> {
  if (window.Pusher) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const el = document.createElement('script');
    el.src = 'https://js.pusher.com/8.4.0/pusher.min.js';
    el.async = true;
    el.onload = () => resolve();
    el.onerror = () => reject(new Error('Could not load Pusher'));
    document.head.appendChild(el);
  });
}

async function pusherTransport(reservationId: string, cfg: { key: string; cluster: string }, h: Handlers): Promise<Transport> {
  await loadPusherScript();
  if (!pusherClient) {
    pusherClient = new window.Pusher!(cfg.key, { cluster: cfg.cluster, channelAuthorization: { endpoint: '/api/pusher/auth', transport: 'ajax' } });
  }
  const channelName = `private-reservation-${reservationId}`;
  const ch = pusherClient.subscribe(channelName);
  ch.bind('pusher:subscription_succeeded', () => h.connected(true));
  ch.bind('chat:message', (m: ChatMessage) => h.message(m));
  ch.bind('chat:typing', (t: { typing: boolean; name: string; userId: string }) => h.typing(t));
  ch.bind('chat:read', (r: { readerId: string }) => h.read(r));
  ch.bind('chat:status', () => h.status());
  pusherClient.connection.bind('state_change', (s) => h.connected(s.current === 'connected'));
  return httpControls('pusher', reservationId, () => pusherClient?.unsubscribe(channelName));
}

function streamTransport(reservationId: string, since: () => string | null, h: Handlers): Transport {
  const s = since();
  const es = new EventSource(`/api/reservations/${reservationId}/stream${s ? `?since=${encodeURIComponent(s)}` : ''}`);
  const data = (e: Event) => JSON.parse((e as MessageEvent).data);
  es.addEventListener('ready', () => h.connected(true));
  es.addEventListener('error', () => h.connected(false));
  es.addEventListener('chat:message', (e) => h.message(data(e)));
  es.addEventListener('chat:typing', (e) => h.typing(data(e)));
  es.addEventListener('chat:read', (e) => h.read(data(e)));
  es.addEventListener('chat:presence', (e) => h.presence(data(e)));
  es.addEventListener('chat:status', () => h.status());
  return httpControls('stream', reservationId, () => es.close());
}

function httpControls(name: TransportName, reservationId: string, close: () => void): Transport {
  return {
    name,
    typing: (on) => {
      void fetch(`/api/reservations/${reservationId}/typing`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ typing: on }) }).catch(() => {});
    },
    read: () => {
      void fetch(`/api/reservations/${reservationId}/read`, { method: 'POST' }).catch(() => {});
    },
    close,
  };
}

/* ── Helpers ───────────────────────────────────────────────────────────── */

const EMOJI = ['😀', '😂', '😊', '😍', '🙏', '👍', '👌', '🙌', '🎉', '❤️', '🔥', '✅', '❓', '😅', '😎', '🤩', '🦁', '🐘', '🦒', '🦓', '🐆', '🌍', '🌅', '⛺', '🚙', '✈️', '📍', '📅', '⏰', '📸', '🍽️', '🧳'];
const QUICK: Record<'traveler' | 'agency', string[]> = {
  traveler: ['What time is pickup?', 'Can we change the date?', 'Are park fees included?', 'We have a dietary requirement.', 'Thank you!'],
  agency: ['Your booking is confirmed ✅', 'Pickup is at 07:00 from your hotel.', 'Please share your flight details.', 'Park fees are included.', 'Happy to help. Any other questions?'],
};
const timeOf = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const dayOf = (iso: string) => new Date(iso).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
const sizeOf = (n: number) => (n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);
const IS_URL = /^https?:\/\/\S+$/;
function Linkified({ text }: { text: string }) {
  return (
    <>
      {text.split(/(https?:\/\/[^\s<]+)/g).map((part, i) =>
        IS_URL.test(part) ? (
          <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="break-all underline">{part}</a>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}
const ACCEPT = 'image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt';
const MAX_BYTES = 8 * 1024 * 1024;

/** Shrink large photos in the browser (max 1920 px, JPEG) so uploads are fast and fit serverless limits. */
async function compressImage(f: File): Promise<File> {
  if (!/^image\/(jpeg|png|webp)$/.test(f.type) || f.size < 600 * 1024) return f;
  try {
    const bitmap = await createImageBitmap(f);
    const scale = Math.min(1, 1920 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob: Blob | null = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', 0.85));
    if (!blob || blob.size >= f.size) return f;
    return new File([blob], f.name.replace(/\.(png|webp|jpeg|jpg)$/i, '') + '.jpg', { type: 'image/jpeg' });
  } catch {
    return f;
  }
}

/* ── Component ─────────────────────────────────────────────────────────── */

/**
 * Real-time chat between a reservation's traveller and its tour operator.
 * Picks the best transport the deployment offers (socket.io on a Node server,
 * Pusher on serverless hosts when configured, otherwise a Postgres-backed event
 * stream that works anywhere), with photos, files, emoji and quick replies.
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
  const [me, setMe] = useState('');
  const [side, setSide] = useState<'traveler' | 'agency'>('traveler');
  const [transport, setTransport] = useState<TransportName | null>(null);
  const [connected, setConnected] = useState(false);
  const [online, setOnline] = useState<string[]>([]);
  const [typing, setTyping] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showQuick, setShowQuick] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const [maxUpload, setMaxUpload] = useState(MAX_BYTES);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const tRef = useRef<Transport | null>(null);
  const meRef = useRef('');
  const lastAt = useRef<string | null>(null);
  const typingTimer = useRef<number | null>(null);
  const typingSent = useRef(false);
  const tempSeq = useRef(0);

  const merge = useCallback((incoming: ChatMessage[]) => {
    setMessages((prev) => {
      const byId = new Map((prev ?? []).filter((m) => !m.pending && !m.failed).map((m) => [m.id, m]));
      for (const m of incoming) byId.set(m.id, m);
      const sorted = Array.from(byId.values()).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      if (sorted.length) lastAt.current = sorted[sorted.length - 1].createdAt;
      return [...sorted, ...(prev ?? []).filter((m) => m.pending || m.failed)];
    });
  }, []);

  const loadHistory = useCallback(async () => {
    const r = await fetch(`/api/reservations/${reservationId}/messages`, { cache: 'no-store' }).catch(() => null);
    const d = r && r.ok ? await r.json() : null;
    if (!d) {
      setMessages((m) => m ?? []);
      return;
    }
    meRef.current = d.me;
    setMe(d.me);
    setSide(d.side);
    merge(d.messages ?? []);
  }, [reservationId, merge]);

  // Connect with the best transport this deployment offers.
  useEffect(() => {
    let cancelled = false;
    const handlers: Handlers = {
      message: (m) => {
        merge([m]);
        if (m.senderId !== meRef.current) {
          setTyping(null);
          if (document.visibilityState === 'visible') tRef.current?.read();
        }
      },
      typing: (t) => {
        if (t.userId && t.userId === meRef.current) return;
        setTyping(t.typing ? t.name || 'They' : null);
      },
      read: (r) => {
        if (r.readerId === meRef.current) return;
        setMessages((prev) => prev?.map((m) => (m.senderId === meRef.current ? { ...m, isRead: true } : m)) ?? prev);
      },
      presence: (p) => setOnline(p.online),
      status: () => void loadHistory(),
      connected: (on) => setConnected(on),
    };

    (async () => {
      await loadHistory();
      const cfg = await fetch('/api/chat/config', { cache: 'no-store' }).then((r) => r.json()).catch(() => ({ transport: 'stream' }));
      if (cancelled) return;
      if (cfg.maxUploadBytes) setMaxUpload(cfg.maxUploadBytes);
      let t: Transport;
      try {
        if (cfg.transport === 'socket') {
          t = await socketTransport(reservationId, handlers, (msgs, id) => {
            if (id) {
              meRef.current = id;
              setMe(id);
            }
            merge(msgs);
          });
        } else if (cfg.transport === 'pusher' && cfg.pusher) {
          t = await pusherTransport(reservationId, cfg.pusher, handlers);
        } else {
          t = streamTransport(reservationId, () => lastAt.current, handlers);
        }
      } catch {
        t = streamTransport(reservationId, () => lastAt.current, handlers);
      }
      if (cancelled) return t.close();
      tRef.current = t;
      setTransport(t.name);
    })();

    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        tRef.current?.read();
        void loadHistory();
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisible);
      tRef.current?.close();
      tRef.current = null;
    };
  }, [reservationId, merge, loadHistory]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages?.length, typing]);

  const emitTyping = (on: boolean) => {
    if (typingSent.current === on) return;
    typingSent.current = on;
    tRef.current?.typing(on);
  };

  const onDraft = (v: string) => {
    setDraft(v);
    emitTyping(v.length > 0);
    if (typingTimer.current) window.clearTimeout(typingTimer.current);
    typingTimer.current = window.setTimeout(() => emitTyping(false), 3000);
  };

  const addFiles = async (list: FileList | File[] | null) => {
    if (!list) return;
    setError('');
    const next = [...files];
    for (const raw of Array.from(list)) {
      const f = await compressImage(raw);
      const total = next.reduce((n, x) => n + x.size, 0) + f.size;
      if (f.size > maxUpload || total > maxUpload) {
        setError(`Files in one message can be up to ${Math.round(maxUpload / 1048576)} MB in total. ${f.name} doesn't fit; send it in a separate message.`);
        continue;
      }
      if (next.length < 5) next.push(f);
    }
    setFiles(next);
  };

  const previews = useMemo(() => files.map((f) => (f.type.startsWith('image/') ? URL.createObjectURL(f) : null)), [files]);
  useEffect(() => () => previews.forEach((p) => p && URL.revokeObjectURL(p)), [previews]);

  const send = async (text: string, attach: File[], retryId?: string) => {
    const body = text.trim();
    if (!body && attach.length === 0) return;
    setError('');
    emitTyping(false);
    const tempId = retryId ?? `tmp-${++tempSeq.current}`;
    const optimistic: ChatMessage = {
      id: tempId, reservationId, senderId: meRef.current, body, isRead: false, createdAt: new Date().toISOString(),
      sender: { firstName: 'You', lastName: '', role: '' }, attachments: [], pending: true, localFiles: attach,
    };
    setMessages((prev) => [...(prev ?? []).filter((m) => m.id !== tempId), optimistic]);

    const settle = (m: ChatMessage | null, err?: string) => {
      if (!m) setError(err ?? 'Message not sent.');
      setMessages((prev) => {
        const rest = (prev ?? []).filter((x) => x.id !== tempId);
        if (m) {
          lastAt.current = m.createdAt;
          const kept = rest.filter((x) => x.id !== m.id);
          const settled = kept.filter((x) => !x.pending && !x.failed);
          return [...[...settled, m].sort((a, b) => a.createdAt.localeCompare(b.createdAt)), ...kept.filter((x) => x.pending || x.failed)];
        }
        return [...rest, { ...optimistic, pending: false, failed: true }];
      });
    };

    try {
      if (attach.length === 0 && tRef.current?.send) {
        try {
          settle(await tRef.current.send(body));
          return;
        } catch (e) {
          if ((e as Error).message !== 'offline') {
            settle(null, (e as Error).message);
            return;
          }
        }
      }
      let res: Response;
      if (attach.length) {
        const form = new FormData();
        form.append('body', body);
        attach.forEach((f) => form.append('files', f));
        res = await fetch(`/api/reservations/${reservationId}/messages`, { method: 'POST', body: form });
      } else {
        res = await fetch(`/api/reservations/${reservationId}/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ body }) });
      }
      const d = await res.json().catch(() => ({}));
      if (res.ok && d.message) settle(d.message);
      else settle(null, d.error);
    } catch {
      settle(null, 'Could not reach the server.');
    }
  };

  const submit = () => {
    const text = draft;
    const attach = files;
    setDraft('');
    setFiles([]);
    setShowEmoji(false);
    setShowQuick(false);
    void send(text, attach);
  };

  const otherOnline = online.some((id) => id && id !== me);
  let lastDay = '';

  return (
    <div
      className={`relative flex flex-col rounded-2xl border bg-white shadow-sm ${dragging ? 'border-[var(--brand)] ring-2 ring-[var(--brand)]/30' : 'border-black/5'}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        void addFiles(e.dataTransfer.files);
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-black/5 px-4 py-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-bold text-[var(--brand-deep)]">Chat{counterpartName ? ` with ${counterpartName}` : ''}</div>
          <div className="flex items-center gap-1.5 text-[11px] text-[var(--ink-muted)]">
            {transport !== 'pusher' && <span className={`inline-block h-2 w-2 rounded-full ${otherOnline ? 'bg-emerald-500' : 'bg-gray-300'}`} />}
            {typing ? (
              <span className="font-semibold text-[var(--brand)]">{typing} is typing…</span>
            ) : transport === 'pusher' ? (
              'Messages arrive instantly. Photos and files welcome.'
            ) : otherOnline ? (
              'Online now'
            ) : (
              'Offline. They will be notified of your message.'
            )}
          </div>
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${connected ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}
          title={transport ? `Realtime via ${transport === 'socket' ? 'socket.io' : transport === 'pusher' ? 'Pusher' : 'live stream'}` : 'Connecting'}
        >
          {connected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />} {connected ? 'Live' : 'Connecting'}
        </span>
      </div>

      {/* Messages */}
      <div ref={listRef} className={`${heightClass} space-y-2 overflow-y-auto bg-[var(--sand)]/40 px-3 py-3`} aria-live="polite">
        {messages === null ? (
          <div className="flex h-full items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-[var(--ink-muted)]" /></div>
        ) : messages.length === 0 ? (
          <div className="py-8 text-center text-xs text-[var(--ink-muted)]">No messages yet. Ask anything about your trip, or share flight details and photos.</div>
        ) : (
          messages.map((m) => {
            const mine = m.senderId === me || !!m.pending || !!m.failed;
            const day = dayOf(m.createdAt);
            const showDay = day !== lastDay;
            lastDay = day;
            const images = m.attachments.filter((a) => a.isImage);
            return (
              <div key={m.id}>
                {showDay && <div className="my-2 text-center text-[10px] font-semibold uppercase tracking-wide text-[var(--ink-muted)]">{day}</div>}
                <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[82%] rounded-2xl px-3 py-2 text-[13px] shadow-sm ${mine ? 'rounded-br-sm bg-[var(--brand)] text-white' : 'rounded-bl-sm bg-white text-[var(--ink)]'} ${m.failed ? 'opacity-70 ring-1 ring-red-400' : ''}`}>
                    {!mine && <div className="mb-0.5 text-[10px] font-bold text-[var(--brand-deep)]">{m.sender.firstName} {m.sender.lastName}</div>}
                    {images.length > 0 && (
                      <div className={`mb-1 grid gap-1.5 ${images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                        {images.map((a) => (
                          <a key={a.id} href={a.url} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-xl">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={a.url} alt={a.filename} loading="lazy" className="max-h-56 w-full object-cover" />
                          </a>
                        ))}
                      </div>
                    )}
                    {m.attachments.filter((a) => !a.isImage).map((a) => (
                      <a key={a.id} href={`${a.url}?download=1`} className={`mb-1 flex items-center gap-2 rounded-xl px-2.5 py-2 ${mine ? 'bg-white/15' : 'bg-[var(--surface-sunk)]'}`}>
                        <FileText className="h-4 w-4 shrink-0" />
                        <span className="min-w-0 truncate">{a.filename}</span>
                        <span className="ml-auto shrink-0 text-[10px] opacity-75">{sizeOf(a.sizeBytes)}</span>
                      </a>
                    ))}
                    {m.localFiles?.map((f, i) => (
                      <div key={i} className="mb-1 flex items-center gap-2 rounded-xl bg-white/15 px-2.5 py-2 text-[11px]">
                        {f.type.startsWith('image/') ? <ImageIcon className="h-4 w-4" /> : <FileText className="h-4 w-4" />} {f.name}
                      </div>
                    ))}
                    {m.body && <div className="whitespace-pre-wrap break-words leading-relaxed"><Linkified text={m.body} /></div>}
                    <div className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${mine ? 'text-white/80' : 'text-[var(--ink-muted)]'}`}>
                      {timeOf(m.createdAt)}
                      {mine &&
                        (m.pending ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : m.failed ? (
                          <button type="button" className="font-bold underline" onClick={() => send(m.body, m.localFiles ?? [], m.id)}>Retry</button>
                        ) : m.isRead ? (
                          <CheckCheck className="h-3.5 w-3.5 text-sky-200" aria-label="Read" />
                        ) : (
                          <Check className="h-3 w-3" aria-label="Delivered" />
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        {typing && (
          <div className="flex items-center gap-1 pl-1 text-[var(--ink-muted)]" aria-label={`${typing} is typing`}>
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.2s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.1s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" />
          </div>
        )}
      </div>

      {/* Quick replies / emoji */}
      {showQuick && (
        <div className="flex flex-wrap gap-1.5 border-t border-black/5 px-3 py-2">
          {QUICK[side].map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => {
                setShowQuick(false);
                void send(q, []);
              }}
              className="rounded-full border border-[var(--border)] bg-white px-2.5 py-1 text-[11px] font-semibold hover:border-[var(--brand)]"
            >
              {q}
            </button>
          ))}
        </div>
      )}
      {showEmoji && (
        <div className="grid grid-cols-8 gap-1 border-t border-black/5 px-3 py-2">
          {EMOJI.map((e) => (
            <button
              key={e}
              type="button"
              className="rounded-lg p-1 text-lg hover:bg-[var(--surface-sunk)]"
              onClick={() => {
                setDraft((d) => d + e);
                inputRef.current?.focus();
              }}
            >
              {e}
            </button>
          ))}
        </div>
      )}

      {/* Selected files */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 border-t border-black/5 px-3 pt-2">
          {files.map((f, i) => (
            <div key={i} className="relative flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface-sunk)] p-1 pr-6 text-[11px]">
              {previews[i] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previews[i]!} alt="" className="h-10 w-10 rounded-lg object-cover" />
              ) : (
                <FileText className="m-2 h-5 w-5" />
              )}
              <span className="max-w-[120px] truncate">{f.name}</span>
              <button type="button" aria-label={`Remove ${f.name}`} className="absolute right-1 top-1" onClick={() => setFiles((l) => l.filter((_, k) => k !== i))}>
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <p className="px-4 pt-2 text-xs font-semibold text-red-600">{error}</p>}

      {/* Composer */}
      <form
        className="space-y-1.5 border-t border-black/5 p-2.5"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPT}
          multiple
          hidden
          onChange={(e) => {
            void addFiles(e.target.files);
            e.target.value = '';
          }}
        />
        <div className="flex items-center gap-0.5">
        <button type="button" title="Attach photos or files" aria-label="Attach files" className="rounded-xl p-2 text-[var(--ink-secondary)] hover:bg-[var(--surface-sunk)]" onClick={() => fileRef.current?.click()}>
            <Paperclip className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="Emoji"
            aria-label="Emoji"
            className={`rounded-xl p-2 hover:bg-[var(--surface-sunk)] ${showEmoji ? 'text-[var(--brand)]' : 'text-[var(--ink-secondary)]'}`}
            onClick={() => {
              setShowEmoji((v) => !v);
              setShowQuick(false);
            }}
          >
            <Smile className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="Quick replies"
            aria-label="Quick replies"
            className={`rounded-xl p-2 hover:bg-[var(--surface-sunk)] ${showQuick ? 'text-[var(--brand)]' : 'text-[var(--ink-secondary)]'}`}
            onClick={() => {
              setShowQuick((v) => !v);
              setShowEmoji(false);
            }}
          >
            <Zap className="h-4 w-4" />
          </button>
          <span className="ml-auto pr-1 text-[10px] text-[var(--ink-muted)]">Photos, PDFs and documents up to {Math.round(maxUpload / 1048576)} MB</span>
        </div>
        <div className="flex items-end gap-1.5">
        <textarea
            ref={inputRef}
            rows={1}
            value={draft}
            maxLength={4000}
            onChange={(e) => onDraft(e.target.value)}
            onPaste={(e) => {
              const pasted = Array.from(e.clipboardData.files);
              if (pasted.length) void addFiles(pasted);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Write a message…"
            className="form-control max-h-32 min-h-[40px] flex-1 resize-none text-[13px]"
            aria-label="Message"
          />
          <button type="submit" disabled={!draft.trim() && files.length === 0} className="btn btn-primary h-10 rounded-xl px-3" aria-label="Send message">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
      {dragging && <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl bg-white/80 text-sm font-bold text-[var(--brand)]">Drop files to attach</div>}
    </div>
  );
}
