import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getSession();

    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin privilege required.' }, { status: 403 });
    }

    const body = await req.json();
    const { operatorId, isVerified } = body;

    if (!operatorId || typeof isVerified !== 'boolean') {
      return NextResponse.json({ error: 'Missing required parameters (operatorId, isVerified).' }, { status: 400 });
    }

    const updatedOperator = await prisma.operator.update({
      where: { id: operatorId },
      data: {
        isVerified,
        verificationDate: isVerified ? new Date() : null,
      },
    });

    return NextResponse.json({ success: true, operator: updatedOperator });
  } catch (error: any) {
    console.error('Error updating operator verification:', error);
    return NextResponse.json({ error: error.message || 'Internal server error.' }, { status: 500 });
  }
}
