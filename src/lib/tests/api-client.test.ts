/**
 * Unit tests for API Client utilities
 * Tests the apiFetch function, helper functions, and ApiError class
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  apiFetch,
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  ApiError,
  buildQueryString,
} from '../api-client.js';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch as any;

describe('api-client', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('ApiError', () => {
    it('should create an ApiError with status, message, and details', () => {
      const error = new ApiError(404, 'Not found', { resource: 'quiz' });
      
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('ApiError');
      expect(error.status).toBe(404);
      expect(error.message).toBe('Not found');
      expect(error.details).toEqual({ resource: 'quiz' });
    });

    it('should work without details', () => {
      const error = new ApiError(500, 'Server error');
      
      expect(error.status).toBe(500);
      expect(error.message).toBe('Server error');
      expect(error.details).toBeUndefined();
    });
  });

  describe('buildQueryString', () => {
    it('should build query string from params object', () => {
      const params = { teacherId: '123', limit: 10, search: 'test' };
      const result = buildQueryString(params);
      
      expect(result).toBe('teacherId=123&limit=10&search=test');
    });

    it('should filter out undefined and null values', () => {
      const params = { teacherId: '123', limit: undefined, search: null };
      const result = buildQueryString(params);
      
      expect(result).toBe('teacherId=123');
    });

    it('should URL encode parameter values', () => {
      const params = { name: 'John Doe', email: 'test@example.com' };
      const result = buildQueryString(params);
      
      expect(result).toContain('John%20Doe');
      expect(result).toContain('test%40example.com');
    });

    it('should return empty string for empty params', () => {
      const result = buildQueryString({});
      expect(result).toBe('');
    });
  });

  describe('apiFetch', () => {
    it('should make successful GET request and return data', async () => {
      const mockData = { id: '123', title: 'Test Quiz' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockData }),
      });

      const result = await apiFetch('/quizzes/123');

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/quizzes/123',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          credentials: 'include',
        })
      );
      expect(result).toEqual(mockData);
    });

    it('should add /api prefix to endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      await apiFetch('/quizzes');

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/quizzes',
        expect.any(Object)
      );
    });

    it('should handle endpoint without leading slash', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      await apiFetch('quizzes');

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/quizzes',
        expect.any(Object)
      );
    });

    it('should include credentials for authentication', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: {} }),
      });

      await apiFetch('/quizzes', { requireAuth: true });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          credentials: 'include',
        })
      );
    });

    it('should throw ApiError on 404 response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({
          error: 'Not found',
          message: 'Quiz not found',
        }),
      });

      await expect(apiFetch('/quizzes/999')).rejects.toThrow(ApiError);
      await expect(apiFetch('/quizzes/999')).rejects.toMatchObject({
        status: 404,
        message: 'Not found',
      });
    });

    it('should throw ApiError on 401 unauthorized', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          error: 'Unauthorized',
          message: 'Authentication required',
        }),
      });

      await expect(apiFetch('/quizzes')).rejects.toMatchObject({
        status: 401,
        message: 'Unauthorized',
      });
    });

    it('should throw ApiError on 500 server error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          error: 'Internal server error',
          message: 'Database connection failed',
        }),
      });

      await expect(apiFetch('/quizzes')).rejects.toMatchObject({
        status: 500,
        message: 'Internal server error',
      });
    });

    it('should handle error response without JSON body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      await expect(apiFetch('/quizzes')).rejects.toMatchObject({
        status: 500,
        message: 'Internal Server Error',
      });
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(apiFetch('/quizzes')).rejects.toMatchObject({
        status: 0,
        message: 'Network error',
      });
    });

    it('should return full response if no data field', async () => {
      const mockResponse = { message: 'Success', count: 5 };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await apiFetch('/quizzes');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('apiGet', () => {
    it('should make GET request with query parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      await apiGet('/quizzes', { teacherId: '123', limit: 10 });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/quizzes?teacherId=123&limit=10',
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('should work without query parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      await apiGet('/quizzes');

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/quizzes',
        expect.objectContaining({
          method: 'GET',
        })
      );
    });
  });

  describe('apiPost', () => {
    it('should make POST request with JSON body', async () => {
      const postData = { title: 'New Quiz', questions: [] };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { id: '123', ...postData } }),
      });

      await apiPost('/quizzes', postData);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/quizzes',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(postData),
        })
      );
    });
  });

  describe('apiPut', () => {
    it('should make PUT request with JSON body', async () => {
      const updateData = { title: 'Updated Quiz' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { id: '123', ...updateData } }),
      });

      await apiPut('/quizzes/123', updateData);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/quizzes/123',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(updateData),
        })
      );
    });
  });

  describe('apiDelete', () => {
    it('should make DELETE request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Deleted successfully' }),
      });

      await apiDelete('/quizzes/123');

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/quizzes/123',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  describe('requireAuth option', () => {
    it('should include credentials when requireAuth is true (default)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: {} }),
      });

      await apiFetch('/quizzes', { requireAuth: true });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          credentials: 'include',
        })
      );
    });

    it('should include credentials when requireAuth is false (for public endpoints)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: {} }),
      });

      await apiFetch('/profiles/by-slug/teacher', { requireAuth: false });

      // Even for public endpoints, credentials are included
      // This allows optional authentication (user may or may not be logged in)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          credentials: 'include',
        })
      );
    });
  });
});
