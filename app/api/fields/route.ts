import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { fields } from '@/db/schema/skills';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { v7 as uuidv7 } from 'uuid';
import { requireRoleApp } from '@/lib/auth-helpers-app';

const createFieldSchema = z.object({
  name: z.string().min(2).max(255),
  subject_id: z.string().min(1).optional(),
  subjectId: z.string().min(1).optional(),
  display_order: z.coerce.number().int().min(1).optional(),
  displayOrder: z.coerce.number().int().min(1).optional(),
  description: z.string().max(1000).optional(),
});

export async function POST(request: NextRequest) {
  const { session, errorResponse } = await requireRoleApp(['admin']);
  if (errorResponse) {
    return errorResponse;
  }

  try {
    const body = await request.json();
    const validatedData = createFieldSchema.parse(body);

    const subjectId = validatedData.subject_id ?? validatedData.subjectId;
    if (!subjectId) {
      return NextResponse.json(
        { error: 'Subject reference is required' },
        { status: 400 }
      );
    }

    const displayOrder = Number(validatedData.display_order ?? validatedData.displayOrder ?? 1);

    const [existingField] = await db
      .select()
      .from(fields)
      .where(eq(fields.name, validatedData.name))
      .limit(1);

    if (existingField) {
      return NextResponse.json(
        { error: 'Field already exists' },
        { status: 409 }
      );
    }

    const newFieldId = uuidv7();

    await db.insert(fields).values({
      id: newFieldId,
      subjectId,
      name: validatedData.name,
      displayOrder,
    });

    return NextResponse.json(
      {
        data: {
          id: newFieldId,
          subjectId,
          name: validatedData.name,
          displayOrder,
        },
        message: 'Field created successfully',
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

    console.error('Failed to create field:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
