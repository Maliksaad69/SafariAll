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
  const body = await req.json();
  const count = Math.min(20, Math.max(1, parseInt(String(body.count || 1), 10) || 1));

  if (count > 1) {
    const baseName = String(body.name || 'Safari Vehicle').trim().slice(0, 70);
    const created = [];
    for (let i = 1; i <= count; i++) {
      const vName = `${baseName} ${i}`;
      const parsed = parseVehicle({ ...body, name: vName, plateNumber: body.plateNumber ? `${body.plateNumber}-${i}` : null });
      if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
      const v = await prisma.vehicle.create({ data: { operatorId, ...parsed.data } });
      created.push(v);
    }
    return NextResponse.json({ success: true, count: created.length, vehicles: created }, { status: 201 });
  }

  const parsed = parseVehicle(body);
  if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const vehicle = await prisma.vehicle.create({ data: { operatorId, ...parsed.data } });
  return NextResponse.json({ success: true, vehicle }, { status: 201 });
}
