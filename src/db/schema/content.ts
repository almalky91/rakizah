// Content schema: quizzes, videos, games
import { mysqlTable, varchar, timestamp, int, json } from 'drizzle-orm/mysql-core';
import { profiles } from './auth';

// Quizzes table - stores educational quizzes created by teachers
export const quizzes = mysqlTable('quizzes', {
  id: varchar('id', { length: 36 }).primaryKey(),
  teacherId: varchar('teacher_id', { length: 36 }).notNull().references(() => profiles.id),
  title: varchar('title', { length: 255 }).notNull(),
  questions: json('questions').notNull(), // Array of question objects with question, options, correctAnswer
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Videos table - stores educational YouTube videos shared by teachers
export const videos = mysqlTable('videos', {
  id: varchar('id', { length: 36 }).primaryKey(),
  teacherId: varchar('teacher_id', { length: 36 }).notNull().references(() => profiles.id),
  title: varchar('title', { length: 255 }).notNull(),
  youtubeUrl: varchar('youtube_url', { length: 500 }).notNull(),
  views: int('views').default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Games table - stores educational games created by teachers
export const games = mysqlTable('games', {
  id: varchar('id', { length: 36 }).primaryKey(),
  teacherId: varchar('teacher_id', { length: 36 }).notNull().references(() => profiles.id),
  title: varchar('title', { length: 255 }).notNull(),
  gameType: varchar('game_type', { length: 50 }).notNull(), // 'memory', 'wheel', etc.
  config: json('config').notNull(), // Game-specific configuration
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Type exports for TypeScript type inference
export type Quiz = typeof quizzes.$inferSelect;
export type NewQuiz = typeof quizzes.$inferInsert;
export type Video = typeof videos.$inferSelect;
export type NewVideo = typeof videos.$inferInsert;
export type Game = typeof games.$inferSelect;
export type NewGame = typeof games.$inferInsert;
