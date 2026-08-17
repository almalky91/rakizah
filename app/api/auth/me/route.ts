import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/db';
import { profiles, userRoles } from '@/db/schema/auth';
import { eq } from 'drizzle-orm';

/**
 * GET /api/auth/me
 * Returns the current authenticated user's profile and role information
 * 
 * Validates: Requirements 4.7, 7.5
 * - 4.7: Session management and user profile retrieval
 * - 7.5: Role-based access control information
 */
export async function GET(request: NextRequest) {
  try {
    // Get current session using NextAuth
    const session = await getServerSession(authOptions);

    // Return 401 if user is not authenticated
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Query database for full user profile
    const [userProfile] = await db
      .select({
        id: profiles.id,
        email: profiles.email,
        fullName: profiles.fullName,
        bio: profiles.bio,
        phoneNumber: profiles.phoneNumber,
        schoolName: profiles.schoolName,
        publicSlug: profiles.publicSlug,
        pageTitle: profiles.pageTitle,
        pageTemplate: profiles.pageTemplate,
        subscriptionActive: profiles.subscriptionActive,
        subscriptionEndsAt: profiles.subscriptionEndsAt,
        trialEndsAt: profiles.trialEndsAt,
        // createdAt: profiles.createdAt,
        updatedAt: profiles.updatedAt,
      })
      .from(profiles)
      .where(eq(profiles.id, session.user.id))
      .limit(1);

    // If profile not found (should not happen if session is valid)
    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Query user role from database
    const [roleData] = await db
      .select({
        role: userRoles.role,
      })
      .from(userRoles)
      .where(eq(userRoles.userId, session.user.id))
      .limit(1);

    // Return user profile with role information
    return NextResponse.json({
      data: {
        ...userProfile,
        role: roleData?.role || session.user.role || 'student',
      },
    });
  } catch (error) {
    // Log error for debugging
    console.error('Error fetching current user info:', error);

    // Return generic server error
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
