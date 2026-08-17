/**
 * Unit tests for Game API Client
 * Tests game CRUD operations, score submission, and leaderboard fetching
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { gameApi } from '../gameApi.js';
import * as apiClient from '../api-client.js';

// Mock the API client functions
vi.mock('./api-client', () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiPut: vi.fn(),
  apiDelete: vi.fn(),
}));

describe('gameApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('list', () => {
    it('should fetch all games without filter', async () => {
      const mockGames = [
        { 
          id: '1', 
          teacherId: 't1', 
          title: 'Memory Match', 
          gameType: 'memory', 
          config: { cards: [] }, 
          createdAt: new Date() 
        },
        { 
          id: '2', 
          teacherId: 't2', 
          title: 'Wheel of Fortune', 
          gameType: 'wheel', 
          config: { segments: [] }, 
          createdAt: new Date() 
        },
      ];

      vi.mocked(apiClient.apiGet).mockResolvedValueOnce({ data: mockGames });

      const result = await gameApi.list();

      expect(apiClient.apiGet).toHaveBeenCalledWith('/games', undefined);
      expect(result).toEqual(mockGames);
    });

    it('should fetch games filtered by teacherId', async () => {
      const mockGames = [
        { 
          id: '1', 
          teacherId: 't1', 
          title: 'Memory Match', 
          gameType: 'memory', 
          config: { cards: [] }, 
          createdAt: new Date() 
        },
      ];

      vi.mocked(apiClient.apiGet).mockResolvedValueOnce({ data: mockGames });

      const result = await gameApi.list('t1');

      expect(apiClient.apiGet).toHaveBeenCalledWith('/games', { teacherId: 't1' });
      expect(result).toEqual(mockGames);
    });
  });

  describe('get', () => {
    it('should fetch a single game by ID with anonymous access', async () => {
      const mockGame = {
        id: '123',
        teacherId: 't1',
        title: 'Arabic Memory Game',
        gameType: 'memory',
        config: {
          cards: [
            { id: 1, text: 'Cat', matchId: 1 },
            { id: 2, text: 'قطة', matchId: 1 }
          ],
          timeLimit: 60
        },
        createdAt: new Date(),
      };

      vi.mocked(apiClient.apiGet).mockResolvedValueOnce({ data: mockGame });

      const result = await gameApi.get('123');

      expect(apiClient.apiGet).toHaveBeenCalledWith('/games/123', undefined, {
        requireAuth: false,
      });
      expect(result).toEqual(mockGame);
    });
  });

  describe('create', () => {
    it('should create a new game', async () => {
      const newGameData = {
        title: 'Vocabulary Wheel',
        gameType: 'wheel',
        config: {
          segments: ['word1', 'word2', 'word3'],
          spinDuration: 3000
        }
      };

      const mockCreatedGame = {
        id: '456',
        teacherId: 't1',
        ...newGameData,
        createdAt: new Date(),
      };

      vi.mocked(apiClient.apiPost).mockResolvedValueOnce({ data: mockCreatedGame });

      const result = await gameApi.create(newGameData);

      expect(apiClient.apiPost).toHaveBeenCalledWith('/games', newGameData);
      expect(result).toEqual(mockCreatedGame);
    });

    it('should create a game with array config', async () => {
      const newGameData = {
        title: 'Quiz Cards',
        gameType: 'flashcard',
        config: [
          { question: 'What is 2+2?', answer: '4' },
          { question: 'What is 3+3?', answer: '6' }
        ]
      };

      const mockCreatedGame = {
        id: '789',
        teacherId: 't1',
        ...newGameData,
        createdAt: new Date(),
      };

      vi.mocked(apiClient.apiPost).mockResolvedValueOnce({ data: mockCreatedGame });

      const result = await gameApi.create(newGameData);

      expect(apiClient.apiPost).toHaveBeenCalledWith('/games', newGameData);
      expect(result).toEqual(mockCreatedGame);
    });
  });

  describe('update', () => {
    it('should update an existing game title', async () => {
      const updateData = { title: 'Updated Game Title' };
      const mockUpdatedGame = {
        id: '123',
        teacherId: 't1',
        title: 'Updated Game Title',
        gameType: 'memory',
        config: { cards: [] },
        createdAt: new Date(),
      };

      vi.mocked(apiClient.apiPut).mockResolvedValueOnce({ data: mockUpdatedGame });

      const result = await gameApi.update('123', updateData);

      expect(apiClient.apiPut).toHaveBeenCalledWith('/games/123', updateData);
      expect(result).toEqual(mockUpdatedGame);
    });

    it('should update an existing game config', async () => {
      const updateData = { 
        config: {
          cards: [
            { id: 1, text: 'New Card 1', matchId: 1 },
            { id: 2, text: 'New Card 2', matchId: 1 }
          ]
        }
      };
      const mockUpdatedGame = {
        id: '123',
        teacherId: 't1',
        title: 'Memory Game',
        gameType: 'memory',
        config: updateData.config,
        createdAt: new Date(),
      };

      vi.mocked(apiClient.apiPut).mockResolvedValueOnce({ data: mockUpdatedGame });

      const result = await gameApi.update('123', updateData);

      expect(apiClient.apiPut).toHaveBeenCalledWith('/games/123', updateData);
      expect(result).toEqual(mockUpdatedGame);
    });

    it('should update game type', async () => {
      const updateData = { gameType: 'wheel' };
      const mockUpdatedGame = {
        id: '123',
        teacherId: 't1',
        title: 'Game Title',
        gameType: 'wheel',
        config: { segments: [] },
        createdAt: new Date(),
      };

      vi.mocked(apiClient.apiPut).mockResolvedValueOnce({ data: mockUpdatedGame });

      const result = await gameApi.update('123', updateData);

      expect(apiClient.apiPut).toHaveBeenCalledWith('/games/123', updateData);
      expect(result).toEqual(mockUpdatedGame);
    });
  });

  describe('delete', () => {
    it('should delete a game', async () => {
      vi.mocked(apiClient.apiDelete).mockResolvedValueOnce({ message: 'Game deleted successfully' });

      await gameApi.delete('123');

      expect(apiClient.apiDelete).toHaveBeenCalledWith('/games/123');
    });
  });

  describe('submitScore', () => {
    it('should submit a game score for authenticated student', async () => {
      const scoreData = {
        source: 'memory-game-123',
        points: 850,
        studentId: 'student-456',
        teacherId: 'teacher-789'
      };

      const mockScoreRecord = {
        id: 'score-1',
        ...scoreData,
        createdAt: new Date(),
      };

      vi.mocked(apiClient.apiPost).mockResolvedValueOnce({ data: mockScoreRecord });

      const result = await gameApi.submitScore(scoreData);

      expect(apiClient.apiPost).toHaveBeenCalledWith('/game-scores', scoreData);
      expect(result).toEqual(mockScoreRecord);
    });

    it('should handle different point values', async () => {
      const scoreData = {
        source: 'wheel-game-456',
        points: 1200,
        studentId: 'student-456',
        teacherId: 'teacher-789'
      };

      const mockScoreRecord = {
        id: 'score-2',
        ...scoreData,
        createdAt: new Date(),
      };

      vi.mocked(apiClient.apiPost).mockResolvedValueOnce({ data: mockScoreRecord });

      const result = await gameApi.submitScore(scoreData);

      expect(apiClient.apiPost).toHaveBeenCalledWith('/game-scores', scoreData);
      expect(result).toEqual(mockScoreRecord);
    });
  });

  describe('getLeaderboard', () => {
    it('should fetch leaderboard for a teacher without authentication', async () => {
      const mockLeaderboard = [
        { rank: 1, studentName: 'Ahmed Ali', totalPoints: 2500 },
        { rank: 2, studentName: 'Fatima Hassan', totalPoints: 2100 },
        { rank: 3, studentName: 'Omar Ibrahim', totalPoints: 1800 },
      ];

      vi.mocked(apiClient.apiGet).mockResolvedValueOnce({ data: mockLeaderboard });

      const result = await gameApi.getLeaderboard('teacher-789');

      expect(apiClient.apiGet).toHaveBeenCalledWith(
        '/game-scores/leaderboard/teacher-789',
        undefined,
        { requireAuth: false }
      );
      expect(result).toEqual(mockLeaderboard);
    });

    it('should return empty leaderboard if no scores exist', async () => {
      const mockLeaderboard: any[] = [];

      vi.mocked(apiClient.apiGet).mockResolvedValueOnce({ data: mockLeaderboard });

      const result = await gameApi.getLeaderboard('teacher-new');

      expect(apiClient.apiGet).toHaveBeenCalledWith(
        '/game-scores/leaderboard/teacher-new',
        undefined,
        { requireAuth: false }
      );
      expect(result).toEqual([]);
    });
  });
});
