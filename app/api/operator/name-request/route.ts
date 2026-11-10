import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { parseNameRequest, serializeNameRequest } from '@/lib/name-requests';

export const dynamic = 'force-dynamic';

async function resolveCurrentOperator(session: { operatorId?: string; userId: string; role: string }) {
  if (session.operatorId) {
    return prisma.operator.findUnique({
      where: { id: session.operatorId },
      include: { user: { select: { email: true, firstName: true, lastName: true } } },
    });
  }

  return prisma.operator.findUnique({
    where: { userId: session.userId },
    include: { user: { select: { email: true, firstName: true, lastName: true } } },
  });
}

/**
 * GET /api/operator/name-request
 * Retrieve the active name change request for the logged-in tour operator.
 */
export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'OPERATOR' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Operator authorization required.' }, { status: 401 });
    }

    const operator = await resolveCurrentOperator(session);
    if (!operator) {
      return NextResponse.json({ error: 'Operator profile not found.' }, { status: 404 });
    }

    const nameRequest = parseNameRequest(operator.serviceSummary);

    return NextResponse.json({
      success: true,
      currentName: operator.companyName,
      nameRequest,
    });
  } catch (error: any) {
    console.error('Error fetching name request:', error);
    return NextResponse.json({ error: error.message || 'Internal server error.' }, { status: 500 });
  }
}

/**
 * POST /api/operator/name-request
 * Submit a request to rename the tour agency.
 * An admin/owner must approve the request before the company name changes.
 */
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'OPERATOR' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Operator authorization required.' }, { status: 401 });
    }

    const operator = await resolveCurrentOperator(session);
    if (!operator) {
      return NextResponse.json({ error: 'Operator profile not found.' }, { status: 404 });
    }

    const body = await req.json();
    const requestedName = typeof body.requestedName === 'string' ? body.requestedName.trim() : '';
    const reason = typeof body.reason === 'string' ? body.reason.trim() : '';

    if (!requestedName || requestedName.length < 2) {
      return NextResponse.json(
        { error: 'Please enter a valid company name (minimum 2 characters).' },
        { status: 400 }
      );
    }

    if (requestedName.length > 100) {
      return NextResponse.json(
        { error: 'Company name is too long (maximum 100 characters).' },
        { status: 400 }
      );
    }

    if (requestedName.toLowerCase() === operator.companyName.trim().toLowerCase()) {
      return NextResponse.json(
        { error: 'The requested name is identical to your current company name.' },
        { status: 400 }
      );
    }

    // Check if the requested name is already registered by another agency
    const nameCollision = await prisma.operator.findFirst({
      where: {
        companyName: { equals: requestedName, mode: 'insensitive' },
        id: { not: operator.id },
      },
    });

    if (nameCollision) {
      return NextResponse.json(
        { error: `The name "${requestedName}" is already registered by another tour operator on SafariRequest.` },
        { status: 400 }
      );
    }

    const newRequest = {
      requestedName,
      reason: reason || undefined,
      submittedAt: new Date().toISOString(),
      status: 'PENDING' as const,
      previousName: operator.companyName,
    };

    const updatedSummary = serializeNameRequest(newRequest, operator.serviceSummary);

    await prisma.operator.update({
      where: { id: operator.id },
      data: { serviceSummary: updatedSummary },
    });

    return NextResponse.json({
      success: true,
      message: `Your request to rename your agency to "${requestedName}" has been submitted for platform owner approval.`,
      nameRequest: newRequest,
      currentName: operator.companyName,
    });
  } catch (error: any) {
    console.error('Error submitting name request:', error);
    return NextResponse.json({ error: error.message || 'Internal server error.' }, { status: 500 });
  }
}

/**
 * DELETE /api/operator/name-request
 * Cancel a pending name change request.
 */
export async function DELETE() {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'OPERATOR' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Operator authorization required.' }, { status: 401 });
    }

    const operator = await resolveCurrentOperator(session);
    if (!operator) {
      return NextResponse.json({ error: 'Operator profile not found.' }, { status: 404 });
    }

    const currentReq = parseNameRequest(operator.serviceSummary);
    if (!currentReq || currentReq.status !== 'PENDING') {
      return NextResponse.json({ error: 'No pending name change request to cancel.' }, { status: 400 });
    }

    const cancelledReq = {
      ...currentReq,
      status: 'CANCELLED' as const,
    };

    const updatedSummary = serializeNameRequest(cancelledReq, operator.serviceSummary);

    await prisma.operator.update({
      where: { id: operator.id },
      data: { serviceSummary: updatedSummary },
    });

    return NextResponse.json({
      success: true,
      message: 'Name change request has been cancelled.',
    });
  } catch (error: any) {
    console.error('Error cancelling name request:', error);
    return NextResponse.json({ error: error.message || 'Internal server error.' }, { status: 500 });
  }
}
