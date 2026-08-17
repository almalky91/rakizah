import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { profiles } from '@/db/schema/auth';
import { teacherSkills, skills, fields, grades, subjects } from '@/db/schema/skills';
import { eq } from 'drizzle-orm';

/**
 * Public Teacher Page API Route
 * 
 * GET /api/profiles/by-slug/[slug]
 * - Loads teacher profile by public slug (no authentication required)
 * - Returns profile data with associated skills
 * - Requirements: 16.1, 16.5
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;

  // Validate slug parameter
  if (!slug || slug.trim() === '') {
    return NextResponse.json({ error: 'Slug parameter is required' }, { status: 400 });
  }

  try {
    // Fetch teacher profile by public slug
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
        createdAt: profiles.createdAt,
      })
      .from(profiles)
      .where(eq(profiles.publicSlug, slug))
      .limit(1);

    if (!profile) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    // Fetch associated skills with complete hierarchy information
    const profileSkills = await db
      .select({
        skillId: skills.id,
        skillNumber: skills.skillNumber,
        skillTitle: skills.title,
        difficultyLevel: skills.difficultyLevel,
        displayOrder: skills.displayOrder,
        fieldId: fields.id,
        fieldName: fields.name,
        fieldDisplayOrder: fields.displayOrder,
        gradeId: grades.id,
        gradeName: grades.name,
        gradeDisplayOrder: grades.displayOrder,
        subjectName: subjects.name
      })
      .from(teacherSkills)
      .innerJoin(skills, eq(teacherSkills.skillId, skills.id))
      .innerJoin(fields, eq(skills.fieldId, fields.id))
      .innerJoin(grades, eq(skills.gradeId, grades.id))
      .leftJoin(subjects, eq(subjects.id, fields.subjectId))
      .where(eq(teacherSkills.teacherId, profile.id))
      .orderBy(grades.displayOrder, fields.displayOrder, skills.displayOrder);

    console.log(profileSkills)
    // Transform skills data into a structured format
    const skillsData = profileSkills.map((skill) => ({
      id: skill.skillId,
      skillNumber: skill.skillNumber,
      title: skill.skillTitle,
      difficultyLevel: skill.difficultyLevel,
      displayOrder: skill.displayOrder,
      field: {
        id: skill.fieldId,
        name: skill.fieldName,
        displayOrder: skill.fieldDisplayOrder,
      },
      grade: {
        id: skill.gradeId,
        name: skill.gradeName,
        displayOrder: skill.gradeDisplayOrder,
      },
      subject: {
        name: skill.subjectName,
      }
    }));

    // Return profile with skills array
    return NextResponse.json({
      data: {
        profile,
        skills: skillsData,
      },
    });
  } catch (error) {
    console.error('Error fetching teacher profile by slug:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
