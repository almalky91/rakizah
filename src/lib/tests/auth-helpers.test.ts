/**
 * Unit tests for auth-helpers.ts
 * 
 * These tests verify the authorization helper functions work correctly
 * with NextAuth sessions and properly enforce authentication/authorization rules.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextApiRequest, NextApiResponse } from 'next';
import { Session } from 'next-auth';
import { requireAuth, requireRole, requireOwnership } from '../auth-helpers.js';
import * as NextAuth from 'next-auth/next';

// Mock getServerSession
vi.mock('next-auth/next', () => ({
  getServerSession: vi.fn(),
}));

// Mock authOptions import
vi.mock('@/lib/auth', () => ({
  authOptions: {},
}));

describe('auth-helpers', () => {
  let mockReq: Partial<NextApiRequest>;
  let mockRes: Partial<NextApiResponse>;
  let mockJson: ReturnType<typeof vi.fn>;
  let mockStatus: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Setup mock request and response objects
    mockReq = {};
    mockJson = vi.fn();
    mockStatus = vi.fn().mockReturnValue({ json: mockJson });
    mockRes = {
      status: mockStatus,
      json: mockJson,
    };
  });

  describe('requireAuth', () => {
    it('should return session when user is authenticated', async () => {
      const mockSession: Session = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'student',
        },
        expires: '2024-12-31',
      };

      vi.mocked(NextAuth.getServerSession).mockResolvedValue(mockSession);

      const result = await requireAuth(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(result).toEqual(mockSession);
      expect(mockStatus).not.toHaveBeenCalled();
    });

    it('should return null and send 401 when no session exists', async () => {
      vi.mocked(NextAuth.getServerSession).mockResolvedValue(null);

      const result = await requireAuth(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(result).toBeNull();
      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Unauthorized: Authentication required',
      });
    });

    it('should return null and send 401 when session has no user', async () => {
      const invalidSession = {
        expires: '2024-12-31',
      } as Session;

      vi.mocked(NextAuth.getServerSession).mockResolvedValue(invalidSession);

      const result = await requireAuth(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(result).toBeNull();
      expect(mockStatus).toHaveBeenCalledWith(401);
    });
  });

  describe('requireRole', () => {
    it('should return session when user has allowed role', async () => {
      const mockSession: Session = {
        user: {
          id: 'user-123',
          email: 'teacher@example.com',
          name: 'Teacher User',
          role: 'teacher',
        },
        expires: '2024-12-31',
      };

      vi.mocked(NextAuth.getServerSession).mockResolvedValue(mockSession);

      const result = await requireRole(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse,
        ['teacher', 'admin']
      );

      expect(result).toEqual(mockSession);
      expect(mockStatus).not.toHaveBeenCalledWith(403);
    });

    it('should return null and send 403 when user lacks required role', async () => {
      const mockSession: Session = {
        user: {
          id: 'user-123',
          email: 'student@example.com',
          name: 'Student User',
          role: 'student',
        },
        expires: '2024-12-31',
      };

      vi.mocked(NextAuth.getServerSession).mockResolvedValue(mockSession);

      const result = await requireRole(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse,
        ['teacher', 'admin']
      );

      expect(result).toBeNull();
      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Forbidden: Insufficient permissions',
        required: ['teacher', 'admin'],
        current: 'student',
      });
    });

    it('should return null and send 401 when not authenticated', async () => {
      vi.mocked(NextAuth.getServerSession).mockResolvedValue(null);

      const result = await requireRole(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse,
        ['teacher']
      );

      expect(result).toBeNull();
      expect(mockStatus).toHaveBeenCalledWith(401);
    });

    it('should allow admin role', async () => {
      const mockSession: Session = {
        user: {
          id: 'admin-123',
          email: 'admin@example.com',
          name: 'Admin User',
          role: 'admin',
        },
        expires: '2024-12-31',
      };

      vi.mocked(NextAuth.getServerSession).mockResolvedValue(mockSession);

      const result = await requireRole(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse,
        ['admin']
      );

      expect(result).toEqual(mockSession);
    });
  });

  describe('requireOwnership', () => {
    it('should return session when user owns the resource', async () => {
      const mockSession: Session = {
        user: {
          id: 'user-123',
          email: 'teacher@example.com',
          name: 'Teacher User',
          role: 'teacher',
        },
        expires: '2024-12-31',
      };

      vi.mocked(NextAuth.getServerSession).mockResolvedValue(mockSession);

      const result = await requireOwnership(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse,
        'user-123' // Same as session user ID
      );

      expect(result).toEqual(mockSession);
      expect(mockStatus).not.toHaveBeenCalledWith(403);
    });

    it('should return null and send 403 when user does not own resource', async () => {
      const mockSession: Session = {
        user: {
          id: 'user-123',
          email: 'teacher@example.com',
          name: 'Teacher User',
          role: 'teacher',
        },
        expires: '2024-12-31',
      };

      vi.mocked(NextAuth.getServerSession).mockResolvedValue(mockSession);

      const result = await requireOwnership(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse,
        'different-user-456' // Different from session user ID
      );

      expect(result).toBeNull();
      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Forbidden: You do not own this resource',
      });
    });

    it('should allow admin to access any resource', async () => {
      const mockSession: Session = {
        user: {
          id: 'admin-123',
          email: 'admin@example.com',
          name: 'Admin User',
          role: 'admin',
        },
        expires: '2024-12-31',
      };

      vi.mocked(NextAuth.getServerSession).mockResolvedValue(mockSession);

      const result = await requireOwnership(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse,
        'different-user-456' // Admin can access any resource
      );

      expect(result).toEqual(mockSession);
      expect(mockStatus).not.toHaveBeenCalledWith(403);
    });

    it('should return null and send 401 when not authenticated', async () => {
      vi.mocked(NextAuth.getServerSession).mockResolvedValue(null);

      const result = await requireOwnership(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse,
        'user-123'
      );

      expect(result).toBeNull();
      expect(mockStatus).toHaveBeenCalledWith(401);
    });
  });
});
