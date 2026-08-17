import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { Session } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * Authorization helper functions for Next.js App Router API routes
 * These functions integrate with NextAuth to enforce authentication and authorization rules
 * 
 * Note: These are App Router adaptations of the auth-helpers.ts functions.
 * They work with NextRequest/NextResponse instead of NextApiRequest/NextApiResponse.
 */

/**
 * Requires authentication for an App Router API route
 * Returns the session if valid, or an error response if unauthorized
 * 
 * @returns Object with either session or errorResponse
 * 
 * @example
 * const { session, errorResponse } = await requireAuthApp();
 * if (errorResponse) return errorResponse;
 * // Continue with authenticated logic using session
 */
export async function requireAuthApp(): Promise<{
  session: Session | null;
  errorResponse: NextResponse | null;
}> {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return {
      session: null,
      errorResponse: NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      ),
    };
  }

  return { session, errorResponse: null };
}

/**
 * Requires user to have one of the allowed roles
 * Returns the session if user has required role, or an error response if forbidden
 * 
 * @param allowedRoles - Array of role strings that are permitted (e.g., ['admin', 'teacher'])
 * @returns Object with either session or errorResponse
 * 
 * @example
 * const { session, errorResponse } = await requireRoleApp(['admin', 'teacher']);
 * if (errorResponse) return errorResponse;
 * // Continue with role-authorized logic using session
 */
export async function requireRoleApp(
  allowedRoles: string[]
): Promise<{
  session: Session | null;
  errorResponse: NextResponse | null;
}> {
  const { session, errorResponse } = await requireAuthApp();

  if (errorResponse) {
    return { session: null, errorResponse };
  }

  if (!session || !allowedRoles.includes(session.user.role)) {
    return {
      session: null,
      errorResponse: NextResponse.json(
        {
          error: 'Forbidden: Insufficient permissions',
          required: allowedRoles,
          current: session?.user.role || 'none',
        },
        { status: 403 }
      ),
    };
  }

  return { session, errorResponse: null };
}

/**
 * Requires user to be the owner of a resource
 * Admins automatically bypass ownership checks
 * Returns the session if user owns the resource or is admin, or an error response if forbidden
 * 
 * @param resourceOwnerId - The user ID that owns the resource being accessed
 * @returns Object with either session or errorResponse
 * 
 * @example
 * const quiz = await db.select().from(quizzes).where(eq(quizzes.id, quizId));
 * const { session, errorResponse } = await requireOwnershipApp(quiz.teacherId);
 * if (errorResponse) return errorResponse;
 * // Continue with ownership-authorized logic (update/delete) using session
 */
export async function requireOwnershipApp(
  resourceOwnerId: string
): Promise<{
  session: Session | null;
  errorResponse: NextResponse | null;
}> {
  const { session, errorResponse } = await requireAuthApp();

  if (errorResponse) {
    return { session: null, errorResponse };
  }

  if (!session) {
    return {
      session: null,
      errorResponse: NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      ),
    };
  }

  // Admins can access any resource
  if (session.user.role === 'admin') {
    return { session, errorResponse: null };
  }

  // Check if user owns the resource
  if (session.user.id !== resourceOwnerId) {
    return {
      session: null,
      errorResponse: NextResponse.json(
        { error: 'Forbidden: You do not own this resource' },
        { status: 403 }
      ),
    };
  }

  return { session, errorResponse: null };
}
