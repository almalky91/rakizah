import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { profiles, userRoles } from '@/db/schema/auth';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { requireOwnershipApp } from '@/lib/auth-helpers-app';

/**
 * Student Profile Management API Route
 * 
 * GET /api/students/[id]
 * Retrieve a specific student's profile by ID
 * Authorization: Admin, Teacher, or the student themselves
 * 
 * PUT /api/students/[id]
 * Update a student's profile
 * Authorization: Admin, Teacher, or the student themselves
 * 
 * DELETE /api/students/[id]
 * Delete a student's profile
 * Authorization: Admin only
 * 
 * Requirements: 15.5, 15.6 (Student profile management)
 */

// Validation schema for profile update
const updateProfileSchema = z.object({
  email: z.string().email('Invalid email address').max(255, 'Email must be at most 255 characters').optional(),
  fullName: z.string().min(2, 'Full name must be at least 2 characters').optional(),
  bio: z.string().max(1000, 'Bio must be at most 1000 characters').optional(),
  phoneNumber: z.string().max(20, 'Phone number must be at most 20 characters').optional(),
  schoolName: z.string().max(255, 'School name must be at most 255 characters').optional(),
});

/**
 * GET /api/students/[id]
 * Retrieves a student's profile by ID
 * Authorization: Admin, Teacher, or the student themselves
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    // Check authorization (user must own the profile, be a teacher, or be an admin)
    const { session, errorResponse } = await requireOwnershipApp(id);
    if (errorResponse) {
      return errorResponse;
    }

    // Verify that the user exists and has the student role
    const [student] = await db
      .select({
        id: profiles.id,
        email: profiles.email,
        fullName: profiles.fullName,
        bio: profiles.bio,
        phoneNumber: profiles.phoneNumber,
        schoolName: profiles.schoolName,
        // createdAt: profiles.createdAt,
        updatedAt: profiles.updatedAt,
      })
      .from(profiles)
      .where(eq(profiles.id, id))
      .limit(1);

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Verify student has the student role
    const [roleData] = await db
      .select()
      .from(userRoles)
      .where(and(
        eq(userRoles.userId, id),
        eq(userRoles.role, 'student')
      ))
      .limit(1);

    if (!roleData) {
      return NextResponse.json(
        { error: 'User is not a student' },
        { status: 400 }
      );
    }

    return NextResponse.json({ data: student });
  } catch (error) {
    console.error('Error fetching student:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/students/[id]
 * Updates a student's profile
 * Authorization: Admin, Teacher, or the student themselves
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
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

    // Verify student has the student role
    const [roleData] = await db
      .select()
      .from(userRoles)
      .where(and(
        eq(userRoles.userId, id),
        eq(userRoles.role, 'student')
      ))
      .limit(1);

    if (!roleData) {
      return NextResponse.json(
        { error: 'User is not a student' },
        { status: 400 }
      );
    }

    // Check authorization (user must own the profile, be a teacher, or be an admin)
    const { session, errorResponse } = await requireOwnershipApp(id);
    if (errorResponse) {
      return errorResponse;
    }

    // Parse and validate input data
    const body = await request.json();
    const validatedData = updateProfileSchema.parse(body);

    // Check if email is being updated and if it's already taken
    if (validatedData.email && validatedData.email !== existingProfile.email) {
      const [existingEmail] = await db
        .select()
        .from(profiles)
        .where(eq(profiles.email, validatedData.email))
        .limit(1);

      if (existingEmail) {
        return NextResponse.json(
          { error: 'Email already taken' },
          { status: 400 }
        );
      }
    }

    // Update profile
    await db
      .update(profiles)
      .set({
        ...validatedData,
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

    console.error('Error updating student profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/students/[id]
 * Deletes a student's profile
 * Authorization: Admin only
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    // Check authorization (user must own the profile, be a teacher, or be an admin)
    const { session, errorResponse } = await requireOwnershipApp(id);
    if (errorResponse) {
      return errorResponse;
    }

    // Additional check: only admins can delete
    if (session && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Only admins can delete student profiles' },
        { status: 403 }
      );
    }

    // Verify the profile exists and is a student
    const [student] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, id))
      .limit(1);

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Verify student has the student role
    const [roleData] = await db
      .select()
      .from(userRoles)
      .where(and(
        eq(userRoles.userId, id),
        eq(userRoles.role, 'student')
      ))
      .limit(1);

    if (!roleData) {
      return NextResponse.json(
        { error: 'User is not a student' },
        { status: 400 }
      );
    }

    // Delete the profile (cascade will handle related data)
    await db.delete(profiles).where(eq(profiles.id, id));

    return NextResponse.json({
      message: 'Student profile deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting student profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
