// API route to reset password using token
import { NextRequest, NextResponse } from 'next/server';
import { db, profiles, passwordResetTokens } from '@/db';
import { eq, and, gt } from 'drizzle-orm';
import { z } from 'zod';
import { hash } from 'bcrypt';
import crypto from 'crypto';

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters'),
});

/**
 * Hash a token using SHA-256
 */
function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Validate password complexity (optional - can be enhanced)
 */
function validatePasswordComplexity(password: string): { valid: boolean; message?: string } {
  // Basic validation - can be enhanced with more rules
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }

  if (password.length > 100) {
    return { valid: false, message: 'Password must be less than 100 characters' };
  }

  // Optional: Check for common passwords (simple check)
  const commonPasswords = ['password', '12345678', 'qwerty123', 'password123'];
  if (commonPasswords.includes(password.toLowerCase())) {
    return { valid: false, message: 'Password is too common. Please choose a stronger password.' };
  }

  return { valid: true };
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input
    const { token, newPassword } = resetPasswordSchema.parse(body);

    // Additional password validation
    const passwordValidation = validatePasswordComplexity(newPassword);
    if (!passwordValidation.valid) {
      return NextResponse.json({ error: passwordValidation.message }, { status: 400 });
    }

    // Hash the token to look it up in database
    const tokenHash = hashToken(token);

    // Find valid token (not used, not expired)
    const [resetToken] = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.tokenHash, tokenHash),
          eq(passwordResetTokens.used, false),
          gt(passwordResetTokens.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!resetToken) {
      return NextResponse.json({
        error: 'Invalid or expired token. Please request a new password reset link.',
      }, { status: 400 });
    }

    // Find user
    const [user] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, resetToken.userId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Hash new password with bcrypt (cost factor 12)
    const passwordHash = await hash(newPassword, 12);

    // Update user's password
    await db
      .update(profiles)
      .set({
        passwordHash,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, user.id));

    // Mark token as used
    await db
      .update(passwordResetTokens)
      .set({
        used: true,
        usedAt: new Date(),
      })
      .where(eq(passwordResetTokens.id, resetToken.id));

    // Optional: Invalidate all other tokens for this user (extra security)
    await db
      .update(passwordResetTokens)
      .set({
        used: true,
        usedAt: new Date(),
      })
      .where(
        and(
          eq(passwordResetTokens.userId, user.id),
          eq(passwordResetTokens.used, false)
        )
      );

    console.log(`Password reset successful for user: ${user.email}`);

    return NextResponse.json({
      message: 'Password reset successful. You can now log in with your new password.',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Invalid input',
        details: error.errors,
      }, { status: 400 });
    }

    console.error('Password reset error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
