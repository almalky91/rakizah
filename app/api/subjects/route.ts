import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { subjects } from '@/db/schema/skills';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { v7 as uuidv7 } from 'uuid';
import { requireRoleApp } from '@/lib/auth-helpers-app';

const createSubjectSchema = z.object({
  name: z.string().min(2).max(255),
  grade_id: z.string().min(1).optional(),
  gradeId: z.string().min(1).optional(),
  display_order: z.coerce.number().int().min(1).optional(),
  displayOrder: z.coerce.number().int().min(1).optional(),
  icon: z.string().max(100).optional(),
  color: z.string().max(50).optional(),
});

export async function POST(request: NextRequest) {
  const { session, errorResponse } = await requireRoleApp(['admin']);
  if (errorResponse) {
    return errorResponse;
  }

  try {
    const body = await request.json();
    const validatedData = createSubjectSchema.parse(body);

    const gradeId = validatedData.grade_id ?? validatedData.gradeId;
    if (!gradeId) {
      return NextResponse.json(
        { error: 'Grade reference is required' },
        { status: 400 }
      );
    }

    const displayOrder = Number(validatedData.display_order ?? validatedData.displayOrder ?? 1);

    const [existingSubject] = await db
      .select()
      .from(subjects)
      .where(eq(subjects.name, validatedData.name))
      .limit(1);

    if (existingSubject) {
      return NextResponse.json(
        { error: 'Subject already exists' },
        { status: 409 }
      );
    }

    const newSubjectId = uuidv7();

    await db.insert(subjects).values({
      id: newSubjectId,
      gradeId,
      name: validatedData.name,
      displayOrder,
    });

    return NextResponse.json(
      {
        data: {
          id: newSubjectId,
          gradeId,
          name: validatedData.name,
          displayOrder,
        },
        message: 'Subject created successfully',
      },
      { status: 201 }
    );
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

    console.error('Failed to create subject:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
