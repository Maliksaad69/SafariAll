import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { parseTalaData, serializeTalaData } from '@/lib/tala-verification';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = await getSession();

    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Website owner / Admin privilege required.' }, { status: 403 });
    }

    const body = await req.json();
    const { operatorId, action, isVerified: rawIsVerified, note } = body;

    if (!operatorId) {
      return NextResponse.json({ error: 'Missing operatorId.' }, { status: 400 });
    }

    const operator = await prisma.operator.findUnique({
      where: { id: operatorId },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
      },
    });

    if (!operator) {
      return NextResponse.json({ error: 'Operator not found.' }, { status: 404 });
    }

    // Determine intent from action or legacy boolean
    let shouldVerify = false;
    let newStatus: 'APPROVED' | 'REJECTED' | 'REVOKED' = 'REJECTED';

    if (action === 'APPROVE' || rawIsVerified === true) {
      shouldVerify = true;
      newStatus = 'APPROVED';
    } else if (action === 'REVOKE') {
      shouldVerify = false;
      newStatus = 'REVOKED';
    } else {
      // REJECT or rawIsVerified === false
      shouldVerify = false;
      newStatus = 'REJECTED';
    }

    const currentTalaData = parseTalaData(
      operator.serviceSummary,
      operator.registrationNumber,
      operator.licenseDocumentUrl,
      operator.isVerified
    );

    const updatedTalaData = {
      ...currentTalaData,
      status: newStatus,
      reviewNotes: note?.trim() || (shouldVerify ? 'Verified & approved by website owner.' : 'Action required: Document rejected or requires resubmission.'),
      reviewedAt: new Date().toISOString(),
      reviewedBy: session.name || 'Website Owner',
    };

    const serializedSummary = serializeTalaData(updatedTalaData);

    const updatedOperator = await prisma.operator.update({
      where: { id: operatorId },
      data: {
        isVerified: shouldVerify,
        verificationDate: shouldVerify ? new Date() : null,
        serviceSummary: serializedSummary,
      },
      select: {
        id: true,
        companyName: true,
        countryOfOrigin: true,
        registrationNumber: true,
        licenseDocumentUrl: true,
        isVerified: true,
        verificationDate: true,
        serviceSummary: true,
        averageRating: true,
        totalReviews: true,
      },
    });

    // Notify agency about owner's decision
    if (operator.userId) {
      try {
        const notifTitle = shouldVerify
          ? 'TALA License Approved & Verified!'
          : newStatus === 'REVOKED'
          ? 'Verification Status Revoked'
          : 'TALA Document Requires Attention';

        const notifBody = shouldVerify
          ? `Your TALA license has been verified by the website owner. Your agency is now displayed with the Verified Agency trust badge.${note ? ` Owner note: "${note}"` : ''}`
          : newStatus === 'REVOKED'
          ? `Your verification status was revoked by the platform owner.${note ? ` Reason: "${note}"` : ''}`
          : `The website owner reviewed your TALA document and requested changes: "${note || 'Document unreadable or invalid'}". Please visit your verification page to re-upload.`;

        await prisma.notification.create({
          data: {
            userId: operator.userId,
            type: shouldVerify ? 'INFO' : 'INFO',
            title: notifTitle,
            body: notifBody,
            link: shouldVerify ? '/operator-portal' : '/operator-portal/verification',
          },
        });
      } catch (notifErr) {
        console.warn('Could not dispatch agency notification:', notifErr);
      }
    }

    return NextResponse.json({
      success: true,
      operator: updatedOperator,
      talaData: updatedTalaData,
    });
  } catch (error: any) {
    console.error('Error updating operator verification:', error);
    return NextResponse.json({ error: error.message || 'Internal server error.' }, { status: 500 });
  }
}
