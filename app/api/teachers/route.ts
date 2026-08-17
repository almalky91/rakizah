import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { profiles, userRoles } from '@/db/schema/auth';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { hash } from 'bcrypt';
import { v7 as uuidv7 } from 'uuid';
import { requireRoleApp } from '@/lib/auth-helpers-app';

/**
 * Teachers List API Route
 * 
 * GET /api/teachers
 * Retrieve all users with the teacher role
 * Authorization: Admin-only access
 * 
 * POST /api/teachers
 * Create a new teacher profile
 * Authorization: Admin-only access
 * 
 * Requirements: 15.4 (Teacher API routes migration)
 * 
 * Response includes teacher profile information:
 * - id
 * - email
 * - fullName
 * - bio
 * - phoneNumber
 * - schoolName
 * - publicSlug
 * - subscriptionActive
 */

// Validation schema for creating a teacher
const createTeacherSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صحيح').max(255, 'Email must be at most 255 characters'),
  password: z.string().min(8, 'يجب انت تكون كلمة السر اكثر من 8 حروف').max(100, 'Password must be at most 100 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  bio: z.string().max(1000, 'Bio must be at most 1000 characters').optional(),
  phoneNumber: z.string().max(20, 'Phone number must be at most 20 characters').optional(),
  schoolName: z.string().max(255, 'School name must be at most 255 characters').optional(),
  publicSlug: z.string().max(255, 'Public slug must be at most 255 characters').optional(),
  pageTitle: z.string().max(255, 'Page title must be at most 255 characters').optional(),
  pageTemplate: z.enum(['default', 'modern', 'classic']).optional(),
});

export async function GET(request: NextRequest) {
  // Enforce admin-only access
  const { session, errorResponse } = await requireRoleApp(['admin']);
  if (errorResponse) {
    return errorResponse;
  }

  try {
    // Query all users with teacher role
    // Join profiles with user_roles to filter by role = 'teacher'
    const teachers = await db
      .select({
        id: profiles.id,
        email: profiles.email,
        fullName: profiles.fullName,
        bio: profiles.bio,
        phoneNumber: profiles.phoneNumber,
        schoolName: profiles.schoolName,
        publicSlug: profiles.publicSlug,
        subscriptionActive: profiles.subscriptionActive,
        subscriptionEndsAt: profiles.subscriptionEndsAt,
        trialEndsAt: profiles.trialEndsAt,
        // createdAt: profiles.createdAt,
      })
      .from(profiles)
      .innerJoin(userRoles, eq(userRoles.userId, profiles.id))
      .where(eq(userRoles.role, 'teacher'));

    return NextResponse.json({
      data: teachers,
      message: 'Teachers retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

const deleteTeacherSchema = z.object({
  teacherId: z.string().min(1, 'Teacher id is required'),
});

export async function DELETE(request: NextRequest) {
  const { session, errorResponse } = await requireRoleApp(['admin']);
  if (errorResponse) return errorResponse;

  try {
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json(
        { error: 'Invalid request body: expected a JSON object' },
        { status: 400 }
      );
    }

    const validatedData = deleteTeacherSchema.parse(body);

    const teacherId = validatedData.teacherId;

    const [teacher] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, teacherId))
      .limit(1);

    if (!teacher) {
      return NextResponse.json(
        { error: 'Teacher not found' },
        { status: 404 }
      );
    }

    const [roleData] = await db
      .select()
      .from(userRoles)
      .where(and(
        eq(userRoles.userId, teacherId),
        eq(userRoles.role, 'teacher')
      ))
      .limit(1);

    if (!roleData) {
      return NextResponse.json(
        { error: 'User is not a teacher' },
        { status: 400 }
      );
    }

    await db
      .delete(userRoles)
      .where(and(
        eq(userRoles.userId, teacherId),
        eq(userRoles.role, 'teacher')
      ));

    await db.delete(profiles).where(eq(profiles.id, teacherId));

    return NextResponse.json({
      message: 'Teacher profile deleted successfully',
    });
  } catch (error) {
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

    console.error('Error deleting teacher profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Enforce admin-only access
  const { session, errorResponse } = await requireRoleApp(['admin']);
  if (errorResponse) return errorResponse;

  try {
    // Parse and validate input data
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json(
        { error: 'Invalid request body: expected a JSON object' },
        { status: 400 }
      );
    }

    const validatedData = createTeacherSchema.parse(body);

    // Check if email already exists
    const [existingEmail] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.email, validatedData.email))
      .limit(1);

    if (existingEmail) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني مستخدم بالفعل' },
        { status: 400 }
      );
    }

    // Check if publicSlug already exists (if provided)
    if (validatedData.publicSlug) {
      const [existingSlug] = await db
        .select()
        .from(profiles)
        .where(eq(profiles.publicSlug, validatedData.publicSlug))
        .limit(1);

      if (existingSlug) {
        return NextResponse.json(
          { error: 'الرابط العام مستخدم بالفعل' },
          { status: 400 }
        );
      }
    }

    // Hash the password with bcrypt (cost factor 12)
    const hashedPassword = await hash(validatedData.password, 12);

    // Generate UUID for new teacher
    const teacherId = uuidv7();

    // Create the teacher profile
    await db
      .insert(profiles)
      .values({
        id: teacherId,
        email: validatedData.email,
        passwordHash: hashedPassword,
        fullName: validatedData.fullName,
        bio: validatedData.bio || null,
        phoneNumber: validatedData.phoneNumber || null,
        schoolName: validatedData.schoolName || null,
        publicSlug: validatedData.publicSlug || null,
        pageTitle: validatedData.pageTitle || null,
        pageTemplate: validatedData.pageTemplate || 'default',
        subscriptionActive: false,
      });

    // Assign teacher role
    await db.insert(userRoles).values({
      id: uuidv7(),
      userId: teacherId,
      role: 'teacher',
    });

    // Fetch the created profile (excluding password hash)
    const [createdProfile] = await db
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
      })
      .from(profiles)
      .where(eq(profiles.id, teacherId))
      .limit(1);

    return NextResponse.json(
      {
        data: createdProfile,
        message: 'Teacher created successfully',
      },
      { status: 201 }
    );
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

    console.error('Error creating teacher:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
