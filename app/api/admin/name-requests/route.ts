import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { parseNameRequest, serializeNameRequest } from '@/lib/name-requests';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/name-requests
 * Fetch all tour agencies that have submitted name change requests.
 */
export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin privilege required.' }, { status: 403 });
    }

    const operators = await prisma.operator.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        companyName: true,
        slug: true,
        countryOfOrigin: true,
        registrationNumber: true,
        serviceSummary: true,
        isVerified: true,
        createdAt: true,
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        _count: {
          select: {
            tours: true,
            vehicles: true,
            reservations: true,
          },
        },
      },
    });

    const requests = operators
      .map((op) => {
        const nr = parseNameRequest(op.serviceSummary);
        if (!nr) return null;
        return {
          operatorId: op.id,
          currentCompanyName: op.companyName,
          slug: op.slug,
          countryOfOrigin: op.countryOfOrigin,
          registrationNumber: op.registrationNumber,
          isVerified: op.isVerified,
          user: op.user,
          _count: op._count,
          nameRequest: nr,
        };
      })
      .filter(Boolean);

    return NextResponse.json({
      success: true,
      requests,
      pendingCount: requests.filter((r) => r?.nameRequest.status === 'PENDING').length,
    });
  } catch (error: any) {
    console.error('Error fetching name requests for admin:', error);
    return NextResponse.json({ error: error.message || 'Internal server error.' }, { status: 500 });
  }
}

/**
 * POST /api/admin/name-requests
 * Approve or Decline a pending agency name change request.
 * Payload: { operatorId: string, action: 'APPROVE' | 'REJECT', note?: string }
 */
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin privilege required.' }, { status: 403 });
    }

    const body = await req.json();
    const { operatorId, action, note } = body;

    if (!operatorId || (action !== 'APPROVE' && action !== 'REJECT')) {
      return NextResponse.json({ error: 'Valid operatorId and action (APPROVE/REJECT) are required.' }, { status: 400 });
    }

    const operator = await prisma.operator.findUnique({
      where: { id: operatorId },
    });

    if (!operator) {
      return NextResponse.json({ error: 'Operator not found.' }, { status: 404 });
    }

    const currentReq = parseNameRequest(operator.serviceSummary);
    if (!currentReq) {
      return NextResponse.json({ error: 'No name change request found for this operator.' }, { status: 400 });
    }

    if (action === 'APPROVE') {
      const newName = currentReq.requestedName.trim();

      // Check collision
      const collision = await prisma.operator.findFirst({
        where: {
          companyName: { equals: newName, mode: 'insensitive' },
          id: { not: operator.id },
        },
      });

      if (collision) {
        return NextResponse.json(
          { error: `Cannot approve: "${newName}" is already taken by another registered operator.` },
          { status: 400 }
        );
      }

      const updatedRequest = {
        ...currentReq,
        status: 'APPROVED' as const,
        reviewedAt: new Date().toISOString(),
        reviewedBy: session.name || session.email || 'Admin',
        reviewNotes: note?.trim() || 'Approved by platform owner.',
        previousName: operator.companyName,
      };

      const updatedSummary = serializeNameRequest(updatedRequest, operator.serviceSummary);

      const updatedOperator = await prisma.operator.update({
        where: { id: operator.id },
        data: {
          companyName: newName,
          serviceSummary: updatedSummary,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Successfully approved name change for "${operator.companyName}" to "${newName}".`,
        operator: updatedOperator,
        nameRequest: updatedRequest,
      });
    } else {
      // REJECT
      const updatedRequest = {
        ...currentReq,
        status: 'REJECTED' as const,
        reviewedAt: new Date().toISOString(),
        reviewedBy: session.name || session.email || 'Admin',
        reviewNotes: note?.trim() || 'Declined by platform owner.',
      };

      const updatedSummary = serializeNameRequest(updatedRequest, operator.serviceSummary);

      const updatedOperator = await prisma.operator.update({
        where: { id: operator.id },
        data: { serviceSummary: updatedSummary },
      });

      return NextResponse.json({
        success: true,
        message: `Declined name change request for "${operator.companyName}".`,
        operator: updatedOperator,
        nameRequest: updatedRequest,
      });
    }
  } catch (error: any) {
    console.error('Error processing name request:', error);
    return NextResponse.json({ error: error.message || 'Internal server error.' }, { status: 500 });
  }
}
