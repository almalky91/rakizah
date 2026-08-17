/**
 * Unit tests for Quiz API Client
 * Tests quiz CRUD operations and quiz results submission
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { quizApi, quizResultsApi } from '../quizApi.js';
import * as apiClient from '../api-client.js';

// Mock the API client functions
vi.mock('./api-client', () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiPut: vi.fn(),
  apiDelete: vi.fn(),
}));

describe('quizApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('list', () => {
    it('should fetch all quizzes without filter', async () => {
      const mockQuizzes = [
        { id: '1', teacherId: 't1', title: 'Quiz 1', questions: [], createdAt: new Date() },
        { id: '2', teacherId: 't2', title: 'Quiz 2', questions: [], createdAt: new Date() },
      ];

      vi.mocked(apiClient.apiGet).mockResolvedValueOnce({ data: mockQuizzes });

      const result = await quizApi.list();

      expect(apiClient.apiGet).toHaveBeenCalledWith('/quizzes', undefined);
      expect(result).toEqual(mockQuizzes);
    });

    it('should fetch quizzes filtered by teacherId', async () => {
      const mockQuizzes = [
        { id: '1', teacherId: 't1', title: 'Quiz 1', questions: [], createdAt: new Date() },
      ];

      vi.mocked(apiClient.apiGet).mockResolvedValueOnce({ data: mockQuizzes });

      const result = await quizApi.list('t1');

      expect(apiClient.apiGet).toHaveBeenCalledWith('/quizzes', { teacherId: 't1' });
      expect(result).toEqual(mockQuizzes);
    });
  });

  describe('get', () => {
    it('should fetch a single quiz by ID', async () => {
      const mockQuiz = {
        id: '123',
        teacherId: 't1',
        title: 'Math Quiz',
        questions: [{ question: 'What is 2+2?', options: ['3', '4'], correctAnswer: '4' }],
        createdAt: new Date(),
      };

      vi.mocked(apiClient.apiGet).mockResolvedValueOnce({ data: mockQuiz });

      const result = await quizApi.get('123');

      expect(apiClient.apiGet).toHaveBeenCalledWith('/quizzes/123');
      expect(result).toEqual(mockQuiz);
    });
  });

  describe('create', () => {
    it('should create a new quiz', async () => {
      const newQuizData = {
        title: 'New Quiz',
        questions: [
          { question: 'What is 2+2?', options: ['3', '4', '5'], correctAnswer: '4' },
        ],
      };

      const mockCreatedQuiz = {
        id: '456',
        teacherId: 't1',
        ...newQuizData,
        createdAt: new Date(),
      };

      vi.mocked(apiClient.apiPost).mockResolvedValueOnce({ data: mockCreatedQuiz });

      const result = await quizApi.create(newQuizData);

      expect(apiClient.apiPost).toHaveBeenCalledWith('/quizzes', newQuizData);
      expect(result).toEqual(mockCreatedQuiz);
    });
  });

  describe('update', () => {
    it('should update an existing quiz', async () => {
      const updateData = { title: 'Updated Quiz Title' };
      const mockUpdatedQuiz = {
        id: '123',
        teacherId: 't1',
        title: 'Updated Quiz Title',
        questions: [],
        createdAt: new Date(),
      };

      vi.mocked(apiClient.apiPut).mockResolvedValueOnce({ data: mockUpdatedQuiz });

      const result = await quizApi.update('123', updateData);

      expect(apiClient.apiPut).toHaveBeenCalledWith('/quizzes/123', updateData);
      expect(result).toEqual(mockUpdatedQuiz);
    });
  });

  describe('delete', () => {
    it('should delete a quiz', async () => {
      vi.mocked(apiClient.apiDelete).mockResolvedValueOnce({ data: { id: '123' } });

      const result = await quizApi.delete('123');

      expect(apiClient.apiDelete).toHaveBeenCalledWith('/quizzes/123');
      expect(result).toBe('123');
    });
  });
});

describe('quizResultsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('submit', () => {
    it('should submit authenticated quiz result', async () => {
      const resultData = {
        quizId: 'quiz-123',
        score: 8,
        answers: ['4', '5', '6'],
      };

      const mockResult = {
        id: 'result-1',
        quizId: 'quiz-123',
        studentId: 'student-1',
        teacherId: 'teacher-1',
        score: 8,
        answers: ['4', '5', '6'],
        createdAt: new Date(),
      };

      vi.mocked(apiClient.apiPost).mockResolvedValueOnce({ data: mockResult });

      const result = await quizResultsApi.submit(resultData);

      expect(apiClient.apiPost).toHaveBeenCalledWith('/quiz-results', resultData);
      expect(result).toEqual(mockResult);
    });
  });

  describe('submitPublic', () => {
    it('should submit public quiz result without authentication', async () => {
      const publicResultData = {
        quizId: 'quiz-123',
        studentName: 'Ahmed Ali',
        score: 9,
        totalQuestions: 10,
        answers: ['4', '5', '6'],
      };

      const mockResult = {
        id: 'public-result-1',
        quizId: 'quiz-123',
        teacherId: 'teacher-1',
        studentName: 'Ahmed Ali',
        score: 9,
        totalQuestions: 10,
        answers: ['4', '5', '6'],
        createdAt: new Date(),
      };

      vi.mocked(apiClient.apiPost).mockResolvedValueOnce({ data: mockResult });

      const result = await quizResultsApi.submitPublic(publicResultData);

      expect(apiClient.apiPost).toHaveBeenCalledWith(
        '/quiz-results/public',
        publicResultData,
        { requireAuth: false }
      );
      expect(result).toEqual(mockResult);
    });
  });
});
