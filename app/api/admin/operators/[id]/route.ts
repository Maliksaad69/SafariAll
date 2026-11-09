import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/operators/[id]
 * Fetch full operator details for admin editing.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin privilege required.' }, { status: 403 });
    }

    const { id } = await params;
    const operator = await prisma.operator.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true } },
        _count: { select: { tours: true, vehicles: true, reservations: true, reviews: true, blogPosts: true } },
      },
    });

    if (!operator) {
      return NextResponse.json({ error: 'Operator not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, operator });
  } catch (error: any) {
    console.error('Error fetching operator:', error);
    return NextResponse.json({ error: error.message || 'Internal server error.' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/operators/[id]
 * Edit ANY part of the tour agency profile and associated user account.
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin privilege required.' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.operator.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Operator not found.' }, { status: 404 });
    }

    // Check slug uniqueness if modified
    if (body.slug && body.slug !== existing.slug) {
      const slugConflict = await prisma.operator.findUnique({
        where: { slug: body.slug.trim().toLowerCase() },
      });
      if (slugConflict && slugConflict.id !== id) {
        return NextResponse.json({ error: `The URL slug "${body.slug}" is already in use by another agency.` }, { status: 400 });
      }
    }

    // Check user email uniqueness if modified
    if (body.email && existing.user && body.email.toLowerCase().trim() !== existing.user.email.toLowerCase().trim()) {
      const emailConflict = await prisma.user.findUnique({
        where: { email: body.email.toLowerCase().trim() },
      });
      if (emailConflict && emailConflict.id !== existing.userId) {
        return NextResponse.json({ error: `The email "${body.email}" is already registered to another user.` }, { status: 400 });
      }
    }

    // Update operator details
    const updatedOperator = await prisma.$transaction(async (tx) => {
      // 1. Update user account info if provided
      if (existing.userId && (body.firstName || body.lastName || body.email || body.phone !== undefined)) {
        await tx.user.update({
          where: { id: existing.userId },
          data: {
            ...(body.firstName && { firstName: body.firstName.trim() }),
            ...(body.lastName && { lastName: body.lastName.trim() }),
            ...(body.email && { email: body.email.toLowerCase().trim() }),
            ...(body.phone !== undefined && { phone: body.phone ? body.phone.trim() : null }),
          },
        });
      }

      // 2. Update operator profile
      const dataToUpdate: any = {};

      if (body.companyName !== undefined) dataToUpdate.companyName = body.companyName.trim();
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
          : existing.priceTier;
      }
      if (body.overviewText !== undefined) dataToUpdate.overviewText = body.overviewText?.trim() || null;
      if (body.registrationNumber !== undefined) dataToUpdate.registrationNumber = body.registrationNumber?.trim() || null;
      if (body.licenseDocumentUrl !== undefined) dataToUpdate.licenseDocumentUrl = body.licenseDocumentUrl?.trim() || null;
      if (body.logoUrl !== undefined) dataToUpdate.logoUrl = body.logoUrl?.trim() || null;
      if (body.bannerUrl !== undefined) dataToUpdate.bannerUrl = body.bannerUrl?.trim() || null;
      if (body.officesIn !== undefined) {
        dataToUpdate.officesIn = Array.isArray(body.officesIn) ? body.officesIn : [];
      }
      if (typeof body.isVerified === 'boolean') {
        dataToUpdate.isVerified = body.isVerified;
        if (body.isVerified && !existing.isVerified) {
          dataToUpdate.verificationDate = new Date();
        } else if (!body.isVerified && existing.isVerified) {
          dataToUpdate.verificationDate = null;
        }
      }

      return tx.operator.update({
        where: { id },
        data: dataToUpdate,
        include: {
          user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true } },
          _count: { select: { tours: true, vehicles: true, reservations: true, reviews: true, blogPosts: true } },
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Agency details successfully updated.',
      operator: updatedOperator,
    });
  } catch (error: any) {
    console.error('Error updating operator:', error);
    return NextResponse.json({ error: error.message || 'Internal server error.' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/operators/[id]
 * Permanently delete a tour agency and all associated packages, fleet, leads, and reservations.
 */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin privilege required.' }, { status: 403 });
    }

    const { id } = await params;

    const operator = await prisma.operator.findUnique({
      where: { id },
      include: {
        _count: { select: { tours: true, vehicles: true, reservations: true, blogPosts: true } },
      },
    });

    if (!operator) {
      return NextResponse.json({ error: 'Operator not found.' }, { status: 404 });
    }

    // Execute deletion in a transaction:
    // Delete operator (Prisma cascades will clean up tours, vehicles, reviews, reservations, blogPosts)
    // And downgrade associated user role to TRAVELER so user account remains intact if desired
    await prisma.$transaction(async (tx) => {
      await tx.operator.delete({
        where: { id },
      });

      if (operator.userId) {
        await tx.user.update({
          where: { id: operator.userId },
          data: { role: 'TRAVELER' },
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: `Agency "${operator.companyName}" and all associated data have been permanently deleted.`,
    });
  } catch (error: any) {
    console.error('Error deleting operator:', error);
    return NextResponse.json({ error: error.message || 'Internal server error.' }, { status: 500 });
  }
}
