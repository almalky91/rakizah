import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { profiles } from '@/db/schema/auth';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { requireOwnershipApp } from '@/lib/auth-helpers-app';

// Validation schema for profile update
const updateProfileSchema = z.object({
  email: z.string().email('Invalid email address').max(255, 'Email must be at most 255 characters').optional(),
  fullName: z.string().min(2, 'Full name must be at least 2 characters').optional(),
  bio: z.string().max(1000, 'Bio must be at most 1000 characters').optional(),
  phoneNumber: z.string().max(20, 'Phone number must be at most 20 characters').optional(),
  schoolName: z.string().max(255, 'School name must be at most 255 characters').optional(),
  publicSlug: z.string().max(255, 'Public slug must be at most 255 characters').optional(),
  pageTitle: z.string().max(255, 'Page title must be at most 255 characters').optional(),
  pageTemplate: z.string().max(50, 'Page template must be at most 50 characters').optional(),
});

// GET: Retrieve profile by ID (public access)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const [profile] = await db
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

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Return profile data (excluding password hash)
    return NextResponse.json({ data: profile });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT: Update profile (requires ownership or admin role)
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
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Check authorization (user must own the profile or be admin)
    const { session, errorResponse } = await requireOwnershipApp(id);
    if (errorResponse) return errorResponse;

    // Parse request body
    const body = await request.json();

    // Validate input data
    const validatedData = updateProfileSchema.parse(body);

    // Check if email is being updated and if it's already taken
    if (validatedData.email && validatedData.email !== existingProfile.email) {
      const [existingEmail] = await db
        .select()
        .from(profiles)
        .where(eq(profiles.email, validatedData.email))
        .limit(1);

      if (existingEmail) {
        return NextResponse.json({ error: 'Email already taken' }, { status: 400 });
      }
    }

    // Check if publicSlug is being updated and if it's already taken
    if (validatedData.publicSlug && validatedData.publicSlug !== existingProfile.publicSlug) {
      const [existingSlug] = await db
        .select()
        .from(profiles)
        .where(eq(profiles.publicSlug, validatedData.publicSlug))
        .limit(1);

      if (existingSlug) {
        return NextResponse.json({ error: 'Public slug already taken' }, { status: 400 });
      }
    }

    // Update profile - only include fields that are actually being updated
    const fieldsToUpdate: any = { updatedAt: new Date() };
    
    // Only add fields that are defined in validatedData
    if (validatedData.email !== undefined) fieldsToUpdate.email = validatedData.email;
    if (validatedData.fullName !== undefined) fieldsToUpdate.fullName = validatedData.fullName;
    if (validatedData.bio !== undefined) fieldsToUpdate.bio = validatedData.bio;
    if (validatedData.phoneNumber !== undefined) fieldsToUpdate.phoneNumber = validatedData.phoneNumber;
    if (validatedData.schoolName !== undefined) fieldsToUpdate.schoolName = validatedData.schoolName;
    if (validatedData.publicSlug !== undefined) fieldsToUpdate.publicSlug = validatedData.publicSlug;
    if (validatedData.pageTitle !== undefined) fieldsToUpdate.pageTitle = validatedData.pageTitle;
    if (validatedData.pageTemplate !== undefined) fieldsToUpdate.pageTemplate = validatedData.pageTemplate;

    await db
      .update(profiles)
      .set(fieldsToUpdate)
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
      return NextResponse.json({
        error: 'Invalid input',
        details: error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      }, { status: 400 });
    }

    // Handle duplicate slug error from database
    if (error instanceof Error && error.message.includes('Duplicate entry')) {
      return NextResponse.json({ error: 'Public slug already taken' }, { status: 400 });
    }

    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
