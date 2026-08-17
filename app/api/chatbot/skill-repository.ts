/**
 * Skill Repository
 * Single Responsibility: Data access for skills
 * Dependency Inversion: Depends on abstraction (interface), not concrete implementation
 */

import { db } from '@/db';
import { skills, fields, subjects, grades } from '@/db/schema/skills';
import { eq } from 'drizzle-orm';

export interface SkillData {
  title: string;
  description: string;
  grade: string;
  field: string;
  subject: string;
  difficulty: string;
}

export interface ISkillRepository {
  findById(skillId: string): Promise<SkillData | null>;
}

export class SkillRepository implements ISkillRepository {
  async findById(skillId: string): Promise<SkillData | null> {
    const [skillRecord] = await db
      .select({
        skill: skills,
        field: fields,
        subject: subjects,
        grade: grades,
      })
      .from(skills)
      .leftJoin(fields, eq(skills.fieldId, fields.id))
      .leftJoin(subjects, eq(fields.subjectId, subjects.id))
      .leftJoin(grades, eq(skills.gradeId, grades.id))
      .where(eq(skills.id, skillId))
      .limit(1);

    if (!skillRecord) {
      return null;
    }

    return {
      title: skillRecord.skill.title,
      description: skillRecord.skill.description || '',
      grade: skillRecord.grade?.name || 'غير محدد',
      field: skillRecord.field?.name || 'غير محدد',
      subject: skillRecord.subject?.name || 'غير محدد',
      difficulty: skillRecord.skill.difficultyLevel || 'متوسط',
    };
  }
}
