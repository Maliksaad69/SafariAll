import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

/** Operator id of the signed-in agency user, or null. */
export async function operatorForSession() {
  const session = await getSession();
  if (!session || (session.role !== 'OPERATOR' && session.role !== 'ADMIN')) return null;
  const operatorId = session.operatorId ?? (await prisma.operator.findUnique({ where: { userId: session.userId } }))?.id;
  return operatorId ?? null;
}

export function parseVehicle(body: Record<string, unknown>) {
  const name = String(body.name ?? '').trim().slice(0, 80);
  const seats = Number(body.seats);
  const vehicleType = String(body.vehicleType ?? '4x4 Safari Vehicle').trim().slice(0, 60) || '4x4 Safari Vehicle';
  const plateNumber = body.plateNumber ? String(body.plateNumber).trim().slice(0, 20) : null;
  if (!name) return { error: 'Vehicle name is required.' };
  if (!Number.isInteger(seats) || seats < 1 || seats > 100) return { error: 'Seats must be a whole number between 1 and 100.' };
  return { data: { name, seats, vehicleType, plateNumber } };
}
