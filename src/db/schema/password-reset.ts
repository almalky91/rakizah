// Password reset tokens schema
import { mysqlTable, varchar, timestamp, boolean, datetime } from 'drizzle-orm/mysql-core';
import { profiles } from './auth';
import { sql } from 'drizzle-orm';

export const passwordResetTokens = mysqlTable('password_reset_tokens', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  tokenHash: varchar('token_hash', { length: 64 }).notNull(), // SHA-256 hash of the token
  expiresAt: timestamp('expires_at').notNull(),
  used: boolean('used').notNull().default(false),
  usedAt: datetime('used_at').default(sql`NULL`),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// TypeScript type exports
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type NewPasswordResetToken = typeof passwordResetTokens.$inferInsert;
