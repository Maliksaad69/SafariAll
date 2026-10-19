import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { scheduleDepartures, SlotError, TIME_RE } from '@/lib/departures';
import { parseVehicle } from '@/lib/fleet';
import { toUtcDay, todayUtc } from '@/lib/booking';
import { notifyChange } from '@/lib/live';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || (session.role !== 'OPERATOR' && session.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Operator authentication required.' }, { status: 401 });
  }

  try {
    let operatorId = session.operatorId;
    if (!operatorId) {
      const op = await prisma.operator.findUnique({ where: { userId: session.userId } });
      operatorId = op?.id;
    }
    if (!operatorId) {
      return NextResponse.json({ error: 'No agency profile linked to this account.' }, { status: 404 });
    }

    const body = await req.json();
    const { title, durationDays, durationNights, minPriceUsd, maxPriceUsd, comfortLevel, tourType, primaryCountry, startLocation, endLocation, inclusions, exclusions, itineraries, newVehicles, schedule } = body;

    if (!title || !durationDays || !minPriceUsd || !primaryCountry) {
      return NextResponse.json({ error: 'Title, duration, minimum price and country are required.' }, { status: 400 });
    }

    const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 80);
    let slug = baseSlug;
    let n = 1;
    while (await prisma.tour.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${++n}`;
    }

    // Optional: vehicles to add to the fleet and a departure schedule, created with the tour.
    const vehiclesToAdd: { name: string; seats: number; vehicleType: string; plateNumber: string | null }[] = [];
    for (const v of Array.isArray(newVehicles) ? newVehicles : []) {
      const count = Math.min(10, Math.max(1, Number(v.count) || 1));
      for (let k = 1; k <= count; k++) {
        const parsed = parseVehicle({ ...v, name: count > 1 ? `${v.name} ${k}` : v.name });
        if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
        vehiclesToAdd.push(parsed.data);
      }
    }
    let plan: { firstDate: Date; until: Date; everyDays: number; departureTime: string; vehicleIds: string[]; vehiclesPerDeparture: number; maxTravelers?: number; useNewVehicles: boolean; route: string | null } | null = null;
    if (schedule && schedule.firstDate) {
      const firstDate = toUtcDay(String(schedule.firstDate));
      const until = toUtcDay(String(schedule.until || schedule.firstDate));
      const departureTime = String(schedule.departureTime || '07:30');
      if (!firstDate || !until) return NextResponse.json({ error: 'Schedule dates are invalid.' }, { status: 400 });
      if (firstDate < todayUtc()) return NextResponse.json({ error: 'The first departure must be today or later.' }, { status: 400 });
      if (!TIME_RE.test(departureTime)) return NextResponse.json({ error: 'Departure time must be in HH:MM format.' }, { status: 400 });
      const vehicleIds: string[] = Array.isArray(schedule.vehicleIds) ? schedule.vehicleIds.map(String) : [];
      const useNewVehicles = schedule.useNewVehicles !== false && vehiclesToAdd.length > 0;
      const manual = schedule.maxTravelers ? Number(schedule.maxTravelers) : undefined;
      if (!vehicleIds.length && !useNewVehicles && !(manual && manual >= 1)) {
        return NextResponse.json({ error: 'Choose vehicles for the departures, or set a maximum group size.' }, { status: 400 });
      }
      plan = {
        firstDate, until, departureTime, vehicleIds, useNewVehicles, maxTravelers: manual,
        everyDays: Math.floor(Number(schedule.everyDays) || 7),
        vehiclesPerDeparture: Math.max(1, Math.floor(Number(schedule.vehiclesPerDeparture) || 1)),
        route: schedule.route ? String(schedule.route) : null,
      };
    }

    const result = await prisma.$transaction(async (tx) => {
      const tour = await tx.tour.create({
      data: {
        operatorId,
        title,
        slug,
        durationDays: parseInt(durationDays, 10) || 1,
        durationNights: durationNights ? parseInt(durationNights, 10) : parseInt(durationDays, 10) - 1,
        minPriceUsd: parseFloat(minPriceUsd) || 0,
        maxPriceUsd: maxPriceUsd ? parseFloat(maxPriceUsd) : null,
        comfortLevel: (comfortLevel as any) || 'MID_RANGE',
        tourType: (tourType as any) || 'PRIVATE',
        primaryCountry,
        startLocation: startLocation || null,
        endLocation: endLocation || null,
        inclusions: Array.isArray(inclusions) ? inclusions : inclusions ? inclusions.split('\n').filter(Boolean) : [],
        exclusions: Array.isArray(exclusions) ? exclusions : exclusions ? exclusions.split('\n').filter(Boolean) : [],
        isPublished: true,
        itineraries: {
          create: Array.isArray(itineraries)
            ? itineraries.map((day: any, idx: number) => ({
                dayNumber: day.dayNumber || idx + 1,
                title: day.title || `Day ${idx + 1}`,
                description: day.description || '',
                accommodationName: day.accommodationName || null,
                mealsIncluded: day.mealsIncluded || 'Breakfast, Lunch, Dinner',
              }))
            : [],
        },
      },
      include: { itineraries: true },
    });


      const created = vehiclesToAdd.length
        ? await Promise.all(vehiclesToAdd.map((v) => tx.vehicle.create({ data: { operatorId: operatorId!, ...v } })))
        : [];
      let departures = { created: 0, skipped: [] as string[] };
      if (plan) {
        departures = await scheduleDepartures(tx, {
          tourId: tour.id,
          operatorId: operatorId!,
          durationDays: tour.durationDays,
          firstDate: plan.firstDate,
          until: plan.until,
          everyDays: plan.everyDays,
          departureTime: plan.departureTime,
          route: plan.route ?? [tour.startLocation, tour.endLocation].filter(Boolean).join(' → '),
          vehicleIds: [...plan.vehicleIds, ...(plan.useNewVehicles ? created.map((v) => v.id) : [])],
          vehiclesPerDeparture: plan.vehiclesPerDeparture,
          maxTravelers: plan.maxTravelers,
        });
      }
      return { tour, vehiclesAdded: created.length, departures };
    }, { timeout: 30000 });

    notifyChange(`tour:${result.tour.id}`, `operator:${operatorId}`);
    return NextResponse.json({
      success: true,
      tour: result.tour,
      vehiclesAdded: result.vehiclesAdded,
      departuresCreated: result.departures.created,
      skippedDates: result.departures.skipped,
      bookable: result.departures.created > 0,
    }, { status: 201 });
  } catch (error: any) {
    if (error instanceof SlotError) return NextResponse.json({ error: error.message }, { status: error.status });
    if (/VEHICLE_OVERLAP/.test(error?.message ?? '')) {
      return NextResponse.json({ error: 'One of the vehicles is already out on another trip on those dates.' }, { status: 409 });
    }
    console.error('Create tour error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create tour package.' }, { status: 500 });
  }
}

export async function GET() {
  const session = await getSession();
  if (!session || (session.role !== 'OPERATOR' && session.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Operator authentication required.' }, { status: 401 });
  }

  try {
    let operatorId = session.operatorId;
    if (!operatorId) {
      const op = await prisma.operator.findUnique({ where: { userId: session.userId } });
      operatorId = op?.id;
    }
    if (!operatorId) {
      return NextResponse.json({ tours: [] });
    }

    const tours = await prisma.tour.findMany({
      where: { operatorId },
      orderBy: { createdAt: 'desc' },
      include: { itineraries: { orderBy: { dayNumber: 'asc' } } },
    });
    return NextResponse.json({ tours });
  } catch (error: any) {
    console.error('List tours error:', error);
    return NextResponse.json({ error: 'Failed to load tours.' }, { status: 500 });
  }
}
