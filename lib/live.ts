import { EventEmitter } from 'events';
import prisma from '@/lib/prisma';

/**
 * Live updates for booking data.
 *
 * Writers call notifyChange() after a commit so open browser streams in this
 * process refresh at once. The /api/live stream also re-checks a database
 * fingerprint every few seconds, so changes made by another server instance
 * (or directly in SQL) still reach every viewer.
 *
 * Channel keys: `tour:<tourId>`, `operator:<operatorId>`, `user:<userId>`.
 */
const g = globalThis as unknown as { __safariLiveBus?: EventEmitter };
export const liveBus: EventEmitter = g.__safariLiveBus ?? new EventEmitter();
liveBus.setMaxListeners(0);
g.__safariLiveBus = liveBus;

export function notifyChange(...keys: (string | null | undefined)[]) {
  for (const key of keys) if (key) liveBus.emit('change', key);
}

type Row = { fp: string | null };

/** A short string that changes whenever anything a channel shows changes. */
export async function fingerprint(key: string): Promise<string> {
  const [kind, id] = key.split(':');
  if (!id) return '';
  if (kind === 'tour') {
    const rows = await prisma.$queryRaw<Row[]>`
      SELECT COUNT(*)::text || '|' || COALESCE(MAX(updated_at)::text, '') || '|' || COALESCE(SUM(booked_seats), 0)::text AS fp
      FROM tour_slots WHERE tour_id = ${id}`;
    return rows[0]?.fp ?? '';
  }
  if (kind === 'operator') {
    const rows = await prisma.$queryRaw<Row[]>`
      SELECT
        (SELECT COUNT(*)::text || '|' || COALESCE(MAX(updated_at)::text, '') FROM reservations WHERE operator_id = ${id}) || '|' ||
        (SELECT COUNT(*)::text || '|' || COALESCE(MAX(s.updated_at)::text, '') FROM tour_slots s JOIN tours t ON t.id = s.tour_id WHERE t.operator_id = ${id}) || '|' ||
        (SELECT COUNT(*)::text FROM reservation_messages m JOIN reservations r ON r.id = m.reservation_id WHERE r.operator_id = ${id}) AS fp`;
    return rows[0]?.fp ?? '';
  }
  if (kind === 'user') {
    const rows = await prisma.$queryRaw<Row[]>`
      SELECT
        (SELECT COUNT(*)::text || '|' || COALESCE(MAX(updated_at)::text, '') FROM reservations WHERE traveler_id = ${id}) || '|' ||
        (SELECT COUNT(*)::text FROM reservation_messages m JOIN reservations r ON r.id = m.reservation_id WHERE r.traveler_id = ${id}) AS fp`;
    return rows[0]?.fp ?? '';
  }
  return '';
}
