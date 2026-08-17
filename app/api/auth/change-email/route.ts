import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { profiles } from '@/db/schema/auth';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { requireAuthApp } from '@/lib/auth-helpers-app';

// Validation schema for email change
const changeEmailSchema = z.object({
  newEmail: z.string().email('Invalid email address').max(255, 'Email must be at most 255 characters'),
});

/**
 * POST /api/auth/change-email
 * Changes the email for the currently authenticated user
 * Body: { newEmail: string }
 * 
 * Note: In a production environment, this should send a verification email
 * to the new address and only update after confirmation.
 */
export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const { session, errorResponse } = await requireAuthApp();
    if (errorResponse) return errorResponse;

    // Parse request body
    const body = await request.json();

    // Validate request body
    const validationResult = changeEmailSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation error',
          message: 'Invalid email data',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { newEmail } = validationResult.data;

    // Check if email is already in use by another user
    const [existingUser] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.email, newEmail))
      .limit(1);

    if (existingUser && session && existingUser.id !== session.user.id) {
      return NextResponse.json(
        {
          error: 'Email already in use',
          message: 'This email is already registered to another account',
        },
        { status: 400 }
      );
    }

    // Update user's email
    if (session) {
      await db
        .update(profiles)
        .set({
          email: newEmail,
          updatedAt: new Date(),
        })
        .where(eq(profiles.id, session.user.id));
    }

    return NextResponse.json({
      message: 'Email updated successfully',
      data: { email: newEmail },
    });
  } catch (error) {
    console.error('Error changing email:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to change email',
      },
      { status: 500 }
    );
  }
}
