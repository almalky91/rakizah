import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { grades, fields, subjects, skills } from '@/db/schema/skills';
import { asc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { v7 as uuidv7 } from 'uuid';
import { requireRoleApp } from '@/lib/auth-helpers-app';

/**
 * Skills Hierarchy API Route
 * 
 * GET /api/skills
 * Returns the complete skills tree: grades > fields > subjects > skills
 * 
 * This endpoint is public (no authentication required) for anonymous viewing.
 * Uses efficient Drizzle ORM queries to avoid N+1 query problems.
 * 
 * Response structure:
 * [
 *   {
 *     grade: { id, name, displayOrder, createdAt },
 *     fields: [
 *       {
 *         field: { id, gradeId, name, displayOrder, createdAt },
 *         subjects: [
 *           { id, fieldId, name, displayOrder, createdAt }
 *         ],
 *         skills: [
 *           { id, fieldId, gradeId, skillNumber, title, difficultyLevel, displayOrder, createdAt }
 *         ]
 *       }
 *     ]
 *   }
 * ]
 */
const createSkillSchema = z.object({
  title: z.string().min(2).max(500),
  grade_id: z.string().min(1).optional(),
  gradeId: z.string().min(1).optional(),
  field_id: z.string().min(1).optional(),
  fieldId: z.string().min(1).optional(),
  subject_id: z.string().min(1).optional(),
  subjectId: z.string().min(1).optional(),
  skill_number: z.coerce.number().int().min(1).optional(),
  skillNumber: z.coerce.number().int().min(1).optional(),
  display_order: z.coerce.number().int().min(1).optional(),
  displayOrder: z.coerce.number().int().min(1).optional(),
  difficulty_level: z.enum(['basic', 'intermediate', 'advanced']).optional(),
  difficultyLevel: z.enum(['basic', 'intermediate', 'advanced']).optional(),
  description: z.string().max(1000).optional(),
});

export async function GET(request: NextRequest) {
  try {
    // Fetch all data in parallel to minimize database round trips
    const [allGrades, allFields, allSubjects, allSkills] = await Promise.all([
      db.select().from(grades).orderBy(asc(grades.displayOrder)),
      db.select().from(fields).orderBy(asc(fields.displayOrder)),
      db.select().from(subjects).orderBy(asc(subjects.displayOrder)),
      db.select().from(skills).orderBy(asc(skills.displayOrder)),
    ]);

    // Build hierarchy by grouping related entities
    // This approach avoids N+1 queries by loading all data upfront and organizing it in memory
    
    // Group fields by gradeId
    const fieldsByGrade = allFields.reduce((acc, field) => {
      if (!acc[field.gradeId]) {
        acc[field.gradeId] = [];
      }
      acc[field.gradeId].push(field);
      return acc;
    }, {} as Record<string, typeof allFields>);

    // Group subjects by fieldId
    const subjectsByField = allSubjects.reduce((acc, subject) => {
      if (!acc[subject.fieldId]) {
        acc[subject.fieldId] = [];
      }
      acc[subject.fieldId].push(subject);
      return acc;
    }, {} as Record<string, typeof allSubjects>);

    // Group skills by fieldId
    const skillsByField = allSkills.reduce((acc, skill) => {
      if (!acc[skill.fieldId]) {
        acc[skill.fieldId] = [];
      }
      acc[skill.fieldId].push(skill);
      return acc;
    }, {} as Record<string, typeof allSkills>);

    // Build the nested hierarchy structure
    const hierarchy = allGrades.map((grade) => {
      const gradeFields = fieldsByGrade[grade.id] || [];
      
      return {
        grade: {
          id: grade.id,
          name: grade.name,
          displayOrder: grade.displayOrder,
          createdAt: grade.createdAt,
        },
        fields: gradeFields.map((field) => ({
          field: {
            id: field.id,
            gradeId: field.gradeId,
            name: field.name,
            displayOrder: field.displayOrder,
            createdAt: field.createdAt,
          },
          subjects: subjectsByField[field.id] || [],
          skills: skillsByField[field.id] || [],
        })),
      };
    });

    return NextResponse.json({
      data: hierarchy,
      message: 'Skills hierarchy retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching skills hierarchy:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to retrieve skills hierarchy',
      },
      { status: 500 }
    );
  }
}


export async function POST(request: NextRequest) {
  const { errorResponse } = await requireRoleApp(['admin']);
  if (errorResponse) {
    return errorResponse;
  }

  try {
    const body = await request.json();
    const validatedData = createSkillSchema.parse(body);

    const gradeId = validatedData.grade_id ?? validatedData.gradeId;
    const fieldId = validatedData.field_id ?? validatedData.fieldId;

    if (!gradeId || !fieldId) {
      return NextResponse.json(
        { error: 'Grade and field references are required' },
        { status: 400 }
      );
    }

    const difficultyLevel = validatedData.difficulty_level ?? validatedData.difficultyLevel ?? 'basic';
    const skillNumber = Number(validatedData.skill_number ?? validatedData.skillNumber ?? 1);
    const displayOrder = Number(validatedData.display_order ?? validatedData.displayOrder ?? 1);

    const [existingSkill] = await db
      .select()
      .from(skills)
      .where(eq(skills.title, validatedData.title))
      .limit(1);

    if (existingSkill) {
      return NextResponse.json(
        { error: 'Skill already exists' },
        { status: 409 }
      );
    }

    const newSkillId = uuidv7();

    await db.insert(skills).values({
      id: newSkillId,
      fieldId,
      gradeId,
      skillNumber,
      title: validatedData.title,
      difficultyLevel,
      displayOrder,
    });

    return NextResponse.json(
      {
        data: {
          id: newSkillId,
          fieldId,
          gradeId,
          skillNumber,
          title: validatedData.title,
          difficultyLevel,
          displayOrder,
        },
        message: 'Skill created successfully',
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

    console.error('Failed to create skill:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
