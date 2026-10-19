import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession, type SessionPayload } from '@/lib/auth';
import { getTourAvailability, toUtcDay, todayUtc } from '@/lib/booking';
import { applyFleet, createDeparture, SlotError, TIME_RE } from '@/lib/departures';
import { notifyChange } from '@/lib/live';

async function resolveOperatorId(session: SessionPayload): Promise<string | null> {
  if (session.operatorId) return session.operatorId;
  const op = await prisma.operator.findUnique({ where: { userId: session.userId } });
  return op?.id ?? null;
}

/** Returns the tour when the signed-in user may manage its departures, otherwise a response to send. */
async function authorizeManager(tourId: string) {
  const session = await getSession();
  if (!session || (session.role !== 'OPERATOR' && session.role !== 'ADMIN')) {
    return { error: NextResponse.json({ error: 'Operator authentication required.' }, { status: 401 }) };
  }
  const tour = await prisma.tour.findUnique({ where: { id: tourId } });
  if (!tour) return { error: NextResponse.json({ error: 'Tour not found.' }, { status: 404 }) };
  if (session.role === 'OPERATOR' && tour.operatorId !== (await resolveOperatorId(session))) {
    return { error: NextResponse.json({ error: 'This package belongs to another agency.' }, { status: 403 }) };
  }
  return { tour, session };
}

function slotErrorResponse(error: unknown, fallback: string) {
  if (error instanceof SlotError) return NextResponse.json({ error: error.message }, { status: error.status });
  if (/VEHICLE_OVERLAP/.test((error as Error)?.message ?? '')) {
    return NextResponse.json({ error: 'One of these vehicles is already out on another departure that overlaps these dates.' }, { status: 409 });
  }
  if ((error as { code?: string })?.code === 'P2002') {
    return NextResponse.json({ error: 'A departure already exists for this date and time.' }, { status: 409 });
  }
  console.error(fallback, error);
  return NextResponse.json({ error: fallback }, { status: 500 });
}

/** Live departures with seats left. Agencies get past departures and plate numbers with ?manage=1. */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const tour = await prisma.tour.findUnique({ where: { id }, select: { id: true } });
    if (!tour) return NextResponse.json({ error: 'Tour not found.' }, { status: 404 });

    let manage = false;
    if (new URL(req.url).searchParams.get('manage') === '1') {
      const auth = await authorizeManager(id);
      if ('error' in auth) return auth.error;
      manage = true;
    }

    const availability = await getTourAvailability(id, { includePast: manage, includePlates: manage });
    return NextResponse.json({ availability, serverTime: new Date().toISOString() }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return slotErrorResponse(error, 'Failed to load departures.');
  }
}

/** Create a departure: { startDate, departureTime, route?, vehicleIds?, maxTravelers?, note? } */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await authorizeManager(id);
  if ('error' in auth) return auth.error;
  const { tour } = auth;

  try {
    const body = await req.json();
    const start = body.startDate ? toUtcDay(String(body.startDate)) : null;
    if (!start) return NextResponse.json({ error: 'A valid departure date is required.' }, { status: 400 });
    if (start < todayUtc()) return NextResponse.json({ error: 'The departure date must be today or later.' }, { status: 400 });

    const departureTime = String(body.departureTime || '08:00');
    if (!TIME_RE.test(departureTime)) return NextResponse.json({ error: 'Departure time must be in HH:MM format.' }, { status: 400 });

    const vehicleIds: string[] | undefined = Array.isArray(body.vehicleIds) ? body.vehicleIds.map(String) : undefined;
    const manual = body.maxTravelers !== undefined ? Number(body.maxTravelers) : undefined;
    if (!vehicleIds?.length && !(manual && manual >= 1)) {
      return NextResponse.json({ error: 'Assign at least one vehicle or set a maximum group size.' }, { status: 400 });
    }

    const slot = await prisma.$transaction((tx) =>
      createDeparture(tx, {
        tourId: tour.id,
        operatorId: tour.operatorId,
        startDate: start,
        departureTime,
        route: body.route ? String(body.route) : null,
        note: body.note ? String(body.note) : null,
        vehicleIds,
        maxTravelers: manual,
      })
    );

    notifyChange(`tour:${tour.id}`, `operator:${tour.operatorId}`);
    return NextResponse.json({ success: true, slot }, { status: 201 });
  } catch (error) {
    return slotErrorResponse(error, 'Failed to create departure.');
  }
}

/** Update a departure: { slotId, status?: 'OPEN'|'CLOSED', vehicleIds?, maxTravelers?, route?, note? } */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await authorizeManager(id);
  if ('error' in auth) return auth.error;
  const { tour } = auth;

  try {
    const body = await req.json();
    const slot = await prisma.tourSlot.findFirst({ where: { id: String(body.slotId || ''), tourId: tour.id } });
    if (!slot) return NextResponse.json({ error: 'Departure not found.' }, { status: 404 });
    if (body.status !== undefined && !['OPEN', 'CLOSED'].includes(body.status)) {
      return NextResponse.json({ error: 'Status must be OPEN or CLOSED.' }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      const vehicleIds: string[] | undefined = Array.isArray(body.vehicleIds) ? body.vehicleIds.map(String) : undefined;
      const manual = body.maxTravelers !== undefined ? Number(body.maxTravelers) : undefined;
      if (vehicleIds || manual !== undefined) await applyFleet(tx, slot.id, tour.operatorId, vehicleIds, manual);
      await tx.tourSlot.update({
        where: { id: slot.id },
        data: {
          ...(body.status ? { status: body.status } : {}),
          ...(body.route !== undefined ? { route: body.route ? String(body.route).slice(0, 200) : null } : {}),
          ...(body.note !== undefined ? { note: body.note ? String(body.note).slice(0, 500) : null } : {}),
        },
      });
    });

    notifyChange(`tour:${tour.id}`, `operator:${tour.operatorId}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    return slotErrorResponse(error, 'Failed to update departure.');
  }
}

/** Delete a departure that has no active bookings: { slotId } */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await authorizeManager(id);
  if ('error' in auth) return auth.error;
  const { tour } = auth;

  try {
    const { slotId } = await req.json();
    const slot = await prisma.tourSlot.findFirst({ where: { id: String(slotId || ''), tourId: tour.id } });
    if (!slot) return NextResponse.json({ error: 'Departure not found.' }, { status: 404 });

    await prisma.$transaction(async (tx) => {
      const [locked] = await tx.$queryRaw<{ booked_seats: number }[]>`SELECT booked_seats FROM tour_slots WHERE id = ${slot.id} FOR UPDATE`;
      if (locked.booked_seats > 0) {
        throw new SlotError('This departure has active bookings. Close it to stop new bookings, or decide on those reservations first.');
      }
      await tx.tourSlot.delete({ where: { id: slot.id } });
    });

    notifyChange(`tour:${tour.id}`, `operator:${tour.operatorId}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    return slotErrorResponse(error, 'Failed to delete departure.');
  }
}
