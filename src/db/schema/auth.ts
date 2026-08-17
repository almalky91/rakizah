// Authentication schema: profiles, user_roles
import { mysqlTable, varchar, timestamp, boolean, text, mysqlEnum } from 'drizzle-orm/mysql-core';

// Profiles table - user account information
export const profiles = mysqlTable('profiles', {
  id: varchar('id', { length: 36 }).primaryKey(),
  email: varchar('email', { length: 255 }),
  fullName: varchar('full_name', { length: 255 }),
  passwordHash: text('password_hash'),
  bio: text('bio'),
  phoneNumber: varchar('phone_number', { length: 20 }),
  schoolName: varchar('school_name', { length: 255 }),
  publicSlug: varchar('public_slug', { length: 255 }).unique(),
  pageTitle: varchar('page_title', { length: 255 }),
  pageTemplate: varchar('page_template', { length: 50 }).notNull().default('default'),
  subscriptionActive: boolean('subscription_active').notNull().default(false),
  subscriptionEndsAt: timestamp('subscription_ends_at'),
  trialEndsAt: timestamp('trial_ends_at').default(new Date(Date.now() + 24 * 60 * 60 * 1000)),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

// User roles table - role-based access control
export const userRoles = mysqlTable('user_roles', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => profiles.id),
  role: mysqlEnum('role', ['admin', 'teacher', 'student']).notNull(),
});

// TypeScript type exports
export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
export type UserRole = typeof userRoles.$inferSelect;
export type NewUserRole = typeof userRoles.$inferInsert;
