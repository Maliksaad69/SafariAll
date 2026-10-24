import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { cookies, headers } from 'next/headers';
import { COOKIE_NAME, JWT_SECRET, verifySessionToken } from '@/lib/session-token';

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: 'TRAVELER' | 'OPERATOR' | 'ADMIN';
  operatorId?: string;
  companyName?: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

async function resolveCookieSecure(): Promise<boolean> {
  if (process.env.COOKIE_SECURE === 'true') return true;
  if (process.env.COOKIE_SECURE === 'false') return false;

  try {
    const headerList = await headers();
    const proto = headerList.get('x-forwarded-proto');
    if (proto) return proto === 'https';

    const origin = headerList.get('origin') || headerList.get('referer');
    if (origin) {
      if (origin.startsWith('https://')) return true;
      if (origin.startsWith('http://')) return false;
    }
  } catch {
    // headers() might not be available outside request context
  }

  const appUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || '';
  if (appUrl.startsWith('https://')) return true;
  if (appUrl.startsWith('http://')) return false;

  return false;
}

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);

  const isSecure = await resolveCookieSecure();
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });

  return token;
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(COOKIE_NAME)?.value);
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
