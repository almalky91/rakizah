import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextApiRequest, NextApiResponse } from 'next';
import handler from './[id]';

// Mock dependencies
vi.mock('@/db', () => ({
  db: {
    select: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('@/lib/auth-helpers', () => ({
  requireAuth: vi.fn(),
  requireOwnership: vi.fn(),
}));

import { db } from '@/db';
import { requireOwnership } from '@/lib/auth-helpers';

describe('Profile API Route - /api/profiles/[id]', () => {
  let req: Partial<NextApiRequest>;
  let res: Partial<NextApiResponse>;
  let jsonMock: ReturnType<typeof vi.fn>;
  let statusMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Setup response mock
    jsonMock = vi.fn();
    statusMock = vi.fn(() => ({ json: jsonMock }));

    res = {
      status: statusMock,
      json: jsonMock,
    };
  });

  describe('GET /api/profiles/[id]', () => {
    it('should return profile data for valid ID', async () => {
      const mockProfile = {
        id: '123',
        email: 'test@example.com',
        fullName: 'Test User',
        bio: 'Test bio',
        phoneNumber: '1234567890',
        schoolName: 'Test School',
        publicSlug: 'test-user',
        pageTitle: 'Test Page',
        pageTemplate: 'default',
        subscriptionActive: false,
        subscriptionEndsAt: null,
        trialEndsAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock database query
      const fromMock = vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([mockProfile]),
        }),
      });
      (db.select as any).mockReturnValue({ from: fromMock });

      req = {
        method: 'GET',
        query: { id: '123' },
      };

      await handler(req as NextApiRequest, res as NextApiResponse);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({ data: mockProfile });
    });

    it('should return 404 when profile not found', async () => {
      // Mock database query returning empty array
      const fromMock = vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      });
      (db.select as any).mockReturnValue({ from: fromMock });

      req = {
        method: 'GET',
        query: { id: 'non-existent' },
      };

      await handler(req as NextApiRequest, res as NextApiResponse);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Profile not found' });
    });

    it('should return 400 for invalid ID parameter', async () => {
      req = {
        method: 'GET',
        query: { id: ['invalid', 'array'] },
      };

      await handler(req as NextApiRequest, res as NextApiResponse);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid profile ID' });
    });
  });

  describe('PUT /api/profiles/[id]', () => {
    it('should update profile when user is owner', async () => {
      const mockExistingProfile = {
        id: '123',
        email: 'test@example.com',
        fullName: 'Test User',
        publicSlug: 'test-user',
      };

      const mockUpdatedProfile = {
        ...mockExistingProfile,
        fullName: 'Updated Name',
        bio: 'Updated bio',
        updatedAt: new Date(),
      };

      // Mock existing profile check
      const selectMock = vi.fn();
      selectMock.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockExistingProfile]),
          }),
        }),
      });

      // Mock updated profile fetch
      selectMock.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockUpdatedProfile]),
          }),
        }),
      });

      (db.select as any).mockImplementation(selectMock);

      // Mock update
      (db.update as any).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      });

      // Mock authorization (user is owner)
      (requireOwnership as any).mockResolvedValue({
        user: { id: '123', role: 'teacher' },
      });

      req = {
        method: 'PUT',
        query: { id: '123' },
        body: {
          fullName: 'Updated Name',
          bio: 'Updated bio',
        },
      };

      await handler(req as NextApiRequest, res as NextApiResponse);

      expect(requireOwnership).toHaveBeenCalledWith(req, res, '123');
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        data: expect.objectContaining({
          fullName: 'Updated Name',
          bio: 'Updated bio',
        }),
        message: 'Profile updated successfully',
      });
    });

    it('should return 404 when profile does not exist', async () => {
      // Mock empty profile check
      (db.select as any).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      req = {
        method: 'PUT',
        query: { id: 'non-existent' },
        body: { fullName: 'Updated Name' },
      };

      await handler(req as NextApiRequest, res as NextApiResponse);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Profile not found' });
    });

    it('should return 401 when user is not authenticated', async () => {
      const mockExistingProfile = {
        id: '123',
        email: 'test@example.com',
        publicSlug: 'test-user',
      };

      (db.select as any).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockExistingProfile]),
          }),
        }),
      });

      // Mock requireOwnership returning null (unauthorized)
      (requireOwnership as any).mockResolvedValue(null);

      req = {
        method: 'PUT',
        query: { id: '123' },
        body: { fullName: 'Updated Name' },
      };

      await handler(req as NextApiRequest, res as NextApiResponse);

      expect(requireOwnership).toHaveBeenCalledWith(req, res, '123');
      // requireOwnership sends the response, so handler should return early
    });

    it('should return 400 for invalid input data', async () => {
      const mockExistingProfile = {
        id: '123',
        email: 'test@example.com',
      };

      (db.select as any).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockExistingProfile]),
          }),
        }),
      });

      (requireOwnership as any).mockResolvedValue({
        user: { id: '123', role: 'teacher' },
      });

      req = {
        method: 'PUT',
        query: { id: '123' },
        body: {
          fullName: 'a', // Too short
        },
      };

      await handler(req as NextApiRequest, res as NextApiResponse);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Invalid input',
          details: expect.any(Array),
        })
      );
    });

    it('should return 400 when publicSlug is already taken', async () => {
      const mockExistingProfile = {
        id: '123',
        email: 'test@example.com',
        publicSlug: 'old-slug',
      };

      const mockSlugConflict = {
        id: '456',
        publicSlug: 'new-slug',
      };

      const selectMock = vi.fn();
      
      // First call: existing profile check
      selectMock.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockExistingProfile]),
          }),
        }),
      });

      // Second call: slug conflict check
      selectMock.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockSlugConflict]),
          }),
        }),
      });

      (db.select as any).mockImplementation(selectMock);

      (requireOwnership as any).mockResolvedValue({
        user: { id: '123', role: 'teacher' },
      });

      req = {
        method: 'PUT',
        query: { id: '123' },
        body: {
          publicSlug: 'new-slug',
        },
      };

      await handler(req as NextApiRequest, res as NextApiResponse);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Public slug already taken' });
    });

    it('should return 400 when email is already taken', async () => {
      const mockExistingProfile = {
        id: '123',
        email: 'old@example.com',
        publicSlug: 'test-slug',
      };

      const mockEmailConflict = {
        id: '456',
        email: 'new@example.com',
      };

      const selectMock = vi.fn();
      
      // First call: existing profile check
      selectMock.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockExistingProfile]),
          }),
        }),
      });

      // Second call: email conflict check
      selectMock.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockEmailConflict]),
          }),
        }),
      });

      (db.select as any).mockImplementation(selectMock);

      (requireOwnership as any).mockResolvedValue({
        user: { id: '123', role: 'teacher' },
      });

      req = {
        method: 'PUT',
        query: { id: '123' },
        body: {
          email: 'new@example.com',
        },
      };

      await handler(req as NextApiRequest, res as NextApiResponse);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Email already taken' });
    });
  });

  describe('Unsupported Methods', () => {
    it('should return 405 for POST method', async () => {
      req = {
        method: 'POST',
        query: { id: '123' },
      };

      await handler(req as NextApiRequest, res as NextApiResponse);

      expect(statusMock).toHaveBeenCalledWith(405);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Method not allowed' });
    });

    it('should return 405 for DELETE method', async () => {
      req = {
        method: 'DELETE',
        query: { id: '123' },
      };

      await handler(req as NextApiRequest, res as NextApiResponse);

      expect(statusMock).toHaveBeenCalledWith(405);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Method not allowed' });
    });
  });
});
