import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createMocks } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';
import handler from './index';
import { db } from '@/db';
import { gameScores } from '@/db/schema/results';
import * as authHelpers from '@/lib/auth-helpers';

// Mock database and auth
vi.mock('@/db', () => ({
  db: {
    insert: vi.fn(() => ({
      values: vi.fn(() => Promise.resolve()),
    })),
  },
}));

vi.mock('@/db/schema/results', () => ({
  gameScores: {
    id: 'id',
    studentId: 'student_id',
    teacherId: 'teacher_id',
    points: 'points',
    source: 'source',
    createdAt: 'created_at',
  },
}));

vi.mock('@/lib/auth-helpers');

describe('/api/game-scores', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('POST /api/game-scores', () => {
    const mockStudentSession = {
      user: { id: 'student-123', role: 'student', email: 'student@test.com' },
      expires: '2024-12-31',
    };

    it('should submit game score with valid data when authenticated', async () => {
      const scoreData = {
        source: 'memory-game',
        points: 150,
        studentId: 'student-123',
        teacherId: 'teacher-456',
      };

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: scoreData,
      });

      vi.mocked(authHelpers.requireAuth).mockResolvedValue(mockStudentSession as any);

      const mockDb = db as any;
      mockDb.insert.mockReturnValue({
        values: vi.fn(() => Promise.resolve()),
      });

      await handler(req, res);

      expect(authHelpers.requireAuth).toHaveBeenCalledWith(req, res);
      expect(res._getStatusCode()).toBe(201);
      const responseData = JSON.parse(res._getData());
      expect(responseData.data.source).toBe(scoreData.source);
      expect(responseData.data.points).toBe(scoreData.points);
      expect(responseData.data.studentId).toBe(scoreData.studentId);
      expect(responseData.data.teacherId).toBe(scoreData.teacherId);
      expect(responseData.message).toBe('Game score submitted successfully');
    });

    it('should return 401 when not authenticated', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          source: 'memory-game',
          points: 100,
          studentId: 'student-123',
          teacherId: 'teacher-456',
        },
      });

      vi.mocked(authHelpers.requireAuth).mockResolvedValue(null);

      await handler(req, res);

      expect(authHelpers.requireAuth).toHaveBeenCalledWith(req, res);
      // Response sent by requireAuth middleware
    });

    it('should return 403 when student tries to submit score for another student', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          source: 'memory-game',
          points: 100,
          studentId: 'student-999', // Different from session user ID
          teacherId: 'teacher-456',
        },
      });

      vi.mocked(authHelpers.requireAuth).mockResolvedValue(mockStudentSession as any);

      await handler(req, res);

      expect(res._getStatusCode()).toBe(403);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toBe('Forbidden');
      expect(responseData.message).toBe('You can only submit scores for yourself');
    });

    it('should return 400 when source is missing', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          points: 100,
          studentId: 'student-123',
          teacherId: 'teacher-456',
        },
      });

      vi.mocked(authHelpers.requireAuth).mockResolvedValue(mockStudentSession as any);

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toBe('Validation error');
      expect(responseData.message).toBe('Invalid game score data');
      expect(responseData.details).toBeDefined();
    });

    it('should return 400 when source is empty', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          source: '',
          points: 100,
          studentId: 'student-123',
          teacherId: 'teacher-456',
        },
      });

      vi.mocked(authHelpers.requireAuth).mockResolvedValue(mockStudentSession as any);

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toBe('Validation error');
    });

    it('should return 400 when source is too long', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          source: 'a'.repeat(256), // Exceeds 255 character limit
          points: 100,
          studentId: 'student-123',
          teacherId: 'teacher-456',
        },
      });

      vi.mocked(authHelpers.requireAuth).mockResolvedValue(mockStudentSession as any);

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toBe('Validation error');
    });

    it('should return 400 when points is missing', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          source: 'memory-game',
          studentId: 'student-123',
          teacherId: 'teacher-456',
        },
      });

      vi.mocked(authHelpers.requireAuth).mockResolvedValue(mockStudentSession as any);

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toBe('Validation error');
    });

    it('should return 400 when points is negative', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          source: 'memory-game',
          points: -50,
          studentId: 'student-123',
          teacherId: 'teacher-456',
        },
      });

      vi.mocked(authHelpers.requireAuth).mockResolvedValue(mockStudentSession as any);

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toBe('Validation error');
    });

    it('should return 400 when points is not an integer', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          source: 'memory-game',
          points: 100.5,
          studentId: 'student-123',
          teacherId: 'teacher-456',
        },
      });

      vi.mocked(authHelpers.requireAuth).mockResolvedValue(mockStudentSession as any);

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toBe('Validation error');
    });

    it('should accept zero points', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          source: 'memory-game',
          points: 0,
          studentId: 'student-123',
          teacherId: 'teacher-456',
        },
      });

      vi.mocked(authHelpers.requireAuth).mockResolvedValue(mockStudentSession as any);

      const mockDb = db as any;
      mockDb.insert.mockReturnValue({
        values: vi.fn(() => Promise.resolve()),
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(201);
      const responseData = JSON.parse(res._getData());
      expect(responseData.data.points).toBe(0);
    });

    it('should return 400 when studentId is missing', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          source: 'memory-game',
          points: 100,
          teacherId: 'teacher-456',
        },
      });

      vi.mocked(authHelpers.requireAuth).mockResolvedValue(mockStudentSession as any);

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toBe('Validation error');
    });

    it('should return 400 when studentId is not a valid UUID', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          source: 'memory-game',
          points: 100,
          studentId: 'invalid-uuid',
          teacherId: 'teacher-456',
        },
      });

      vi.mocked(authHelpers.requireAuth).mockResolvedValue(mockStudentSession as any);

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toBe('Validation error');
    });

    it('should return 400 when teacherId is missing', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          source: 'memory-game',
          points: 100,
          studentId: 'student-123',
        },
      });

      vi.mocked(authHelpers.requireAuth).mockResolvedValue(mockStudentSession as any);

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toBe('Validation error');
    });

    it('should return 400 when teacherId is not a valid UUID', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          source: 'memory-game',
          points: 100,
          studentId: 'student-123',
          teacherId: 'invalid-uuid',
        },
      });

      vi.mocked(authHelpers.requireAuth).mockResolvedValue(mockStudentSession as any);

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toBe('Validation error');
    });

    it('should handle database errors during score submission', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          source: 'memory-game',
          points: 100,
          studentId: 'student-123',
          teacherId: 'teacher-456',
        },
      });

      vi.mocked(authHelpers.requireAuth).mockResolvedValue(mockStudentSession as any);

      const mockDb = db as any;
      mockDb.insert.mockReturnValue({
        values: vi.fn(() => Promise.reject(new Error('Database error'))),
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toBe('Internal server error');
      expect(responseData.message).toBe('Failed to submit game score');
    });
  });

  describe('Method not allowed', () => {
    it('should return 405 for GET method', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toBe('Method not allowed');
      expect(responseData.message).toBe('Only POST method is supported');
    });

    it('should return 405 for PUT method', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'PUT',
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
    });

    it('should return 405 for DELETE method', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'DELETE',
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
    });
  });
});
