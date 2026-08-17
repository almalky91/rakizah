// Tracking schema: video_views, public_video_views
import { mysqlTable, varchar, timestamp } from 'drizzle-orm/mysql-core';
import { profiles } from './auth';
import { videos } from './content';

// Video views table - stores authenticated student video view tracking
export const videoViews = mysqlTable('video_views', {
  id: varchar('id', { length: 36 }).primaryKey(),
  videoId: varchar('video_id', { length: 36 }).notNull().references(() => videos.id, { onDelete: 'cascade' }),
  studentId: varchar('student_id', { length: 36 }).notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  teacherId: varchar('teacher_id', { length: 36 }).notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  viewedAt: timestamp('viewed_at').notNull().defaultNow(),
});

// Public video views table - stores anonymous student video view tracking from public pages
export const publicVideoViews = mysqlTable('public_video_views', {
  id: varchar('id', { length: 36 }).primaryKey(),
  videoId: varchar('video_id', { length: 36 }).notNull().references(() => videos.id, { onDelete: 'cascade' }),
  teacherId: varchar('teacher_id', { length: 36 }).notNull(),
  studentName: varchar('student_name', { length: 255 }).notNull(),
  viewedAt: timestamp('viewed_at').notNull().defaultNow(),
});

// Type exports for TypeScript type inference
export type VideoView = typeof videoViews.$inferSelect;
export type NewVideoView = typeof videoViews.$inferInsert;
export type PublicVideoView = typeof publicVideoViews.$inferSelect;
export type NewPublicVideoView = typeof publicVideoViews.$inferInsert;
