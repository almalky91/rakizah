// Results schema: quiz_results, public_quiz_results, game_scores
import { mysqlTable, varchar, timestamp, int, json } from 'drizzle-orm/mysql-core';
import { profiles } from './auth';
import { quizzes } from './content';

// Quiz results table - stores authenticated student quiz results
export const quizResults = mysqlTable('quiz_results', {
  id: varchar('id', { length: 36 }).primaryKey(),
  quizId: varchar('quiz_id', { length: 36 }).notNull().references(() => quizzes.id, { onDelete: 'cascade' }),
  studentId: varchar('student_id', { length: 36 }).notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  teacherId: varchar('teacher_id', { length: 36 }).notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  score: int('score').notNull(),
  answers: json('answers'), // Array of student answers
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Public quiz results table - stores anonymous student quiz results from public pages
export const publicQuizResults = mysqlTable('public_quiz_results', {
  id: varchar('id', { length: 36 }).primaryKey(),
  quizId: varchar('quiz_id', { length: 36 }).notNull().references(() => quizzes.id, { onDelete: 'cascade' }),
  teacherId: varchar('teacher_id', { length: 36 }).notNull(),
  studentName: varchar('student_name', { length: 255 }).notNull(),
  score: int('score').notNull(),
  totalQuestions: int('total_questions').notNull(),
  answers: json('answers'), // Array of student answers
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Game scores table - stores student game scores with leaderboard tracking
export const gameScores = mysqlTable('game_scores', {
  id: varchar('id', { length: 36 }).primaryKey(),
  studentId: varchar('student_id', { length: 36 }).notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  teacherId: varchar('teacher_id', { length: 36 }).notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  points: int('points').notNull().default(0),
  source: varchar('source', { length: 255 }).notNull(), // Game identifier or source
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Type exports for TypeScript type inference
export type QuizResult = typeof quizResults.$inferSelect;
export type NewQuizResult = typeof quizResults.$inferInsert;
export type PublicQuizResult = typeof publicQuizResults.$inferSelect;
export type NewPublicQuizResult = typeof publicQuizResults.$inferInsert;
export type GameScore = typeof gameScores.$inferSelect;
export type NewGameScore = typeof gameScores.$inferInsert;
