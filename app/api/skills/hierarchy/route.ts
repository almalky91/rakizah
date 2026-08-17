import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { grades, fields, subjects, skills } from '@/db/schema/skills';
import { asc } from 'drizzle-orm';

/**
 * Skills Hierarchy API Route
 * 
 * GET /api/skills/hierarchy
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
 * 
 * Requirements: 15.5, 15.6
 */
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
    
    // Group fields by subjectId
    const fieldsBySubject = allFields.reduce((acc, field) => {
      if (!acc[field.subjectId]) {
        acc[field.subjectId] = [];
      }
      acc[field.subjectId].push(field);
      return acc;
    }, {} as Record<string, typeof allFields>);

    // Group subjects by gradeId
    const subjectsByGradeId = allSubjects.reduce((acc, subject) => {
      if (!acc[subject.gradeId]) {
        acc[subject.gradeId] = [];
      }
      acc[subject.gradeId].push(subject);
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

    // grade -> subjects -> fields -> skills
    // Build the nested hierarchy structure
    const hierarchy = allGrades.map((grade) => {
      const subjects = subjectsByGradeId[grade.id] || [];
      const fields = subjects.map((subject) => fieldsBySubject[subject.id] || []).flat();
      const skills = fields.map((field) => skillsByField[field.id] || []).flat();

      return {
        grade: {
          id: grade.id,
          name: grade.name,
          displayOrder: grade.displayOrder,
          createdAt: grade.createdAt,
          subjects: {
            subjects,
            fields: {
              fields,
              skills,
            },
          },
        },
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
