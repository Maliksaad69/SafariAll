import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

async function resolveCurrentOperator(session: { operatorId?: string; userId: string; role: string }) {
  if (session.operatorId) {
    return prisma.operator.findUnique({
      where: { id: session.operatorId },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true } },
        _count: { select: { tours: true, vehicles: true, reservations: true, reviews: true, blogPosts: true } },
      },
    });
  }

  return prisma.operator.findUnique({
    where: { userId: session.userId },
    include: {
      user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true } },
      _count: { select: { tours: true, vehicles: true, reservations: true, reviews: true, blogPosts: true } },
    },
  });
}

/**
 * GET /api/operator/profile
 * Fetch the logged-in operator's full profile details.
 */
export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'OPERATOR' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Agency authentication required.' }, { status: 401 });
    }

    const operator = await resolveCurrentOperator(session);
    if (!operator) {
      return NextResponse.json({ error: 'Agency profile not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, operator });
  } catch (error: any) {
    console.error('Error fetching operator profile:', error);
    return NextResponse.json({ error: error.message || 'Internal server error.' }, { status: 500 });
  }
}

/**
 * PATCH /api/operator/profile
 * Update any part of the agency profile (name, address, story, branding, contact info, etc.).
 */
export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'OPERATOR' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Agency authentication required.' }, { status: 401 });
    }

    const operator = await resolveCurrentOperator(session);
    if (!operator) {
      return NextResponse.json({ error: 'Agency profile not found.' }, { status: 404 });
    }

    const body = await req.json();

    // Check slug conflict if altered
    if (body.slug && body.slug !== operator.slug) {
      const slugConflict = await prisma.operator.findUnique({
        where: { slug: body.slug.trim().toLowerCase() },
      });
      if (slugConflict && slugConflict.id !== operator.id) {
        return NextResponse.json({ error: `The URL slug "${body.slug}" is already taken.` }, { status: 400 });
      }
    }

    // Execute updates
    const updated = await prisma.$transaction(async (tx) => {
      // 1. Update contact user details if provided
      if (operator.userId && (body.firstName || body.lastName || body.phone !== undefined)) {
        await tx.user.update({
          where: { id: operator.userId },
          data: {
            ...(body.firstName && { firstName: body.firstName.trim() }),
            ...(body.lastName && { lastName: body.lastName.trim() }),
            ...(body.phone !== undefined && { phone: body.phone ? body.phone.trim() : null }),
          },
        });
      }

      // 2. Prevent unauthorized company name change for operators
      if (body.companyName !== undefined && body.companyName.trim() !== operator.companyName.trim()) {
        if (session.role !== 'ADMIN') {
          return NextResponse.json(
            {
              error: 'Direct company name modification is restricted. Please submit a Name Change Request from your Agency Settings page for admin review and approval.',
            },
            { status: 403 }
          );
        }
      }

      // 3. Update operator profile
      const dataToUpdate: any = {};
      if (session.role === 'ADMIN' && body.companyName !== undefined) {
        dataToUpdate.companyName = body.companyName.trim();
      }
      if (body.slug !== undefined) dataToUpdate.slug = body.slug.trim().toLowerCase();
      if (body.countryOfOrigin !== undefined) dataToUpdate.countryOfOrigin = body.countryOfOrigin.trim();
      if (body.headquartersAddress !== undefined) dataToUpdate.headquartersAddress = body.headquartersAddress?.trim() || null;
      if (body.yearEstablished !== undefined) {
        const year = parseInt(body.yearEstablished, 10);
        dataToUpdate.yearEstablished = isNaN(year) ? null : year;
      }
      if (body.priceTier !== undefined) {
        dataToUpdate.priceTier = ['CAMPING', 'BUDGET', 'MID_RANGE', 'LUXURY', 'SUPER_LUXURY'].includes(body.priceTier)
          ? body.priceTier
          : operator.priceTier;
      }
      if (body.overviewText !== undefined) dataToUpdate.overviewText = body.overviewText?.trim() || null;
      if (body.logoUrl !== undefined) dataToUpdate.logoUrl = body.logoUrl?.trim() || null;
      if (body.bannerUrl !== undefined) dataToUpdate.bannerUrl = body.bannerUrl?.trim() || null;
      if (body.officesIn !== undefined) {
        dataToUpdate.officesIn = Array.isArray(body.officesIn) ? body.officesIn : [];
      }

      return tx.operator.update({
        where: { id: operator.id },
        data: dataToUpdate,
        include: {
          user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true } },
          _count: { select: { tours: true, vehicles: true, reservations: true, reviews: true, blogPosts: true } },
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Your agency profile has been successfully updated.',
      operator: updated,
    });
  } catch (error: any) {
    console.error('Error updating operator profile:', error);
    return NextResponse.json({ error: error.message || 'Internal server error.' }, { status: 500 });
  }
}

/**
 * DELETE /api/operator/profile
 * Allows the tour agency to delete their agency account, packages, fleet, and listings.
 */
export async function DELETE() {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'OPERATOR' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Agency authentication required.' }, { status: 401 });
    }

    const operator = await resolveCurrentOperator(session);
    if (!operator) {
      return NextResponse.json({ error: 'Agency profile not found.' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      // Delete operator and cascade
      await tx.operator.delete({
        where: { id: operator.id },
      });

      // Downgrade user role to TRAVELER
      if (operator.userId) {
        await tx.user.update({
          where: { id: operator.userId },
          data: { role: 'TRAVELER' },
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Your agency profile has been permanently deleted.',
    });
  } catch (error: any) {
    console.error('Error deleting agency profile:', error);
    return NextResponse.json({ error: error.message || 'Internal server error.' }, { status: 500 });
  }
}
