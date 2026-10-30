import { jwtVerify } from 'jose';
import type { SessionPayload } from '@/lib/auth';

// Shared by Next route handlers (via lib/auth) and the socket.io server, which
// reads the same cookie from the WebSocket handshake.
export const COOKIE_NAME = 'safariasili_session';
export const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'safariasili-jwt-secret-key-2026-production'
);

export async function verifySessionToken(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/** Read the session cookie out of a raw Cookie header. */
export function tokenFromCookieHeader(header: string | undefined): string | null {
  if (!header) return null;
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === COOKIE_NAME) return decodeURIComponent(v.join('='));
  }
  return null;
}
