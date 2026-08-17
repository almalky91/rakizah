/**
 * Unit tests for Video API Client
 * Tests video CRUD operations and view tracking
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { videoApi } from '../videoApi.js';
import * as apiClient from '../api-client.js';

// Mock the API client functions
vi.mock('./api-client', () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiPut: vi.fn(),
  apiDelete: vi.fn(),
}));

describe('videoApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('list', () => {
    it('should fetch all videos without filter', async () => {
      const mockVideos = [
        { id: '1', teacherId: 't1', title: 'Video 1', youtubeUrl: 'https://youtube.com/1', views: 10, createdAt: new Date() },
        { id: '2', teacherId: 't2', title: 'Video 2', youtubeUrl: 'https://youtube.com/2', views: 5, createdAt: new Date() },
      ];

      vi.mocked(apiClient.apiGet).mockResolvedValueOnce({ data: mockVideos });

      const result = await videoApi.list();

      expect(apiClient.apiGet).toHaveBeenCalledWith('/videos', undefined);
      expect(result).toEqual(mockVideos);
    });

    it('should fetch videos filtered by teacherId', async () => {
      const mockVideos = [
        { id: '1', teacherId: 't1', title: 'Video 1', youtubeUrl: 'https://youtube.com/1', views: 10, createdAt: new Date() },
      ];

      vi.mocked(apiClient.apiGet).mockResolvedValueOnce({ data: mockVideos });

      const result = await videoApi.list('t1');

      expect(apiClient.apiGet).toHaveBeenCalledWith('/videos', { teacherId: 't1' });
      expect(result).toEqual(mockVideos);
    });
  });

  describe('get', () => {
    it('should fetch a single video by ID with anonymous access', async () => {
      const mockVideo = {
        id: '123',
        teacherId: 't1',
        title: 'Introduction to Algebra',
        youtubeUrl: 'https://www.youtube.com/watch?v=abc123',
        views: 42,
        createdAt: new Date(),
      };

      vi.mocked(apiClient.apiGet).mockResolvedValueOnce({ data: mockVideo });

      const result = await videoApi.get('123');

      expect(apiClient.apiGet).toHaveBeenCalledWith('/videos/123', undefined, {
        requireAuth: false,
      });
      expect(result).toEqual(mockVideo);
    });
  });

  describe('create', () => {
    it('should create a new video', async () => {
      const newVideoData = {
        title: 'Introduction to Calculus',
        youtubeUrl: 'https://www.youtube.com/watch?v=xyz789',
      };

      const mockCreatedVideo = {
        id: '456',
        teacherId: 't1',
        ...newVideoData,
        views: 0,
        createdAt: new Date(),
      };

      vi.mocked(apiClient.apiPost).mockResolvedValueOnce({ data: mockCreatedVideo });

      const result = await videoApi.create(newVideoData);

      expect(apiClient.apiPost).toHaveBeenCalledWith('/videos', newVideoData);
      expect(result).toEqual(mockCreatedVideo);
    });
  });

  describe('update', () => {
    it('should update an existing video title', async () => {
      const updateData = { title: 'Updated Video Title' };
      const mockUpdatedVideo = {
        id: '123',
        teacherId: 't1',
        title: 'Updated Video Title',
        youtubeUrl: 'https://youtube.com/abc',
        views: 10,
        createdAt: new Date(),
      };

      vi.mocked(apiClient.apiPut).mockResolvedValueOnce({ data: mockUpdatedVideo });

      const result = await videoApi.update('123', updateData);

      expect(apiClient.apiPut).toHaveBeenCalledWith('/videos/123', updateData);
      expect(result).toEqual(mockUpdatedVideo);
    });

    it('should update an existing video URL', async () => {
      const updateData = { youtubeUrl: 'https://www.youtube.com/watch?v=newUrl' };
      const mockUpdatedVideo = {
        id: '123',
        teacherId: 't1',
        title: 'Original Title',
        youtubeUrl: 'https://www.youtube.com/watch?v=newUrl',
        views: 10,
        createdAt: new Date(),
      };

      vi.mocked(apiClient.apiPut).mockResolvedValueOnce({ data: mockUpdatedVideo });

      const result = await videoApi.update('123', updateData);

      expect(apiClient.apiPut).toHaveBeenCalledWith('/videos/123', updateData);
      expect(result).toEqual(mockUpdatedVideo);
    });
  });

  describe('delete', () => {
    it('should delete a video', async () => {
      vi.mocked(apiClient.apiDelete).mockResolvedValueOnce({ data: { id: '123' } });

      const result = await videoApi.delete('123');

      expect(apiClient.apiDelete).toHaveBeenCalledWith('/videos/123');
      expect(result).toBe('123');
    });
  });

  describe('trackView', () => {
    it('should track authenticated video view', async () => {
      const mockViewRecord = {
        id: 'view-1',
        videoId: 'video-123',
        studentId: 'student-1',
        teacherId: 'teacher-1',
        viewedAt: new Date(),
      };

      vi.mocked(apiClient.apiPost).mockResolvedValueOnce({ data: mockViewRecord });

      const result = await videoApi.trackView('video-123');

      expect(apiClient.apiPost).toHaveBeenCalledWith('/video-views', { videoId: 'video-123' });
      expect(result).toEqual(mockViewRecord);
    });
  });

  describe('trackPublicView', () => {
    it('should track anonymous video view without authentication', async () => {
      const mockPublicViewRecord = {
        id: 'public-view-1',
        videoId: 'video-123',
        teacherId: 'teacher-1',
        studentName: 'Ahmed Ali',
        viewedAt: new Date(),
      };

      vi.mocked(apiClient.apiPost).mockResolvedValueOnce({ data: mockPublicViewRecord });

      const result = await videoApi.trackPublicView('video-123', 'Ahmed Ali');

      expect(apiClient.apiPost).toHaveBeenCalledWith(
        '/video-views/public',
        { videoId: 'video-123', studentName: 'Ahmed Ali' },
        { requireAuth: false }
      );
      expect(result).toEqual(mockPublicViewRecord);
    });
  });
});
