import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createMocks } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';
import handler from './index';
import { db } from '@/db';
import { games } from '@/db/schema/content';
import * as authHelpers from '@/lib/auth-helpers';

// Mock database and auth
vi.mock('@/db', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve([])),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => Promise.resolve()),
    })),
  },
}));

vi.mock('@/db/schema/content', () => ({
  games: {
    id: 'id',
    teacherId: 'teacher_id',
    title: 'title',
    gameType: 'game_type',
    config: 'config',
    createdAt: 'created_at',
  },
}));

vi.mock('@/lib/auth-helpers');

describe('/api/games', () => {
  const mockGames = [
    {
      id: 'game-1',
      teacherId: 'teacher-123',
      title: 'Memory Game',
      gameType: 'memory',
      config: { cards: 10 },
      createdAt: new Date('2024-01-01'),
    },
    {
      id: 'game-2',
      teacherId: 'teacher-456',
      title: 'Wheel Game',
      gameType: 'wheel',
      config: { segments: 8 },
      createdAt: new Date('2024-01-02'),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/games', () => {
    it('should return all games when no teacherId filter is provided', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        query: {},
      });

      const mockDb = db as any;
      mockDb.select.mockReturnValue({
        from: vi.fn(() => Promise.resolve(mockGames)),
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData.data).toHaveLength(2);
      expect(responseData.message).toBe('Games retrieved successfully');
    });

    it('should filter games by teacherId when provided', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        query: { teacherId: 'teacher-123' },
      });

      const filteredGames = mockGames.filter(g => g.teacherId === 'teacher-123');
      const mockDb = db as any;
      mockDb.select.mockReturnValue({
        from: vi.fn(() => ({
          where: vi.fn(() => Promise.resolve(filteredGames)),
        })),
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData.data).toHaveLength(1);
      expect(responseData.data[0].teacherId).toBe('teacher-123');
      expect(responseData.message).toBe('Games retrieved successfully');
    });

    it('should return empty array when no games found', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        query: { teacherId: 'nonexistent-teacher' },
      });

      const mockDb = db as any;
      mockDb.select.mockReturnValue({
        from: vi.fn(() => ({
          where: vi.fn(() => Promise.resolve([])),
        })),
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData.data).toHaveLength(0);
      expect(responseData.message).toBe('Games retrieved successfully');
    });

    it('should handle database errors gracefully', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        query: {},
      });

      const mockDb = db as any;
      mockDb.select.mockReturnValue({
        from: vi.fn(() => Promise.reject(new Error('Database connection error'))),
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toBe('Internal server error');
      expect(responseData.message).toBe('Failed to retrieve games');
    });
  });

  describe('POST /api/games', () => {
    const mockSession = {
      user: { id: 'teacher-123', role: 'teacher', email: 'teacher@test.com' },
      expires: '2024-12-31',
    };

    it('should create game with valid data when authenticated as teacher', async () => {
      const gameData = {
        title: 'New Memory Game',
        gameType: 'memory',
        config: { cards: 12, theme: 'animals' },
      };

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: gameData,
      });

      vi.mocked(authHelpers.requireRole).mockResolvedValue(mockSession as any);

      const mockDb = db as any;
      mockDb.insert.mockReturnValue({
        values: vi.fn(() => Promise.resolve()),
      });

      await handler(req, res);

      expect(authHelpers.requireRole).toHaveBeenCalledWith(req, res, ['teacher', 'admin']);
      expect(res._getStatusCode()).toBe(201);
      const responseData = JSON.parse(res._getData());
      expect(responseData.data.title).toBe(gameData.title);
      expect(responseData.data.gameType).toBe(gameData.gameType);
      expect(responseData.data.config).toEqual(gameData.config);
      expect(responseData.data.teacherId).toBe('teacher-123');
      expect(responseData.message).toBe('Game created successfully');
    });

    it('should create game with valid data when authenticated as admin', async () => {
      const adminSession = {
        user: { id: 'admin-456', role: 'admin', email: 'admin@test.com' },
        expires: '2024-12-31',
      };

      const gameData = {
        title: 'Admin Wheel Game',
        gameType: 'wheel',
        config: { segments: 6 },
      };

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: gameData,
      });

      vi.mocked(authHelpers.requireRole).mockResolvedValue(adminSession as any);

      const mockDb = db as any;
      mockDb.insert.mockReturnValue({
        values: vi.fn(() => Promise.resolve()),
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(201);
      const responseData = JSON.parse(res._getData());
      expect(responseData.data.teacherId).toBe('admin-456');
    });

    it('should return 401 when not authenticated', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          title: 'Test Game',
          gameType: 'memory',
          config: { cards: 10 },
        },
      });

      vi.mocked(authHelpers.requireRole).mockResolvedValue(null);

      await handler(req, res);

      expect(authHelpers.requireRole).toHaveBeenCalledWith(req, res, ['teacher', 'admin']);
      // Response sent by requireRole middleware
    });

    it('should return 400 when title is missing', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          gameType: 'memory',
          config: { cards: 10 },
        },
      });

      vi.mocked(authHelpers.requireRole).mockResolvedValue(mockSession as any);

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toBe('Validation error');
      expect(responseData.message).toBe('Invalid game data');
      expect(responseData.details).toBeDefined();
    });

    it('should return 400 when title is empty', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          title: '',
          gameType: 'memory',
          config: { cards: 10 },
        },
      });

      vi.mocked(authHelpers.requireRole).mockResolvedValue(mockSession as any);

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toBe('Validation error');
      expect(responseData.details).toBeDefined();
    });

    it('should return 400 when title is too long', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          title: 'a'.repeat(256), // Exceeds 255 character limit
          gameType: 'memory',
          config: { cards: 10 },
        },
      });

      vi.mocked(authHelpers.requireRole).mockResolvedValue(mockSession as any);

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toBe('Validation error');
    });

    it('should return 400 when gameType is missing', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          title: 'Test Game',
          config: { cards: 10 },
        },
      });

      vi.mocked(authHelpers.requireRole).mockResolvedValue(mockSession as any);

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toBe('Validation error');
    });

    it('should return 400 when gameType is empty', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          title: 'Test Game',
          gameType: '',
          config: { cards: 10 },
        },
      });

      vi.mocked(authHelpers.requireRole).mockResolvedValue(mockSession as any);

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toBe('Validation error');
    });

    it('should return 400 when gameType is too long', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          title: 'Test Game',
          gameType: 'a'.repeat(51), // Exceeds 50 character limit
          config: { cards: 10 },
        },
      });

      vi.mocked(authHelpers.requireRole).mockResolvedValue(mockSession as any);

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toBe('Validation error');
    });

    it('should return 400 when config is missing', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          title: 'Test Game',
          gameType: 'memory',
        },
      });

      vi.mocked(authHelpers.requireRole).mockResolvedValue(mockSession as any);

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toBe('Validation error');
    });

    it('should accept config as JSON object', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          title: 'Test Game',
          gameType: 'memory',
          config: { cards: 10, difficulty: 'easy' },
        },
      });

      vi.mocked(authHelpers.requireRole).mockResolvedValue(mockSession as any);

      const mockDb = db as any;
      mockDb.insert.mockReturnValue({
        values: vi.fn(() => Promise.resolve()),
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(201);
      const responseData = JSON.parse(res._getData());
      expect(responseData.data.config).toEqual({ cards: 10, difficulty: 'easy' });
    });

    it('should accept config as JSON array', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          title: 'Test Game',
          gameType: 'memory',
          config: ['item1', 'item2', 'item3'],
        },
      });

      vi.mocked(authHelpers.requireRole).mockResolvedValue(mockSession as any);

      const mockDb = db as any;
      mockDb.insert.mockReturnValue({
        values: vi.fn(() => Promise.resolve()),
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(201);
      const responseData = JSON.parse(res._getData());
      expect(responseData.data.config).toEqual(['item1', 'item2', 'item3']);
    });

    it('should handle database errors during creation', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          title: 'Test Game',
          gameType: 'memory',
          config: { cards: 10 },
        },
      });

      vi.mocked(authHelpers.requireRole).mockResolvedValue(mockSession as any);

      const mockDb = db as any;
      mockDb.insert.mockReturnValue({
        values: vi.fn(() => Promise.reject(new Error('Database error'))),
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toBe('Internal server error');
      expect(responseData.message).toBe('Failed to create game');
    });
  });

  describe('Method not allowed', () => {
    it('should return 405 for PUT method', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'PUT',
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toBe('Method not allowed');
      expect(responseData.message).toBe('Only GET and POST methods are supported');
    });

    it('should return 405 for DELETE method', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'DELETE',
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
    });

    it('should return 405 for PATCH method', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'PATCH',
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
    });
  });
});
