import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { teacherSkills, skills, fields, grades, subjects } from '@/db/schema/skills';
import { profiles, userRoles } from '@/db/schema/auth';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { v7 as uuidv7 } from 'uuid';
import { requireAuthApp } from '@/lib/auth-helpers-app';

/**
 * Teacher Skills Management API Route
 * 
 * GET /api/teachers/[id]/skills
 * Retrieve teacher's assigned skills with complete hierarchy information
 * Authorization: Public access (no authentication required)
 * 
 * PUT /api/teachers/[id]/skills
 * Update teacher's skills with an array of skill IDs
 * Authorization: Admin or the teacher themselves
 * 
 * Requirements: 6.1 (Database query migration), 6.2 (Authorization),
 * 10.3 (Teacher content management), 10.5 (Resource ownership)
 */

// Validation schema for skill IDs array
const updateSkillsSchema = z.object({
  skillIds: z.array(z.string().uuid('Each skill ID must be a valid UUID')).min(0, 'Skill IDs array cannot be undefined'),
});

/**
 * GET /api/teachers/[id]/skills
 * Retrieves teacher's assigned skills with full hierarchy information
 * No authentication required (public access for viewing teacher skills)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id: teacherId } = params;

  // Validate that the teacher exists and has the teacher role
  try {
    const [teacher] = await db
      .select({
        id: profiles.id,
        fullName: profiles.fullName,
      })
      .from(profiles)
      .where(eq(profiles.id, teacherId))
      .limit(1);

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    // Verify teacher has the teacher role
    const [roleData] = await db
      .select()
      .from(userRoles)
      .where(and(
        eq(userRoles.userId, teacherId),
        eq(userRoles.role, 'teacher')
      ))
      .limit(1);

    if (!roleData) {
      return NextResponse.json({ error: 'User is not a teacher' }, { status: 400 });
    }

    // Query teacher_skills joined with skills, fields, grades, and subjects to get complete information
    const teacherSkillsData = await db
      .select({
        teacherSkillId: teacherSkills.id,
        teacherSkillCreatedAt: teacherSkills.createdAt,
        skill: {
          id: skills.id,
          fieldId: skills.fieldId,
          gradeId: skills.gradeId,
          skillNumber: skills.skillNumber,
          title: skills.title,
          difficultyLevel: skills.difficultyLevel,
          displayOrder: skills.displayOrder,
          description: skills.description
        },
        // field: {
        //   id: fields.id,
        //   name: fields.name,
        //   displayOrder: fields.displayOrder,
        // },
        // grade: {
        //   id: grades.id,
        //   name: grades.name,
        //   displayOrder: grades.displayOrder,
        // },
        // subject: {
        //   id: subjects.id,
        //   name: subjects.name,
        // },
      })
      .from(teacherSkills)
      .leftJoin(skills, eq(teacherSkills.skillId, skills.id))
      // .innerJoin(fields, eq(skills.fieldId, fields.id))
      // .innerJoin(grades, eq(skills.gradeId, grades.id))
      // .leftJoin(subjects, eq(grades.id, subjects.gradeId))
      .where(eq(teacherSkills.teacherId, teacherId));

    // Transform the data into a clean structure with complete hierarchy
    const skillsWithHierarchy = teacherSkillsData.map((item) => ({
      id: item.skill.id,
      skillNumber: item.skill.skillNumber,
      title: item.skill.title,
      difficultyLevel: item.skill.difficultyLevel,
      displayOrder: item.skill.displayOrder,
      description: item.skill.description,
      createdAt: item.skill.createdAt,
      // field: {
      //   id: item.field.id,
      //   name: item.field.name,
      //   displayOrder: item.field.displayOrder,
      // },
      // grade: {
      //   id: item.grade.id,
      //   name: item.grade.name,
      //   displayOrder: item.grade.displayOrder,
      // },
      // subject: item.subject ? {
      //   id: item.subject.id,
      //   name: item.subject.name,
      // } : null,
      assignedAt: item.teacherSkillCreatedAt,
    }));

    return NextResponse.json({
      data: skillsWithHierarchy,
      message: 'Teacher skills retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching teacher skills:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT /api/teachers/[id]/skills
 * Updates teacher's skills by replacing all existing skills with new ones
 * Authorization: Admin or the teacher themselves
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id: teacherId } = params;

  try {
    // Validate that the teacher exists and has the teacher role
    const [teacher] = await db
      .select({
        id: profiles.id,
        fullName: profiles.fullName,
      })
      .from(profiles)
      .where(eq(profiles.id, teacherId))
      .limit(1);

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    // Verify teacher has the teacher role
    const [roleData] = await db
      .select()
      .from(userRoles)
      .where(and(
        eq(userRoles.userId, teacherId),
        eq(userRoles.role, 'teacher')
      ))
      .limit(1);

    if (!roleData) {
      return NextResponse.json({ error: 'User is not a teacher' }, { status: 400 });
    }

    // Check authorization (user must be admin or the teacher themselves)
    const { session, errorResponse } = await requireAuthApp();
    if (errorResponse) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin or the teacher being updated
    const isAdmin = session.user.role === 'admin';
    const isTeacherSelf = session.user.id === teacherId;

    if (!isAdmin && !isTeacherSelf) {
      return NextResponse.json({
        error: 'Forbidden: You can only update your own skills unless you are an admin',
      }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();

    // Validate input data
    const validatedData = updateSkillsSchema.parse(body);
    const { skillIds } = validatedData;

    // Validate that all skill IDs exist in the database
    if (skillIds.length > 0) {
      // Query all skills to validate them
      const allSkills = await db
        .select({ id: skills.id })
        .from(skills);

      // Check if all provided skill IDs exist
      const existingSkillIds = new Set(allSkills.map((s) => s.id));
      const invalidSkillIds = skillIds.filter((id) => !existingSkillIds.has(id));

      if (invalidSkillIds.length > 0) {
        return NextResponse.json({
          error: 'Invalid skill IDs',
          details: `The following skill IDs do not exist: ${invalidSkillIds.join(', ')}`,
        }, { status: 400 });
      }
    }

    // Delete all existing teacher_skills records for this teacher
    await db
      .delete(teacherSkills)
      .where(eq(teacherSkills.teacherId, teacherId));

    // Insert new teacher_skills records for the provided skill IDs
    if (skillIds.length > 0) {
      const newTeacherSkills = skillIds.map((skillId) => ({
        id: uuidv7(),
        teacherId,
        skillId,
      }));

      await db.insert(teacherSkills).values(newTeacherSkills);
    }

    return NextResponse.json({
      message: 'Teacher skills updated successfully',
      data: {
        teacherId,
        skillCount: skillIds.length,
      },
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

    console.error('Error updating teacher skills:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
