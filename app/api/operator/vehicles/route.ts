import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { operatorForSession, parseVehicle } from '@/lib/fleet';

/** The agency's fleet, with how many upcoming departures each vehicle serves. */
export async function GET() {
  const operatorId = await operatorForSession();
  if (!operatorId) return NextResponse.json({ error: 'Operator authentication required.' }, { status: 401 });
  const today = new Date();
  const vehicles = await prisma.vehicle.findMany({
    where: { operatorId },
    orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
    include: {
      _count: { select: { slots: { where: { slot: { startDate: { gte: new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())) } } } } } },
    },
  });
  return NextResponse.json({
    vehicles: vehicles.map(({ _count, ...v }) => ({ ...v, upcomingDepartures: _count.slots })),
  });
}

export async function POST(req: Request) {
  const operatorId = await operatorForSession();
  if (!operatorId) return NextResponse.json({ error: 'Operator authentication required.' }, { status: 401 });
  const parsed = parseVehicle(await req.json());
  if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const vehicle = await prisma.vehicle.create({ data: { operatorId, ...parsed.data } });
  return NextResponse.json({ success: true, vehicle }, { status: 201 });
}
