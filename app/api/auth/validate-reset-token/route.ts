// API route to validate a password reset token
import { NextRequest, NextResponse } from 'next/server';
import { db, profiles, passwordResetTokens } from '@/db';
import { eq, and, gt } from 'drizzle-orm';
import crypto from 'crypto';

/**
 * Hash a token using SHA-256
 */
function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function GET(request: NextRequest) {
  try {
    // Get token from query parameters
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token || typeof token !== 'string') {
      return NextResponse.json({
        valid: false,
        error: 'Token is required',
      }, { status: 400 });
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
        valid: false,
        error: 'Invalid or expired token',
      });
    }

    // Get user email for display (optional)
    const [user] = await db
      .select({ email: profiles.email })
      .from(profiles)
      .where(eq(profiles.id, resetToken.userId))
      .limit(1);

    return NextResponse.json({
      valid: true,
      email: user?.email || '',
    });
  } catch (error) {
    console.error('Token validation error:', error);
    return NextResponse.json({
      valid: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}
