import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { profiles, userRoles } from '@/db/schema/auth';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { requireOwnershipApp, requireRoleApp } from '@/lib/auth-helpers-app';

// Validation schema for profile update
export const updateProfileSchema = z.object({
  subscriptionEndsAt: z.date().optional(),
  subscriptionActive: z.boolean().optional()
});
/**
 * PATCH /api/teachers/[id]/toggle-subscription
 * Updates a teacher's subscription status
 * Authorization: Admin or the teacher themselves
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const { errorResponse } = await requireRoleApp(['admin']);

    if (errorResponse) return errorResponse;

    // First, verify the profile exists
    const [existingProfile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, id))
      .limit(1);

    if (!existingProfile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Verify teacher has the teacher role
    const [roleData] = await db
      .select()
      .from(userRoles)
      .where(and(
        eq(userRoles.userId, id),
        eq(userRoles.role, 'teacher')
      ))
      .limit(1);

    if (!roleData) {
      return NextResponse.json(
        { error: 'User is not a teacher' },
        { status: 400 }
      );
    }

    // Check authorization (user must own the profile or be admin)
    const {
        errorResponse: ownershipErrorResponse
    } = await requireOwnershipApp(id);

    if (ownershipErrorResponse)
      return ownershipErrorResponse;

    // Parse and validate input data
    const body = await request.json();
    const validatedData = updateProfileSchema.parse(body);

    const now = new Date();
    const oneYearLater = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());


    // Update profile
    await db
      .update(profiles)
      .set({
        subscriptionActive: validatedData.subscriptionActive,
        subscriptionEndsAt: validatedData.subscriptionActive
            ? oneYearLater : null,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, id));

    // Fetch updated profile
    const [updatedProfile] = await db
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
      .where(eq(profiles.id, id))
      .limit(1);

    return NextResponse.json({
      data: updatedProfile,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid input',
          details: error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    console.error('Error updating subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
