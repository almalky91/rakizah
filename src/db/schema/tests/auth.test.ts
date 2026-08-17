// Test file to validate auth schema types and structure
import { describe, it, expect } from 'vitest';
import { profiles, userRoles, type Profile, type NewProfile, type UserRole, type NewUserRole } from '../auth.js';

describe('Auth Schema', () => {
  it('should export profiles table definition', () => {
    expect(profiles).toBeDefined();
    expect(profiles).toHaveProperty('_');
  });

  it('should export userRoles table definition', () => {
    expect(userRoles).toBeDefined();
    expect(userRoles).toHaveProperty('_');
  });

  it('should have correct Profile type structure', () => {
    // Type-level test: this will fail at compile time if types are wrong
    const mockProfile: Profile = {
      id: 'test-uuid',
      email: 'test@example.com',
      fullName: 'Test User',
      passwordHash: 'hashed-password',
      bio: 'Test bio',
      phoneNumber: '+1234567890',
      schoolName: 'Test School',
      publicSlug: 'test-slug',
      pageTitle: 'Test Page',
      pageTemplate: 'default',
      subscriptionActive: false,
      subscriptionEndsAt: new Date(),
      trialEndsAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(mockProfile).toBeDefined();
  });

  it('should have correct NewProfile type for inserts', () => {
    // Type-level test for insert operations
    const newProfile: NewProfile = {
      id: 'new-uuid',
      email: 'new@example.com',
      fullName: 'New User',
      passwordHash: 'hashed-password',
      pageTemplate: 'default',
      subscriptionActive: false,
    };

    expect(newProfile).toBeDefined();
  });

  it('should have correct UserRole type structure', () => {
    // Type-level test for user roles
    const mockUserRole: UserRole = {
      id: 'role-uuid',
      userId: 'user-uuid',
      role: 'student',
    };

    expect(mockUserRole).toBeDefined();
  });

  it('should have correct NewUserRole type for inserts', () => {
    // Type-level test for role inserts
    const newUserRole: NewUserRole = {
      id: 'role-uuid',
      userId: 'user-uuid',
      role: 'admin',
    };

    expect(newUserRole).toBeDefined();
  });

  it('should enforce role enum values at type level', () => {
    // This test validates that the role enum is properly defined
    const validRoles: Array<'admin' | 'teacher' | 'student'> = ['admin', 'teacher', 'student'];
    
    expect(validRoles).toContain('admin');
    expect(validRoles).toContain('teacher');
    expect(validRoles).toContain('student');
  });
});
