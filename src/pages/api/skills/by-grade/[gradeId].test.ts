import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createMocks } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';
import handler from './[gradeId]';
import { db } from '@/db';
import { skills, fields } from '@/db/schema/skills';

// Mock database
vi.mock('@/db', () => ({
  db: {
    select: vi.fn(),
  },
}));

vi.mock('@/db/schema/skills', () => ({
  skills: {
    id: 'id',
    fieldId: 'field_id',
    gradeId: 'grade_id',
    skillNumber: 'skill_number',
    title: 'title',
    difficultyLevel: 'difficulty_level',
    displayOrder: 'display_order',
    createdAt: 'created_at',
  },
  fields: {
    id: 'id',
    name: 'name',
    gradeId: 'grade_id',
    displayOrder: 'display_order',
  },
}));

describe('/api/skills/by-grade/[gradeId]', () => {
  const mockSkillsWithFields = [
    {
      id: 'skill-1',
      fieldId: 'field-1',
      gradeId: 'grade-3',
      skillNumber: 1,
      title: 'Addition of whole numbers',
      difficultyLevel: 'basic',
      displayOrder: 1,
      createdAt: new Date('2024-01-01'),
      field: {
        id: 'field-1',
        name: 'Numbers and Operations',
        gradeId: 'grade-3',
        displayOrder: 1,
      },
    },
    {
      id: 'skill-2',
      fieldId: 'field-1',
      gradeId: 'grade-3',
      skillNumber: 2,
      title: 'Subtraction of whole numbers',
      difficultyLevel: 'basic',
      displayOrder: 2,
      createdAt: new Date('2024-01-01'),
      field: {
        id: 'field-1',
        name: 'Numbers and Operations',
        gradeId: 'grade-3',
        displayOrder: 1,
      },
    },
    {
      id: 'skill-3',
      fieldId: 'field-2',
      gradeId: 'grade-3',
      skillNumber: 3,
      title: 'Basic geometry shapes',
      difficultyLevel: 'intermediate',
      displayOrder: 3,
      createdAt: new Date('2024-01-01'),
      field: {
        id: 'field-2',
        name: 'Geometry',
        gradeId: 'grade-3',
        displayOrder: 2,
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/skills/by-grade/[gradeId]', () => {
    it('should return skills with field information for valid gradeId', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        query: { gradeId: 'grade-3' },
      });

      const mockDb = db as any;
      mockDb.select.mockReturnValue({
        from: vi.fn(() => ({
          leftJoin: vi.fn(() => ({
            where: vi.fn(() => Promise.resolve(mockSkillsWithFields)),
          })),
        })),
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData.data).toHaveLength(3);
      expect(responseData.data[0].field).toBeDefined();
      expect(responseData.data[0].field.name).toBe('Numbers and Operations');
      expect(responseData.message).toBe('Skills retrieved successfully');
    });

    it('should return empty array when no skills found for gradeId', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        query: { gradeId: 'grade-999' },
      });

      const mockDb = db as any;
      mockDb.select.mockReturnValue({
        from: vi.fn(() => ({
          leftJoin: vi.fn(() => ({
            where: vi.fn(() => Promise.resolve([])),
          })),
        })),
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData.data).toHaveLength(0);
      expect(responseData.message).toBe('Skills retrieved successfully');
    });

    it('should return 400 when gradeId is missing', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        query: {},
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toBe('Validation error');
      expect(responseData.message).toBe('gradeId parameter is required');
    });

    it('should return 400 when gradeId is not a string', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        query: { gradeId: ['invalid', 'array'] },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toBe('Validation error');
      expect(responseData.message).toBe('gradeId parameter is required');
    });

    it('should handle database errors gracefully', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        query: { gradeId: 'grade-3' },
      });

      const mockDb = db as any;
      mockDb.select.mockReturnValue({
        from: vi.fn(() => ({
          leftJoin: vi.fn(() => ({
            where: vi.fn(() => Promise.reject(new Error('Database connection error'))),
          })),
        })),
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toBe('Internal server error');
      expect(responseData.message).toBe('Failed to retrieve skills');
    });

    it('should be accessible without authentication (public endpoint)', async () => {
      // This test verifies that no auth checks are performed
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        query: { gradeId: 'grade-3' },
        headers: {}, // No auth headers
      });

      const mockDb = db as any;
      mockDb.select.mockReturnValue({
        from: vi.fn(() => ({
          leftJoin: vi.fn(() => ({
            where: vi.fn(() => Promise.resolve(mockSkillsWithFields)),
          })),
        })),
      });

      await handler(req, res);

      // Should succeed without authentication
      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData.data).toHaveLength(3);
    });

    it('should include all skill properties in response', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        query: { gradeId: 'grade-3' },
      });

      const mockDb = db as any;
      mockDb.select.mockReturnValue({
        from: vi.fn(() => ({
          leftJoin: vi.fn(() => ({
            where: vi.fn(() => Promise.resolve([mockSkillsWithFields[0]])),
          })),
        })),
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      const skill = responseData.data[0];
      
      // Verify all skill properties are present
      expect(skill).toHaveProperty('id');
      expect(skill).toHaveProperty('fieldId');
      expect(skill).toHaveProperty('gradeId');
      expect(skill).toHaveProperty('skillNumber');
      expect(skill).toHaveProperty('title');
      expect(skill).toHaveProperty('difficultyLevel');
      expect(skill).toHaveProperty('displayOrder');
      expect(skill).toHaveProperty('createdAt');
      
      // Verify field properties are present
      expect(skill.field).toHaveProperty('id');
      expect(skill.field).toHaveProperty('name');
      expect(skill.field).toHaveProperty('gradeId');
      expect(skill.field).toHaveProperty('displayOrder');
    });
  });

  describe('Method not allowed', () => {
    it('should return 405 for POST method', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        query: { gradeId: 'grade-3' },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toBe('Method not allowed');
      expect(responseData.message).toBe('Only GET method is supported');
    });

    it('should return 405 for PUT method', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'PUT',
        query: { gradeId: 'grade-3' },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
    });

    it('should return 405 for DELETE method', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'DELETE',
        query: { gradeId: 'grade-3' },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
    });

    it('should return 405 for PATCH method', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'PATCH',
        query: { gradeId: 'grade-3' },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
    });
  });
});
