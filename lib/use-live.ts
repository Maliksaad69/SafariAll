'use client';

import { useEffect, useRef } from 'react';

/**
 * Subscribe to /api/live and call `onChange` whenever the watched data changes
 * (also when the tab regains focus or the stream reconnects). Pass null to pause.
 */
export function useLiveRefresh(query: string | null, onChange: () => void) {
  const cb = useRef(onChange);
  useEffect(() => {
    cb.current = onChange;
  });

  useEffect(() => {
    if (!query || typeof window === 'undefined') return;
    let source: EventSource | null = null;
    let connected = false;

    const fire = () => cb.current();
    if ('EventSource' in window) {
      source = new EventSource(`/api/live?${query}`);
      source.addEventListener('change', fire);
      // On reconnect we may have missed events, so refresh once.
      source.addEventListener('ready', () => {
        if (connected) fire();
        connected = true;
      });
    }
    const onVisible = () => {
      if (document.visibilityState === 'visible') fire();
    };
    document.addEventListener('visibilitychange', onVisible);
    // Fallback for browsers or proxies without SSE support.
    const timer = source ? null : window.setInterval(fire, 5000);

    return () => {
      source?.close();
      document.removeEventListener('visibilitychange', onVisible);
      if (timer) window.clearInterval(timer);
    };
  }, [query]);
}
