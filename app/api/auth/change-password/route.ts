import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { profiles } from '@/db/schema/auth';
import { eq } from 'drizzle-orm';
import { hash } from 'bcrypt';
import { z } from 'zod';
import { requireAuthApp } from '@/lib/auth-helpers-app';

// Validation schema for password change
const changePasswordSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

/**
 * POST /api/auth/change-password
 * Changes the password for the currently authenticated user
 * Body: { newPassword: string, confirmPassword: string }
 */
export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const { session, errorResponse } = await requireAuthApp();
    if (errorResponse) return errorResponse;

    // Parse request body
    const body = await request.json();

    // Validate request body
    const validationResult = changePasswordSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation error',
          message: 'Invalid password data',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { newPassword, confirmPassword } = validationResult.data;

    // Verify passwords match
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        {
          error: 'Validation error',
          message: 'Passwords do not match',
        },
        { status: 400 }
      );
    }

    // Hash the new password
    const passwordHash = await hash(newPassword, 12);

    // Update user's password
    if (session) {
      await db
        .update(profiles)
        .set({
          passwordHash,
          updatedAt: new Date(),
        })
        .where(eq(profiles.id, session.user.id));
    }

    return NextResponse.json({
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to change password',
      },
      { status: 500 }
    );
  }
}
