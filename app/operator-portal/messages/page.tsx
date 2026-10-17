'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Calendar, Mail, Send, Loader2, Phone, Globe } from 'lucide-react';

interface Thread { id: string; reference: string; tour: { title: string; slug: string; }; traveler: { firstName: string; lastName: string; email: string; phone: string | null; country: string | null; }; adultsCount: number; childrenCount: number; status: string; messages: any[]; }

export default function MessagesPage() {
  const router = useRouter();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [msgBody, setMsgBody] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/reservations').then((r) => r.json()),
      fetch('/api/operators').then((r) => r.json()),
    ]).then(([resJ, opsJ]: [any, any]) => {
      const rr = (resJ.reservations || []);
      const ops = (opsJ.operators || []).reduce((m: Record<string, string>, o: any) => { m[o.id] = o.companyName; return m; }, {});
      const items: Thread[] = rr.map((r: any) => ({
        ...r,
        operatorName: ops[r.operatorId] || '',
        tour: r.tour,
        traveler: r.traveler,
        adultsCount: r.adultsCount,
        childrenCount: r.childrenCount,
        status: r.status,
        messages: [],
      }));
      setThreads(items);
      if (items.length > 0) setSelectedId(items[0].id);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const loadMessages = (rid: string) => {
    fetch(`/api/reservations/${rid}/messages`)
      .then((r) => r.json())
      .then(({ messages }) => setMessages(messages || []))
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
      if (!res.ok) throw new Error(data.error || 'Failed to send.');
      loadMessages(selectedId);
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Could not send message.');
    } finally {
      setSending(false);
    }
  };

  const thread = threads.find((t) => t.id === selectedId);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--surface-page)] text-[var(--ink-body)]">
      <Navbar />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/operator-portal" className="inline-flex items-center gap-2 text-xs font-bold text-[var(--ink-secondary)] hover:underline">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to portal
            </Link>
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)]">Client Messages</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[var(--ink-secondary)]">
            <Mail className="h-4 w-4"/> Exchanges with travelers appear here once a booking is requested, approved or declined.
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6" style={{ minHeight: '480px' }}>
          {/* Sidebar */}
          <div className="w-full md:w-80 shrink-0">
            {loading ? (
              <div className="flex justify-center py-16"><Loader2 className="animate-spin h-6 w-6 text-[var(--ink-muted)]"/></div>
            ) : threads.length === 0 ? (
              <div className="surface-card p-8 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--surface-sunk)] text-[var(--ink-muted)]"><Mail className="h-6 w-6"/></div>
                <p className="text-sm font-semibold text-[var(--ink-secondary)]">No reservation threads yet</p>
                <p className="text-xs text-[var(--ink-muted)] mt-1 max-w-xs mx-auto">When travelers request to book your packages, the exchange between you and the traveler appears here.</p>
              </div>
            ) : (
              <ul className="space-y-1 max-h-[560px] overflow-y-auto">
                {threads.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedId(t.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-colors text-sm flex flex-wrap items-center gap-2 border ${
                      selectedId === t.id ? 'bg-[var(--brand-soft)] border-[var(--brand)] text-[var(--brand-deep)] shadow-sm' : 'border-transparent bg-white hover:bg-[var(--surface-sunk)]'
                    }`}
                  >
                    {t.status === 'PENDING' && <span className="badge badge-warning text-[10px]">Pending</span>}
                    {t.status === 'APPROVED' && <span className="badge badge-success text-[10px]">Approved</span>}
                    {t.status === 'DECLINED' && <span className="badge badge-danger text-[10px]">Declined</span>}
                    <span className="truncate font-semibold text-[var(--ink)]">{t.traveler.firstName} {t.traveler.lastName}</span>
                    <span className="text-[var(--ink-muted)] line-clamp-1">{t.tour.title}</span>
                    <span className="ml-auto text-[10px] text-[var(--ink-muted)]">#{t.reference.slice(-8).toUpperCase()}</span>
                  </button>
                ))}
              </ul>
            )}
          </div>

          {/* Chat pane */}
          <div className={selectedId ? 'flex-1 flex flex-col gap-4' : 'hidden md:flex items-center justify-center'}>
            {!thread ? (
              <div className="text-center text-[var(--ink-secondary)]">
                <ArrowRight className="h-8 w-8 mx-auto mb-2 text-[var(--ink-muted)]" />
                <p className="text-sm">Select a thread to read or reply.</p>
              </div>
            ) : (
              <div className="flex flex-col flex-1">
                {/* Thread header */}
                <div className="border-b border-[var(--border)] pb-3 mb-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="font-semibold text-[var(--ink)]">{thread.traveler.firstName} {thread.traveler.lastName}</span>
                      <div className="text-xs text-[var(--ink-secondary)] mt-0.5">
                        {thread.tour.title} · {thread.adultsCount + thread.childrenCount} pax · {thread.status}
                      </div>
                    </div>
                    <div className="flex gap-3 text-xs text-[var(--ink-secondary)]">
                      {thread.traveler.email && (
                        <a href={`mailto:${thread.traveler.email}`} className="inline-flex items-center gap-1 hover:text-[var(--brand)]">
                          <Mail className="h-3 w-3"/> {thread.traveler.email}
                        </a>
                      )}
                      {thread.traveler.phone && <span>{thread.traveler.phone}</span>}
                      {thread.traveler.country && (
                        <span className="inline-flex items-center gap-1"><Globe className="h-3 w-3"/> {thread.traveler.country}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Message list */}
                <div className="flex-1 overflow-y-auto rounded-xl bg-white border border-[var(--border)] p-4 space-y-3">
                  {messages.length === 0 ? (
                    <div className="text-center text-sm text-[var(--ink-muted)] py-8">No messages yet. Write the first one below.</div>
                  ) : (
                    messages.map((m: { id: string; senderId?: string; body: string; createdAt: string; sender?: { firstName: string; lastName: string } }) => {
                      const isAgency = m.senderId !== undefined && thread?.traveler?.firstName !== '' ? false : true;
                      return (
                        <div key={m.id} className={`flex flex-col ${isAgency ? 'items-end' : 'items-start'} gap-1 max-w-[80%]`}>
                          <div className={`rounded-2xl px-3 py-2 ${isAgency ? 'bg-[var(--brand)] text-white rounded-br-sm' : 'bg-[var(--ink)] text-white rounded-bl-sm'}`}>
                            <span className="text-xs font-semibold block mb-0.5 opacity-90">{isAgency ? 'Agency' : `${m.sender?.firstName ?? ''} ${m.sender?.lastName ?? ''}`}</span>
                            <p className="text-sm leading-relaxed">{m.body}</p>
                            <span className="text-[10px] opacity-70 mt-0.5 block">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Compose */}
                <form onSubmit={send} className="flex gap-2 mt-3">
                  <input value={msgBody} onChange={(e) => setMsgBody(e.target.value)} placeholder="Write a message to the traveler…" className="form-control flex-1 rounded-xl" disabled={sending} />
                  <button type="submit" disabled={sending || !msgBody.trim()} className="btn btn-primary px-4">
                    {sending ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4"/>}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
