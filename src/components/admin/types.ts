// Import Drizzle types for core entities
import type { Grade, Field, Subject, Skill, Profile } from '@/db';

// Re-export Drizzle types for component compatibility
export type { Grade, Field, Skill };

// Teacher type - using Profile from Drizzle with adjusted field names for compatibility
// Note: Drizzle uses camelCase (fullName, publicSlug, etc.) but some components expect snake_case
export interface Teacher {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
  public_slug: string | null;
  school_name: string | null;
  trial_ends_at: string | null;
  subscription_active: boolean;
  subscription_ends_at: string | null;
}

export interface TeacherStats {
  quizzes: number;
  videos: number;
  games: number;
  publicResults: number;
}

// Subject type - extended with UI properties not in Drizzle schema
// Note: Subjects are now part of fields hierarchy in Drizzle
export interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
  display_order: number;
  grade_id: string;
}
