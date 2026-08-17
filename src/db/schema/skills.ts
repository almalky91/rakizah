// Skills hierarchy schema: grades, fields, subjects, skills, teacher_skills
import { mysqlTable, varchar, timestamp, int } from 'drizzle-orm/mysql-core';
import { profiles } from './auth';

// Grades table - top level of skills hierarchy (e.g., Grade 3, Grade 6, Grade 9)
export const grades = mysqlTable('grades', {
  id: varchar('id', { length: 36 }).primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  displayOrder: int('display_order').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Subjects table - third level of skills hierarchy, belongs to a field
export const subjects = mysqlTable('subjects', {
  id: varchar('id', { length: 36 }).primaryKey(),
  gradeId: varchar('grade_id', { length: 36 }).notNull().references(() => grades.id),
  name: varchar('name', { length: 255 }).notNull(),
  displayOrder: int('display_order').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Fields table - second level of skills hierarchy, belongs to a grade
// (e.g., Numbers and Operations, Algebra, Geometry, Life Science, Physical Science)
export const fields = mysqlTable('fields', {
  id: varchar('id', { length: 36 }).primaryKey(),
  subjectId: varchar('subject_id', { length: 36 }).notNull().references(() => subjects.id),
  name: varchar('name', { length: 255 }).notNull(),
  displayOrder: int('display_order').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Skills table - individual skills that belong to a field and grade
// Contains skill_number for unique identification within grade/field
export const skills = mysqlTable('skills', {
  id: varchar('id', { length: 36 }).primaryKey(),
  fieldId: varchar('field_id', { length: 36 }).notNull().references(() => fields.id),
  gradeId: varchar('grade_id', { length: 36 }).notNull().references(() => grades.id),
  skillNumber: int('skill_number').notNull(),
  title: varchar('title', { length: 500 }).notNull(),
  description: varchar('description', { length: 1000 }).notNull(),
  difficultyLevel: varchar('difficulty_level', { length: 50 }).notNull(), // 'basic', 'intermediate', 'advanced'
  displayOrder: int('display_order').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Teacher skills table - many-to-many relationship between teachers and skills
// Tracks which skills each teacher is qualified to teach
export const teacherSkills = mysqlTable('teacher_skills', {
  id: varchar('id', { length: 36 }).primaryKey(),
  teacherId: varchar('teacher_id', { length: 36 }).notNull().references(() => profiles.id),
  skillId: varchar('skill_id', { length: 36 }).notNull().references(() => skills.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// TypeScript type exports for all skills entities
export type Grade = typeof grades.$inferSelect;
export type NewGrade = typeof grades.$inferInsert;
export type Field = typeof fields.$inferSelect;
export type NewField = typeof fields.$inferInsert;
export type Subject = typeof subjects.$inferSelect;
export type NewSubject = typeof subjects.$inferInsert;
export type Skill = typeof skills.$inferSelect;
export type NewSkill = typeof skills.$inferInsert;
export type TeacherSkill = typeof teacherSkills.$inferSelect;
export type NewTeacherSkill = typeof teacherSkills.$inferInsert;
