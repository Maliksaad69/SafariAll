import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, createSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, phone, country, role, companyName, countryOfOrigin } = body;

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'First name, last name, email and password are required.' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email address already exists.' },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const userRole = role === 'OPERATOR' ? 'OPERATOR' : 'TRAVELER';

    // Transaction to create User (and Operator if applicable)
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: email.toLowerCase().trim(),
          passwordHash: hashedPassword,
          firstName,
          lastName,
          phone: phone || null,
          country: country || null,
          role: userRole,
          emailVerified: true, // Auto-verify for demo
        },
      });

      let operatorRecord = null;
      if (userRole === 'OPERATOR') {
        const slug = (companyName || `${firstName}-${lastName}-safaris`)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

        operatorRecord = await tx.operator.create({
          data: {
            userId: user.id,
            companyName: companyName || `${firstName}'s Safari Company`,
            slug: `${slug}-${Math.floor(1000 + Math.random() * 9000)}`,
            countryOfOrigin: countryOfOrigin || country || 'Tanzania',
            isVerified: false, // Pending admin approval
          },
        });
      }

      return { user, operator: operatorRecord };
    });

    const sessionPayload = {
      userId: newUser.user.id,
      email: newUser.user.email,
      name: `${newUser.user.firstName} ${newUser.user.lastName}`,
      role: newUser.user.role,
      ...(newUser.operator && {
        operatorId: newUser.operator.id,
        companyName: newUser.operator.companyName,
      }),
    };

    await createSession(sessionPayload);

    return NextResponse.json({
      success: true,
      user: sessionPayload,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Registration Error:', error);
    return NextResponse.json(
      { error: 'Failed to create account. Please try again.' },
      { status: 500 }
    );
  }
}
