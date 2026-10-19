import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendLeadNotificationEmail } from '@/lib/email';
import { getTourAvailability } from '@/lib/booking';
import { notifyChange } from '@/lib/live';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tourId, slotId, preferredCountry, adultsCount, childrenCount, budgetPerPersonUsd, comfortPreference, customNotes, firstName, lastName, email, phone } = body;

    if (!email || !firstName || !lastName) {
      return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 });
    }

    const adults = Math.max(1, Number(adultsCount) || 2);
    const children = Math.max(0, Number(childrenCount) || 0);

    // A quote for a specific tour must be for a departure that can still take the group.
    // (Quotes do not hold seats; the traveller books through the reservation flow.)
    const tour = tourId ? await prisma.tour.findUnique({ where: { id: String(tourId) }, select: { id: true, operatorId: true, primaryCountry: true } }) : null;
    if (tourId && !tour) return NextResponse.json({ error: 'Tour not found.' }, { status: 404 });
    let departure: { slotId: string; startDate: string } | null = null;
    if (tour) {
      const availability = await getTourAvailability(tour.id);
      const scheduled = await prisma.tourSlot.count({ where: { tourId: tour.id } });
      if (scheduled > 0) {
        if (!availability.some((a) => !a.isFull)) {
          return NextResponse.json({ error: 'Every departure of this tour is fully booked or closed. Please choose another tour.', code: 'SOLD_OUT', availability }, { status: 409 });
        }
        const chosen = availability.find((a) => a.slotId === slotId);
        if (!chosen) {
          return NextResponse.json({ error: 'Choose one of the available departures for this tour.', code: 'NO_SLOT', availability }, { status: 409 });
        }
        if (chosen.isFull) {
          return NextResponse.json({ error: 'That departure is fully booked or closed. Please choose another departure.', code: 'SLOT_FULL', availability }, { status: 409 });
        }
        if (adults + children > chosen.maxGroup) {
          return NextResponse.json({
            error: `That departure can take at most ${chosen.maxGroup} more traveller${chosen.maxGroup === 1 ? '' : 's'} together. Reduce the group or choose another departure.`,
            code: 'CAPACITY',
            availability,
          }, { status: 409 });
        }
        departure = { slotId: chosen.slotId, startDate: chosen.startDate };
      }
    }

    // 1. Find or create user traveler
    let user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: email.toLowerCase().trim(),
          passwordHash: 'guest_inquiry', // Guest quote user
          firstName,
          lastName,
          phone: phone || null,
          role: 'TRAVELER',
        },
      });
    }

    // 2. Create Inquiry Record
    const inquiry = await prisma.inquiry.create({
      data: {
        travelerId: user.id,
        tourId: tour?.id ?? null,
        slotId: departure?.slotId ?? null,
        travelDateStart: departure ? new Date(`${departure.startDate}T00:00:00.000Z`) : null,
        isFlexibleDates: !departure,
        preferredCountry: tour?.primaryCountry ?? (preferredCountry || 'Tanzania'),
        adultsCount: adults,
        childrenCount: children,
        budgetPerPersonUsd: budgetPerPersonUsd || 2000,
        comfortPreference: comfortPreference || 'MID_RANGE',
        customNotes: customNotes || null,
        isBroadcast: true,
        status: 'ROUTED',
      },
    });

    // 3. Dispatch lead to top verified operators matching the country
    // A tour-specific quote goes to that tour's operator; a general one to top verified operators.
    const targetOperators = await prisma.operator.findMany({
      where: tour ? { id: tour.operatorId } : { isVerified: true },
      include: {
        user: { select: { email: true, firstName: true, lastName: true } }
      },
      take: 5,
    });

    for (const op of targetOperators) {
      await prisma.inquiryLead.create({
        data: {
          inquiryId: inquiry.id,
          operatorId: op.id,
          status: 'DISPATCHED',
        },
      });

      // Dispatch lead notification email
      await sendLeadNotificationEmail({
        operatorEmail: op.user.email,
        operatorName: op.companyName,
        travelerName: `${firstName} ${lastName}`,
        travelerEmail: email,
        preferredCountry: preferredCountry || 'Tanzania',
        adultsCount: adultsCount || 2,
        childrenCount: childrenCount || 0,
        notes: customNotes || undefined,
      });
    }

    if (tour) notifyChange(`operator:${tour.operatorId}`);

    return NextResponse.json({
      success: true,
      inquiryId: inquiry.id,
      dispatchedCount: targetOperators.length,
    });
  } catch (error: any) {
    console.error('Inquiry Submission Error:', error);
    return NextResponse.json({ error: 'Failed to submit inquiry.' }, { status: 500 });
  }
}
