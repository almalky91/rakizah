/**
 * Skills API Client
 * 
 * This module provides typed API functions for retrieving skills hierarchy and
 * filtering skills by grade. All endpoints allow anonymous access for public viewing.
 * Uses the base API client utilities for error handling.
 * 
 * Requirements: 8.2, 8.5, 8.6
 */

import { apiGet } from './api-client';
import type { Grade, Field, Subject, Skill } from '@/db/schema/skills';

// ============================================================================
// TypeScript Types
// ============================================================================

/**
 * Field with nested subjects and skills
 */
export interface FieldWithRelations {
  field: {
    id: string;
    gradeId: string;
    name: string;
    displayOrder: number;
    createdAt: string | Date;
  };
  subjects: Subject[];
  skills: Skill[];
}

/**
 * Grade with nested fields (which contain subjects and skills)
 */
export interface GradeWithFields {
  grade: {
    id: string;
    name: string;
    displayOrder: number;
    createdAt: string | Date;
  };
  fields: FieldWithRelations[];
}

/**
 * Complete skills hierarchy response structure
 */
export interface SkillsHierarchyResponse {
  data: GradeWithFields[];
  message?: string;
}

/**
 * Skill with related field information
 */
export interface SkillWithField {
  id: string;
  fieldId: string;
  gradeId: string;
  skillNumber: number;
  title: string;
  difficultyLevel: string;
  displayOrder: number;
  createdAt: string | Date;
  field: {
    id: string;
    name: string;
    gradeId: string;
    displayOrder: number;
  } | null;
}

/**
 * Skills by grade response structure
 */
export interface SkillsByGradeResponse {
  data: SkillWithField[];
  message?: string;
}

// ============================================================================
// API Client Functions
// ============================================================================

/**
 * Skills API client with typed query operations
 */
export const skillsApi = {
  /**
   * Get the complete skills hierarchy
   * Returns grades > fields > subjects > skills tree structure
   * No authentication required - allows anonymous access for public viewing
   * 
   * Uses efficient parallel queries to avoid N+1 query problems.
   * The API loads all data in a few queries and structures it in memory.
   * 
   * @returns Promise resolving to complete skills hierarchy
   * @throws ApiError if server error occurs (500)
   * 
   * @example
   * const hierarchy = await skillsApi.getHierarchy();
   * hierarchy.forEach(gradeNode => {
   *   console.log(`Grade: ${gradeNode.grade.name}`);
   *   gradeNode.fields.forEach(fieldNode => {
   *     console.log(`  Field: ${fieldNode.field.name}`);
   *     console.log(`    Subjects: ${fieldNode.subjects.length}`);
   *     console.log(`    Skills: ${fieldNode.skills.length}`);
   *   });
   * });
   */
  getHierarchy: async (): Promise<GradeWithFields[]> => {
    const data = await apiGet<SkillsHierarchyResponse>(
      '/skills/hierarchy',
      undefined,
      { requireAuth: false } // Public access
    );
    return data;
  },

  /**
   * Get skills filtered by grade ID with related field information
   * No authentication required - allows anonymous access for public viewing
   * 
   * @param gradeId - Grade ID to filter skills by
   * @returns Promise resolving to array of skills with field information
   * @throws ApiError if validation fails (400) or server error occurs (500)
   * 
   * @example
   * const gradeSkills = await skillsApi.getByGrade('grade-uuid-123');
   * gradeSkills.forEach(skill => {
   *   console.log(`Skill: ${skill.title}`);
   *   console.log(`  Field: ${skill.field?.name}`);
   *   console.log(`  Difficulty: ${skill.difficultyLevel}`);
   *   console.log(`  Number: ${skill.skillNumber}`);
   * });
   */
  getByGrade: async (gradeId: string): Promise<SkillWithField[]> => {
    const response = await apiGet<SkillsByGradeResponse>(
      `/skills/by-grade/${gradeId}`,
      undefined,
      { requireAuth: false } // Public access
    );
    return response;
  },
};

/**
 * Export individual functions for direct import if preferred
 */
export const getSkillsHierarchy = skillsApi.getHierarchy;
export const getSkillsByGrade = skillsApi.getByGrade;

/**
 * Export types for use in components
 */
export type {
  Grade,
  Field,
  Subject,
  Skill,
  FieldWithRelations,
  GradeWithFields,
  SkillWithField,
};
