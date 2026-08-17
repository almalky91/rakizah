import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { profiles, userRoles } from '@/db/schema/auth';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { hash } from 'bcrypt';
import { v7 as uuidv7 } from 'uuid';
import { requireRoleApp } from '@/lib/auth-helpers-app';

/**
 * Students List API Route
 * 
 * GET /api/students
 * Retrieve all users with the student role
 * Authorization: Admin or Teacher access
 * 
 * POST /api/students
 * Create a new student profile
 * Authorization: Admin or Teacher access
 * 
 * Requirements: 15.5, 15.6 (Student API routes migration)
 * 
 * Response includes student profile information:
 * - id
 * - email
 * - fullName
 * - bio
 * - phoneNumber
 * - schoolName
 * - createdAt
 */

// Validation schema for creating a student
const createStudentSchema = z.object({
  email: z.string().email('Invalid email address').max(255, 'Email must be at most 255 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  bio: z.string().max(1000, 'Bio must be at most 1000 characters').optional(),
  phoneNumber: z.string().max(20, 'Phone number must be at most 20 characters').optional(),
  schoolName: z.string().max(255, 'School name must be at most 255 characters').optional(),
});

export async function GET(request: NextRequest) {
  // Enforce admin or teacher access
  const { session, errorResponse } = await requireRoleApp(['admin', 'teacher']);
  if (errorResponse) {
    return errorResponse;
  }

  try {
    // Query all users with student role
    // Join profiles with user_roles to filter by role = 'student'
    const students = await db
      .select({
        id: profiles.id,
        email: profiles.email,
        fullName: profiles.fullName,
        bio: profiles.bio,
        phoneNumber: profiles.phoneNumber,
        schoolName: profiles.schoolName,
        // createdAt: profiles.createdAt,
      })
      .from(profiles)
      .innerJoin(userRoles, eq(userRoles.userId, profiles.id))
      .where(eq(userRoles.role, 'student'));

    return NextResponse.json({
      data: students,
      message: 'Students retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Enforce admin or teacher access
  const { session, errorResponse } = await requireRoleApp(['admin', 'teacher']);
  if (errorResponse) {
    return errorResponse;
  }

  try {
    // Parse and validate input data
    const body = await request.json();
    const validatedData = createStudentSchema.parse(body);

    // Check if email already exists
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

    // Hash the password with bcrypt (cost factor 12)
    const hashedPassword = await hash(validatedData.password, 12);

    // Generate UUID for new student
    const studentId = uuidv7();

    // Create the student profile
    await db
      .insert(profiles)
      .values({
        id: studentId,
        email: validatedData.email,
        passwordHash: hashedPassword,
        fullName: validatedData.fullName,
        bio: validatedData.bio || null,
        phoneNumber: validatedData.phoneNumber || null,
        schoolName: validatedData.schoolName || null,
        publicSlug: null,
        pageTitle: null,
        pageTemplate: 'default',
        subscriptionActive: false,
      });

    // Assign student role
    await db.insert(userRoles).values({
      id: uuidv7(),
      userId: studentId,
      role: 'student',
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
        // createdAt: profiles.createdAt,
      })
      .from(profiles)
      .where(eq(profiles.id, studentId))
      .limit(1);

    return NextResponse.json(
      {
        data: createdProfile,
        message: 'Student created successfully',
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

    console.error('Error creating student:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
