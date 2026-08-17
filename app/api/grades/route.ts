import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { grades } from '@/db/schema/skills';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { v7 as uuidv7 } from 'uuid';
import { requireRoleApp } from '@/lib/auth-helpers-app';

const createGradeSchema = z.object({
  name: z.string().min(2).max(100),
  display_order: z.coerce.number().int().min(1).optional(),
  displayOrder: z.coerce.number().int().min(1).optional(),
  level: z.coerce.number().int().min(1).optional(),
});

export async function POST(request: NextRequest) {
  const { session, errorResponse } = await requireRoleApp(['admin']);
  if (errorResponse) {
    return errorResponse;
  }

  try {
    const body = await request.json();
    const validatedData = createGradeSchema.parse(body);

    const displayOrder = Number(validatedData.display_order ?? validatedData.displayOrder ?? 1);

    const [existingGrade] = await db
      .select()
      .from(grades)
      .where(eq(grades.name, validatedData.name))
      .limit(1);

    if (existingGrade) {
      return NextResponse.json(
        { error: 'Grade already exists' },
        { status: 409 }
      );
    }

    const newGradeId = uuidv7();

    await db.insert(grades).values({
      id: newGradeId,
      name: validatedData.name,
      displayOrder,
    });

    return NextResponse.json(
      {
        data: {
          id: newGradeId,
          name: validatedData.name,
          displayOrder,
        },
        message: 'Grade created successfully',
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

    console.error('Failed to create grade:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
