/**
 * Teacher API Client Functions
 * 
 * This module provides typed API client functions for teacher-related operations,
 * including managing teacher skills assignments.
 * 
 * Requirements: 8.2, 8.5, 8.6
 */

import { apiGet, apiPut } from '../api-client';

/**
 * Teacher skill with complete hierarchy information
 */
export interface TeacherSkillResponse {
  id: string;
  skillNumber: number;
  title: string;
  difficultyLevel: string;
  displayOrder: number;
  createdAt: Date | string;
  field: {
    id: string;
    name: string;
    displayOrder: number;
  };
  grade: {
    id: string;
    name: string;
    displayOrder: number;
  };
  subject: {
    id: string;
    name: string;
  } | null;
  teacherSkillId?: string;
  teacherSkillCreatedAt?: Date | string;
  assignedAt?: Date | string;
}

/**
 * Teacher skills update payload
 */
export interface UpdateTeacherSkillsData {
  skillIds: string[];
}

/**
 * Teacher API client
 */
export const teacherApi = {
  /**
   * Get teacher's assigned skills with complete hierarchy
   * 
   * No authentication required (public access for viewing teacher skills).
   * Returns skills with field and grade information.
   * 
   * @param teacherId - Teacher's profile ID
   * @returns Array of teacher skills with hierarchy
   * @throws ApiError if teacher not found or server error
   * 
   * @example
   * const skills = await teacherApi.getSkills('teacher-123');
   * skills.forEach(skill => {
   *   console.log(`${skill.grade.name} > ${skill.field.name} > ${skill.title}`);
   * });
   */
  getSkills: async (teacherId: string): Promise<TeacherSkillResponse[]> => {
    const response = await apiGet<{ data: TeacherSkillResponse[] }>(
      `/teachers/${teacherId}/skills`,
      undefined,
      { requireAuth: false } // Public access
    );
    console.log(response)
    return response;
  },

  /**
   * Update teacher's skills
   * 
   * Requires authentication and authorization (admin or the teacher themselves).
   * Replaces all existing skills with the provided skill IDs.
   * 
   * @param teacherId - Teacher's profile ID
   * @param data - Object containing array of skill IDs
   * @returns Success message and updated skill IDs
   * @throws ApiError if unauthorized, validation fails, or server error
   * 
   * @example
   * await teacherApi.updateSkills('teacher-123', {
   *   skillIds: ['skill-1', 'skill-2', 'skill-3']
   * });
   */
  updateSkills: async (
    teacherId: string,
    data: UpdateTeacherSkillsData
  ): Promise<{ message: string; data: { teacherId: string; skillIds: string[] } }> => {
    const response = await apiPut<{
      message: string;
      data: { teacherId: string; skillIds: string[] };
    }>(`/teachers/${teacherId}/skills`, data);
    return response;
  },

  /**
   * Add skills to teacher (convenience method)
   * 
   * Fetches current skills, adds new ones, and updates.
   * Prevents duplicate skill assignments.
   * 
   * @param teacherId - Teacher's profile ID
   * @param skillIdsToAdd - Array of skill IDs to add
   * @returns Success message
   * 
   * @example
   * await teacherApi.addSkills('teacher-123', ['skill-4', 'skill-5']);
   */
  addSkills: async (teacherId: string, skillIdsToAdd: string[]): Promise<{ message: string }> => {
    // Get current skills
    const currentSkills = await teacherApi.getSkills(teacherId);
    const currentSkillIds = currentSkills.map(s => s.id);
    
    // Merge with new skills (remove duplicates)
    const uniqueSkillIds = Array.from(new Set([...currentSkillIds, ...skillIdsToAdd]));
    
    // Update with merged list
    const result = await teacherApi.updateSkills(teacherId, { skillIds: uniqueSkillIds });
    return { message: result.message };
  },

  /**
   * Remove skills from teacher (convenience method)
   * 
   * Fetches current skills, removes specified ones, and updates.
   * 
   * @param teacherId - Teacher's profile ID
   * @param skillIdsToRemove - Array of skill IDs to remove
   * @returns Success message
   * 
   * @example
   * await teacherApi.removeSkills('teacher-123', ['skill-2']);
   */
  removeSkills: async (teacherId: string, skillIdsToRemove: string[]): Promise<{ message: string }> => {
    // Get current skills
    const currentSkills = await teacherApi.getSkills(teacherId);
    const currentSkillIds = currentSkills.map(s => s.id);
    
    // Filter out skills to remove
    const remainingSkillIds = currentSkillIds.filter(id => !skillIdsToRemove.includes(id));
    
    // Update with filtered list
    const result = await teacherApi.updateSkills(teacherId, { skillIds: remainingSkillIds });
    return { message: result.message };
  },
};

/**
 * Export individual functions for direct import if preferred
 */
export const getTeacherSkills = teacherApi.getSkills;
export const updateTeacherSkills = teacherApi.updateSkills;
export const addTeacherSkills = teacherApi.addSkills;
export const removeTeacherSkills = teacherApi.removeSkills;
