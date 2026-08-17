// API route to request password reset
import { NextRequest, NextResponse } from 'next/server';
import { db, profiles, passwordResetTokens } from '@/db';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { v7 as uuidv7 } from 'uuid';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email-service';

const requestResetSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// Rate limiting store (in-memory, use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

/**
 * Check rate limit for password reset requests
 * Limit: 3 requests per email per hour
 */
function checkRateLimit(email: string): boolean {
  const now = Date.now();
  const limit = rateLimitStore.get(email);

  if (!limit || now > limit.resetAt) {
    // Reset or initialize
    rateLimitStore.set(email, {
      count: 1,
      resetAt: now + 60 * 60 * 1000, // 1 hour
    });
    return true;
  }

  if (limit.count >= 3) {
    return false; // Rate limit exceeded
  }

  limit.count++;
  return true;
}

/**
 * Generate a secure random token
 */
function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Hash a token using SHA-256
 */
function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input
    const { email } = requestResetSchema.parse(body);

    // Check rate limit
    if (!checkRateLimit(email)) {
      // Return success message even if rate limited (security: don't reveal rate limit status)
      return NextResponse.json({
        message: 'If an account exists with this email, a password reset link has been sent.',
      });
    }

    // Find user by email
    const [user] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.email, email))
      .limit(1);

    // Always return success message (security: don't reveal if email exists)
    const successMessage = 'If an account exists with this email, a password reset link has been sent.';

    if (!user) {
      // User not found, but don't reveal this
      return NextResponse.json({ message: successMessage });
    }

    // Generate secure token
    const plainToken = generateSecureToken();
    const tokenHash = hashToken(plainToken);

    // Store token in database
    const tokenId = uuidv7();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await db.insert(passwordResetTokens).values({
      id: tokenId,
      userId: user.id,
      tokenHash,
      expiresAt,
      used: false,
    });

    // Generate reset link
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const resetLink = `${baseUrl}/reset-password?token=${plainToken}`;

    // Send password reset email
    try {
      await sendPasswordResetEmail({
        email: user.email!,
        name: user.fullName || 'User',
        resetLink,
      });
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Continue anyway - token is created, user might retry
    }

    return NextResponse.json({ message: successMessage });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Invalid input',
        details: error.errors,
      }, { status: 400 });
    }

    console.error('Password reset request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
