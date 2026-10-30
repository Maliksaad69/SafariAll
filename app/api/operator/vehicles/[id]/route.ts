import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { operatorForSession, parseVehicle } from '@/lib/fleet';

/**
 * Edit a vehicle. Seat changes apply to departures created afterwards; existing
 * departures keep the seat count they were scheduled with.
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const operatorId = await operatorForSession();
  if (!operatorId) return NextResponse.json({ error: 'Operator authentication required.' }, { status: 401 });
  const { id } = await params;
  const vehicle = await prisma.vehicle.findFirst({ where: { id, operatorId } });
  if (!vehicle) return NextResponse.json({ error: 'Vehicle not found.' }, { status: 404 });

  const body = await req.json();
  const parsed = parseVehicle({ ...vehicle, ...body });
  if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const updated = await prisma.vehicle.update({
    where: { id },
    data: { ...parsed.data, ...(typeof body.isActive === 'boolean' ? { isActive: body.isActive } : {}) },
  });
  return NextResponse.json({ success: true, vehicle: updated });
}

/** Remove a vehicle that has never been scheduled; otherwise deactivate it instead. */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const operatorId = await operatorForSession();
  if (!operatorId) return NextResponse.json({ error: 'Operator authentication required.' }, { status: 401 });
  const { id } = await params;
  const vehicle = await prisma.vehicle.findFirst({ where: { id, operatorId }, include: { _count: { select: { slots: true } } } });
  if (!vehicle) return NextResponse.json({ error: 'Vehicle not found.' }, { status: 404 });
  if (vehicle._count.slots > 0) {
    await prisma.vehicle.update({ where: { id }, data: { isActive: false } });
    return NextResponse.json({ success: true, deactivated: true });
  }
  await prisma.vehicle.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
