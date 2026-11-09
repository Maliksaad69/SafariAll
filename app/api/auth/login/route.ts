import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword, hashPassword, createSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const envAdminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
    const envAdminPassword = process.env.ADMIN_PASSWORD;

    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { operator: true },
    });

    const isEnvAdminMatch = Boolean(
      envAdminEmail &&
      envAdminPassword &&
      normalizedEmail === envAdminEmail &&
      password === envAdminPassword
    );

    if (isEnvAdminMatch) {
      if (!user) {
        // Provision the platform admin user if not present in the database
        user = await prisma.user.create({
          data: {
            email: normalizedEmail,
            passwordHash: await hashPassword(password),
            firstName: 'System',
            lastName: 'Admin',
            role: 'ADMIN',
            emailVerified: true,
            country: 'Kenya',
          },
          include: { operator: true },
        });
      } else {
        // Ensure user has ADMIN role and sync password hash if needed
        const isValid = await verifyPassword(password, user.passwordHash);
        if (user.role !== 'ADMIN' || !isValid) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              role: 'ADMIN',
              passwordHash: await hashPassword(password),
              emailVerified: true,
            },
            include: { operator: true },
          });
        }
      }
    } else {
      if (!user) {
        return NextResponse.json(
          { error: 'Invalid email or password.' },
          { status: 401 }
        );
      }

      const isValid = await verifyPassword(password, user.passwordHash);
      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid email or password.' },
          { status: 401 }
        );
      }
    }

    const sessionPayload = {
      userId: user.id,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      role: user.role,
      ...(user.operator && {
        operatorId: user.operator.id,
        companyName: user.operator.companyName,
      }),
    };

    await createSession(sessionPayload);

    return NextResponse.json({
      success: true,
      user: sessionPayload,
    });
  } catch (error: any) {
    console.error('Login Error:', error);
    return NextResponse.json(
      { error: 'Failed to sign in. Please try again.' },
      { status: 500 }
    );
  }
}
