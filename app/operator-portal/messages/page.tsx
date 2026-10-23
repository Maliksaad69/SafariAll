'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChatWorkspace from '@/components/ChatWorkspace';

function Inbox() {
  const reservationId = useSearchParams().get('r');
  return <ChatWorkspace initialReservationId={reservationId} heightClass="h-[calc(100vh-220px)] min-h-[520px]" />;
}

/** Operator inbox: the same chats as the header chat button, on a full page. */
export default function MessagesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--surface-page)] text-[var(--ink-body)]">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Link href="/operator-portal" className="inline-flex items-center gap-2 text-xs font-bold text-[var(--ink-secondary)] hover:underline">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to portal
          </Link>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)]">
            <MessageCircle className="h-3.5 w-3.5" /> Inbox
          </span>
          <span className="text-xs text-[var(--ink-secondary)]">Live chat with every traveller who has reserved one of your tours.</span>
        </div>
        <Suspense fallback={null}>
          <Inbox />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
