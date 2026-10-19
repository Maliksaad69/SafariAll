import type { Server } from 'socket.io';

/**
 * Access to the socket.io server created in server.ts. Route handlers run in the
 * same Node process, so they can push events to a reservation's chat room.
 * When the app runs without the custom server (plain `next dev`), this is a no-op
 * and clients fall back to the /api/live stream.
 */
const g = globalThis as unknown as { __safariIO?: Server };

export function setRealtimeServer(io: Server) {
  g.__safariIO = io;
}

export const reservationRoom = (reservationId: string) => `reservation:${reservationId}`;

export function emitToReservation(reservationId: string, event: string, payload: unknown) {
  g.__safariIO?.to(reservationRoom(reservationId)).emit(event, payload);
}
