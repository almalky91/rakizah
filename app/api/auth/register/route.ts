import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import { db } from '@/db';
import { profiles, userRoles } from '@/db/schema/auth';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { v7 as uuidv7 } from 'uuid';

// Validation schema for registration input
const registerSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صالح'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
});

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input data
    const validatedData = registerSchema.parse(body);
    const { email, password, fullName } = validatedData;

    // Check if user already exists
    const [existingUser] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.email, email))
      .limit(1);

    if (existingUser) {
      return NextResponse.json({ error: 'البريد الإلكتروني مستخدم' }, { status: 400 });
    }

    // Hash password with bcrypt using cost factor 12
    const passwordHash = await hash(password, 12);

    // Generate UUID for new user
    const userId = uuidv7();

    // Create user profile
    await db.insert(profiles).values({
      id: userId,
      email,
      fullName,
      passwordHash,
      pageTemplate: 'default',
      subscriptionActive: true,
      // Subscription ends after one day
      subscriptionEndsAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });

    // Assign default role (student)
    await db.insert(userRoles).values({
      id: uuidv7(),
      userId,
      role: 'student',
    });

    // Return success response with 201 Created
    return NextResponse.json({
      message: 'User registered successfully',
      user: {
        id: userId,
        email,
        fullName,
      },
    }, { status: 201 });
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Invalid input',
        details: error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      }, { status: 400 });
    }

    // Handle duplicate email error from database
    if (error instanceof Error && error.message.includes('Duplicate entry')) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    // Log error for debugging
    console.error('Registration error:', error);

    // Return generic server error
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
