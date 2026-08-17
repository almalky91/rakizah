import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createMocks } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';
import handler from './[teacherId]';
import { db } from '@/db';

// Mock database
vi.mock('@/db', () => ({
  db: {
    select: vi.fn(),
  },
}));

describe('/api/game-scores/leaderboard/[teacherId]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/game-scores/leaderboard/[teacherId]', () => {
    const validTeacherId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

    it('should return leaderboard with top scores for valid teacher ID', async () => {
      const mockLeaderboardData = [
        { studentId: 'student-1', studentName: 'Ahmed Ali', totalPoints: 500 },
        { studentId: 'student-2', studentName: 'Fatima Hassan', totalPoints: 450 },
        { studentId: 'student-3', studentName: 'Mohammed Ibrahim', totalPoints: 400 },
      ];

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        query: { teacherId: validTeacherId },
      });

      // Mock the Drizzle query chain
      const mockDb = db as any;
      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        groupBy: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue(mockLeaderboardData),
      };
      mockDb.select.mockReturnValue(mockQuery);

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData.data).toHaveLength(3);
      expect(responseData.data[0]).toEqual({
        rank: 1,
        studentName: 'Ahmed Ali',
        totalPoints: 500,
      });
      expect(responseData.data[1]).toEqual({
        rank: 2,
        studentName: 'Fatima Hassan',
        totalPoints: 450,
      });
      expect(responseData.data[2]).toEqual({
        rank: 3,
        studentName: 'Mohammed Ibrahim',
        totalPoints: 400,
      });
      expect(responseData.message).toBe('Leaderboard retrieved successfully');
    });

    it('should return empty leaderboard when no scores exist for teacher', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        query: { teacherId: validTeacherId },
      });

      const mockDb = db as any;
      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        groupBy: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };
      mockDb.select.mockReturnValue(mockQuery);

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData.data).toEqual([]);
      expect(responseData.message).toBe('Leaderboard retrieved successfully');
    });

    it('should handle null student names by showing "Unknown Student"', async () => {
      const mockLeaderboardData = [
        { studentId: 'student-1', studentName: null, totalPoints: 300 },
      ];

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        query: { teacherId: validTeacherId },
      });

      const mockDb = db as any;
      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        groupBy: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue(mockLeaderboardData),
      };
      mockDb.select.mockReturnValue(mockQuery);

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData.data[0].studentName).toBe('Unknown Student');
    });

    it('should assign correct ranks to leaderboard entries', async () => {
      const mockLeaderboardData = Array.from({ length: 10 }, (_, i) => ({
        studentId: `student-${i}`,
        studentName: `Student ${i + 1}`,
        totalPoints: 1000 - i * 100,
      }));

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        query: { teacherId: validTeacherId },
      });

      const mockDb = db as any;
      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        groupBy: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue(mockLeaderboardData),
      };
      mockDb.select.mockReturnValue(mockQuery);

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData.data).toHaveLength(10);
      responseData.data.forEach((entry: any, index: number) => {
        expect(entry.rank).toBe(index + 1);
      });
    });

    it('should return 400 when teacherId is missing', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        query: {},
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toBe('Validation error');
      expect(responseData.message).toBe('Invalid teacher ID format');
    });

    it('should return 400 when teacherId is not a valid UUID', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        query: { teacherId: 'invalid-uuid' },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toBe('Validation error');
      expect(responseData.message).toBe('Invalid teacher ID format');
    });

    it('should return 400 when teacherId is an empty string', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        query: { teacherId: '' },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toBe('Validation error');
    });

    it('should handle database errors gracefully', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        query: { teacherId: validTeacherId },
      });

      const mockDb = db as any;
      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        groupBy: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockRejectedValue(new Error('Database connection failed')),
      };
      mockDb.select.mockReturnValue(mockQuery);

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toBe('Internal server error');
      expect(responseData.message).toBe('Failed to retrieve leaderboard');
    });

    it('should not require authentication (anonymous access)', async () => {
      const mockLeaderboardData = [
        { studentId: 'student-1', studentName: 'Test Student', totalPoints: 200 },
      ];

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        query: { teacherId: validTeacherId },
        // No headers or session data - simulating anonymous access
      });

      const mockDb = db as any;
      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        groupBy: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue(mockLeaderboardData),
      };
      mockDb.select.mockReturnValue(mockQuery);

      await handler(req, res);

      // Should succeed without authentication
      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData.data).toHaveLength(1);
    });
  });

  describe('Method not allowed', () => {
    it('should return 405 for POST method', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        query: { teacherId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' },
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
        query: { teacherId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
    });

    it('should return 405 for DELETE method', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'DELETE',
        query: { teacherId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
    });
  });
});
