import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendLeadNotificationEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tourId, preferredCountry, adultsCount, childrenCount, budgetPerPersonUsd, comfortPreference, customNotes, firstName, lastName, email, phone } = body;

    if (!email || !firstName || !lastName) {
      return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 });
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
        tourId: tourId || null,
        preferredCountry: preferredCountry || 'Tanzania',
        adultsCount: adultsCount || 2,
        childrenCount: childrenCount || 0,
        budgetPerPersonUsd: budgetPerPersonUsd || 2000,
        comfortPreference: comfortPreference || 'MID_RANGE',
        customNotes: customNotes || null,
        isBroadcast: true,
        status: 'ROUTED',
      },
    });

    // 3. Dispatch lead to top verified operators matching the country
    const targetOperators = await prisma.operator.findMany({
      where: {
        isVerified: true,
      },
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
