import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { skills, fields } from '@/db/schema/skills';
import { eq } from 'drizzle-orm';

/**
 * GET /api/skills/by-grade/[gradeId]
 * Retrieves skills filtered by grade ID with related field information
 * Public endpoint - no authentication required (anonymous access for students)
 * 
 * Requirements: 6.1 (Database query migration), 16.5 (Public pages anonymous access)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { gradeId: string } }
) {
  try {
    const { gradeId } = params;

    // Validate gradeId parameter
    if (!gradeId || typeof gradeId !== 'string') {
      return NextResponse.json({
        error: 'Validation error',
        message: 'gradeId parameter is required',
      }, { status: 400 });
    }

    // Query skills with related field information using Drizzle ORM
    const skillsList = await db
      .select({
        id: skills.id,
        fieldId: skills.fieldId,
        gradeId: skills.gradeId,
        skillNumber: skills.skillNumber,
        title: skills.title,
        difficultyLevel: skills.difficultyLevel,
        displayOrder: skills.displayOrder,
        createdAt: skills.createdAt,
        field: {
          id: fields.id,
          name: fields.name,
          gradeId: fields.gradeId,
          displayOrder: fields.displayOrder,
        },
      })
      .from(skills)
      .leftJoin(fields, eq(skills.fieldId, fields.id))
      .where(eq(skills.gradeId, gradeId));

    return NextResponse.json({
      data: skillsList,
      message: 'Skills retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching skills by grade:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: 'Failed to retrieve skills',
    }, { status: 500 });
  }
}
