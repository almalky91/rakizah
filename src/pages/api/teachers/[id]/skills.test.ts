import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextApiRequest, NextApiResponse } from 'next';
import handler from './skills';
import { db } from '@/db';
import * as authHelpers from '@/lib/auth-helpers';

// Mock the database module
vi.mock('@/db', () => ({
  db: {
    select: vi.fn(),
    delete: vi.fn(),
    insert: vi.fn(),
  },
}));

// Mock auth helpers
vi.mock('@/lib/auth-helpers', () => ({
  requireAuth: vi.fn(),
}));

describe('GET /api/teachers/[id]/skills', () => {
  let req: Partial<NextApiRequest>;
  let res: Partial<NextApiResponse>;
  let jsonMock: ReturnType<typeof vi.fn>;
  let statusMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    
    jsonMock = vi.fn();
    statusMock = vi.fn(() => ({ json: jsonMock }));
    
    req = {
      method: 'GET',
      query: { id: 'teacher-123' },
    };
    
    res = {
      status: statusMock as any,
      json: jsonMock,
    };
  });

  it('should return 400 for invalid teacher ID', async () => {
    req.query = { id: ['invalid', 'array'] };
    
    await handler(req as NextApiRequest, res as NextApiResponse);
    
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid teacher ID' });
  });

  it('should return 404 when teacher does not exist', async () => {
    // Mock teacher not found
    const limitMock = vi.fn().mockResolvedValue([]);
    const whereMock = vi.fn(() => ({ limit: limitMock }));
    const fromMock = vi.fn(() => ({ where: whereMock }));
    vi.mocked(db.select).mockReturnValue({ from: fromMock } as any);

    await handler(req as NextApiRequest, res as NextApiResponse);

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Teacher not found' });
  });

  it('should return 400 when user is not a teacher', async () => {
    // Mock teacher profile exists
    const limitMock1 = vi.fn().mockResolvedValue([{ id: 'teacher-123', fullName: 'John Doe' }]);
    const whereMock1 = vi.fn(() => ({ limit: limitMock1 }));
    const fromMock1 = vi.fn(() => ({ where: whereMock1 }));
    
    // Mock role check returns empty (not a teacher)
    const limitMock2 = vi.fn().mockResolvedValue([]);
    const whereMock2 = vi.fn(() => ({ limit: limitMock2 }));
    const fromMock2 = vi.fn(() => ({ where: whereMock2 }));
    
    vi.mocked(db.select)
      .mockReturnValueOnce({ from: fromMock1 } as any)
      .mockReturnValueOnce({ from: fromMock2 } as any);

    await handler(req as NextApiRequest, res as NextApiResponse);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'User is not a teacher' });
  });

  it('should return teacher skills with complete hierarchy', async () => {
    // Mock teacher exists and has teacher role
    const limitMock1 = vi.fn().mockResolvedValue([{ id: 'teacher-123', fullName: 'John Doe' }]);
    const whereMock1 = vi.fn(() => ({ limit: limitMock1 }));
    const fromMock1 = vi.fn(() => ({ where: whereMock1 }));
    
    const limitMock2 = vi.fn().mockResolvedValue([{ id: 'role-1', userId: 'teacher-123', role: 'teacher' }]);
    const whereMock2 = vi.fn(() => ({ limit: limitMock2 }));
    const fromMock2 = vi.fn(() => ({ where: whereMock2 }));
    
    // Mock teacher skills query
    const mockSkillsData = [
      {
        teacherSkillId: 'ts-1',
        teacherSkillCreatedAt: new Date('2024-01-01'),
        skill: {
          id: 'skill-1',
          fieldId: 'field-1',
          gradeId: 'grade-1',
          skillNumber: 1,
          title: 'Addition basics',
          difficultyLevel: 'basic',
          displayOrder: 1,
          createdAt: new Date('2024-01-01'),
        },
        field: {
          id: 'field-1',
          name: 'Math',
          displayOrder: 1,
        },
        grade: {
          id: 'grade-1',
          name: 'Grade 1',
          displayOrder: 1,
        },
      },
    ];
    
    const whereMock3 = vi.fn().mockResolvedValue(mockSkillsData);
    const innerJoinMock3 = vi.fn(() => ({ where: whereMock3 }));
    const innerJoinMock2 = vi.fn(() => ({ innerJoin: innerJoinMock3 }));
    const innerJoinMock1 = vi.fn(() => ({ innerJoin: innerJoinMock2 }));
    const fromMock3 = vi.fn(() => ({ innerJoin: innerJoinMock1 }));
    
    vi.mocked(db.select)
      .mockReturnValueOnce({ from: fromMock1 } as any)
      .mockReturnValueOnce({ from: fromMock2 } as any)
      .mockReturnValueOnce({ from: fromMock3 } as any);

    await handler(req as NextApiRequest, res as NextApiResponse);

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({
      data: [
        {
          id: 'skill-1',
          skillNumber: 1,
          title: 'Addition basics',
          difficultyLevel: 'basic',
          displayOrder: 1,
          createdAt: expect.any(Date),
          field: {
            id: 'field-1',
            name: 'Math',
            displayOrder: 1,
          },
          grade: {
            id: 'grade-1',
            name: 'Grade 1',
            displayOrder: 1,
          },
          assignedAt: expect.any(Date),
        },
      ],
      message: 'Teacher skills retrieved successfully',
    });
  });

  it('should return empty array when teacher has no skills', async () => {
    // Mock teacher exists and has teacher role
    const limitMock1 = vi.fn().mockResolvedValue([{ id: 'teacher-123', fullName: 'John Doe' }]);
    const whereMock1 = vi.fn(() => ({ limit: limitMock1 }));
    const fromMock1 = vi.fn(() => ({ where: whereMock1 }));
    
    const limitMock2 = vi.fn().mockResolvedValue([{ id: 'role-1', userId: 'teacher-123', role: 'teacher' }]);
    const whereMock2 = vi.fn(() => ({ limit: limitMock2 }));
    const fromMock2 = vi.fn(() => ({ where: whereMock2 }));
    
    // Mock empty skills query
    const whereMock3 = vi.fn().mockResolvedValue([]);
    const innerJoinMock3 = vi.fn(() => ({ where: whereMock3 }));
    const innerJoinMock2 = vi.fn(() => ({ innerJoin: innerJoinMock3 }));
    const innerJoinMock1 = vi.fn(() => ({ innerJoin: innerJoinMock2 }));
    const fromMock3 = vi.fn(() => ({ innerJoin: innerJoinMock1 }));
    
    vi.mocked(db.select)
      .mockReturnValueOnce({ from: fromMock1 } as any)
      .mockReturnValueOnce({ from: fromMock2 } as any)
      .mockReturnValueOnce({ from: fromMock3 } as any);

    await handler(req as NextApiRequest, res as NextApiResponse);

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({
      data: [],
      message: 'Teacher skills retrieved successfully',
    });
  });
});

describe('PUT /api/teachers/[id]/skills', () => {
  let req: Partial<NextApiRequest>;
  let res: Partial<NextApiResponse>;
  let jsonMock: ReturnType<typeof vi.fn>;
  let statusMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    
    jsonMock = vi.fn();
    statusMock = vi.fn(() => ({ json: jsonMock }));
    
    req = {
      method: 'PUT',
      query: { id: 'teacher-123' },
      body: { skillIds: ['550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'] },
    };
    
    res = {
      status: statusMock as any,
      json: jsonMock,
    };

    // Set up default mocks for teacher validation (used in all PUT tests)
    const limitMock1 = vi.fn().mockResolvedValue([{ id: 'teacher-123', fullName: 'John Doe' }]);
    const whereMock1 = vi.fn(() => ({ limit: limitMock1 }));
    const fromMock1 = vi.fn(() => ({ where: whereMock1 }));
    
    const limitMock2 = vi.fn().mockResolvedValue([{ id: 'role-1', userId: 'teacher-123', role: 'teacher' }]);
    const whereMock2 = vi.fn(() => ({ limit: limitMock2 }));
    const fromMock2 = vi.fn(() => ({ where: whereMock2 }));
    
    // First two calls are for teacher validation
    vi.mocked(db.select)
      .mockReturnValueOnce({ from: fromMock1 } as any)
      .mockReturnValueOnce({ from: fromMock2 } as any);
  });

  it('should return 401 when not authenticated', async () => {
    // Mock teacher exists and has teacher role
    const limitMock1 = vi.fn().mockResolvedValue([{ id: 'teacher-123', fullName: 'John Doe' }]);
    const whereMock1 = vi.fn(() => ({ limit: limitMock1 }));
    const fromMock1 = vi.fn(() => ({ where: whereMock1 }));
    
    const limitMock2 = vi.fn().mockResolvedValue([{ id: 'role-1', userId: 'teacher-123', role: 'teacher' }]);
    const whereMock2 = vi.fn(() => ({ limit: limitMock2 }));
    const fromMock2 = vi.fn(() => ({ where: whereMock2 }));
    
    vi.mocked(db.select)
      .mockReturnValueOnce({ from: fromMock1 } as any)
      .mockReturnValueOnce({ from: fromMock2 } as any);

    // Mock requireAuth returns null (not authenticated)
    vi.mocked(authHelpers.requireAuth).mockResolvedValue(null);

    await handler(req as NextApiRequest, res as NextApiResponse);

    expect(authHelpers.requireAuth).toHaveBeenCalled();
    // requireAuth sends the response, so we shouldn't check further
  });

  it('should return 403 when user is not admin or the teacher themselves', async () => {
    // Mock teacher exists and has teacher role
    const limitMock1 = vi.fn().mockResolvedValue([{ id: 'teacher-123', fullName: 'John Doe' }]);
    const whereMock1 = vi.fn(() => ({ limit: limitMock1 }));
    const fromMock1 = vi.fn(() => ({ where: whereMock1 }));
    
    const limitMock2 = vi.fn().mockResolvedValue([{ id: 'role-1', userId: 'teacher-123', role: 'teacher' }]);
    const whereMock2 = vi.fn(() => ({ limit: limitMock2 }));
    const fromMock2 = vi.fn(() => ({ where: whereMock2 }));
    
    vi.mocked(db.select)
      .mockReturnValueOnce({ from: fromMock1 } as any)
      .mockReturnValueOnce({ from: fromMock2 } as any);

    // Mock requireAuth returns different user (not admin, not the teacher)
    vi.mocked(authHelpers.requireAuth).mockResolvedValue({
      user: { id: 'other-user', email: 'other@test.com', role: 'teacher' },
      expires: '2024-12-31',
    } as any);

    await handler(req as NextApiRequest, res as NextApiResponse);

    expect(statusMock).toHaveBeenCalledWith(403);
    expect(jsonMock).toHaveBeenCalledWith({
      error: 'Forbidden: You can only update your own skills unless you are an admin',
    });
  });

  it('should allow admin to update any teacher skills', async () => {
    // Mock teacher exists and has teacher role
    const limitMock1 = vi.fn().mockResolvedValue([{ id: 'teacher-123', fullName: 'John Doe' }]);
    const whereMock1 = vi.fn(() => ({ limit: limitMock1 }));
    const fromMock1 = vi.fn(() => ({ where: whereMock1 }));
    
    const limitMock2 = vi.fn().mockResolvedValue([{ id: 'role-1', userId: 'teacher-123', role: 'teacher' }]);
    const whereMock2 = vi.fn(() => ({ limit: limitMock2 }));
    const fromMock2 = vi.fn(() => ({ where: whereMock2 }));
    
    // Mock skill validation - return all skills (this query doesn't have where clause, just from())
    const fromMock3 = vi.fn().mockResolvedValue([{ id: '550e8400-e29b-41d4-a716-446655440001' }, { id: '550e8400-e29b-41d4-a716-446655440002' }]);
    
    vi.mocked(db.select)
      .mockReturnValueOnce({ from: fromMock1 } as any)
      .mockReturnValueOnce({ from: fromMock2 } as any)
      .mockReturnValueOnce({ from: fromMock3 } as any);

    // Mock admin session
    vi.mocked(authHelpers.requireAuth).mockResolvedValue({
      user: { id: 'admin-user', email: 'admin@test.com', role: 'admin' },
      expires: '2024-12-31',
    } as any);

    // Mock delete and insert operations
    const whereMock4 = vi.fn().mockResolvedValue(undefined);
    vi.mocked(db.delete).mockReturnValue({ where: whereMock4 } as any);
    
    const valuesMock = vi.fn().mockResolvedValue(undefined);
    vi.mocked(db.insert).mockReturnValue({ values: valuesMock } as any);

    await handler(req as NextApiRequest, res as NextApiResponse);

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({
      message: 'Teacher skills updated successfully',
      data: {
        teacherId: 'teacher-123',
        skillCount: 2,
      },
    });
  });

  it('should allow teacher to update their own skills', async () => {
    // Mock teacher exists and has teacher role
    const limitMock1 = vi.fn().mockResolvedValue([{ id: 'teacher-123', fullName: 'John Doe' }]);
    const whereMock1 = vi.fn(() => ({ limit: limitMock1 }));
    const fromMock1 = vi.fn(() => ({ where: whereMock1 }));
    
    const limitMock2 = vi.fn().mockResolvedValue([{ id: 'role-1', userId: 'teacher-123', role: 'teacher' }]);
    const whereMock2 = vi.fn(() => ({ limit: limitMock2 }));
    const fromMock2 = vi.fn(() => ({ where: whereMock2 }));
    
    // Mock skill validation - return all skills
    const fromMock3 = vi.fn().mockResolvedValue([{ id: '550e8400-e29b-41d4-a716-446655440001' }]);
    
    vi.mocked(db.select)
      .mockReturnValueOnce({ from: fromMock1 } as any)
      .mockReturnValueOnce({ from: fromMock2 } as any)
      .mockReturnValueOnce({ from: fromMock3 } as any);

    // Mock teacher session (same user)
    vi.mocked(authHelpers.requireAuth).mockResolvedValue({
      user: { id: 'teacher-123', email: 'teacher@test.com', role: 'teacher' },
      expires: '2024-12-31',
    } as any);

    // Mock delete and insert operations
    const whereMock4 = vi.fn().mockResolvedValue(undefined);
    vi.mocked(db.delete).mockReturnValue({ where: whereMock4 } as any);
    
    const valuesMock = vi.fn().mockResolvedValue(undefined);
    vi.mocked(db.insert).mockReturnValue({ values: valuesMock } as any);

    req.body = { skillIds: ['550e8400-e29b-41d4-a716-446655440001'] };

    await handler(req as NextApiRequest, res as NextApiResponse);

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({
      message: 'Teacher skills updated successfully',
      data: {
        teacherId: 'teacher-123',
        skillCount: 1,
      },
    });
  });

  it('should return 400 for invalid skill IDs', async () => {
    req.body = { skillIds: ['not-a-uuid'] };

    // Mock teacher exists and has teacher role
    const limitMock1 = vi.fn().mockResolvedValue([{ id: 'teacher-123', fullName: 'John Doe' }]);
    const whereMock1 = vi.fn(() => ({ limit: limitMock1 }));
    const fromMock1 = vi.fn(() => ({ where: whereMock1 }));
    
    const limitMock2 = vi.fn().mockResolvedValue([{ id: 'role-1', userId: 'teacher-123', role: 'teacher' }]);
    const whereMock2 = vi.fn(() => ({ limit: limitMock2 }));
    const fromMock2 = vi.fn(() => ({ where: whereMock2 }));
    
    vi.mocked(db.select)
      .mockReturnValueOnce({ from: fromMock1 } as any)
      .mockReturnValueOnce({ from: fromMock2 } as any);

    vi.mocked(authHelpers.requireAuth).mockResolvedValue({
      user: { id: 'teacher-123', email: 'teacher@test.com', role: 'teacher' },
      expires: '2024-12-31',
    } as any);

    await handler(req as NextApiRequest, res as NextApiResponse);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      error: 'Invalid input',
      details: expect.arrayContaining([
        expect.objectContaining({
          field: expect.any(String),
          message: expect.any(String),
        }),
      ]),
    });
  });

  it('should handle empty skillIds array', async () => {
    // Reset mocks to ensure clean state
    vi.clearAllMocks();
    
    // Mock teacher exists and has teacher role
    const limitMock1 = vi.fn().mockResolvedValue([{ id: 'teacher-123', fullName: 'John Doe' }]);
    const whereMock1 = vi.fn(() => ({ limit: limitMock1 }));
    const fromMock1 = vi.fn(() => ({ where: whereMock1 }));
    
    const limitMock2 = vi.fn().mockResolvedValue([{ id: 'role-1', userId: 'teacher-123', role: 'teacher' }]);
    const whereMock2 = vi.fn(() => ({ limit: limitMock2 }));
    const fromMock2 = vi.fn(() => ({ where: whereMock2 }));
    
    vi.mocked(db.select)
      .mockReturnValueOnce({ from: fromMock1 } as any)
      .mockReturnValueOnce({ from: fromMock2 } as any);

    vi.mocked(authHelpers.requireAuth).mockResolvedValue({
      user: { id: 'teacher-123', email: 'teacher@test.com', role: 'teacher' },
      expires: '2024-12-31',
    } as any);

    // Mock delete operation (no insert needed for empty array)
    const whereMock4 = vi.fn().mockResolvedValue(undefined);
    vi.mocked(db.delete).mockReturnValue({ where: whereMock4 } as any);

    req.body = { skillIds: [] };

    await handler(req as NextApiRequest, res as NextApiResponse);

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({
      message: 'Teacher skills updated successfully',
      data: {
        teacherId: 'teacher-123',
        skillCount: 0,
      },
    });
  });
});

describe('Teacher Skills API - Method Not Allowed', () => {
  let req: Partial<NextApiRequest>;
  let res: Partial<NextApiResponse>;
  let jsonMock: ReturnType<typeof vi.fn>;
  let statusMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    
    jsonMock = vi.fn();
    statusMock = vi.fn(() => ({ json: jsonMock }));
    
    req = {
      method: 'DELETE',
      query: { id: 'teacher-123' },
    };
    
    res = {
      status: statusMock as any,
      json: jsonMock,
    };

    // Mock teacher exists and has teacher role
    const limitMock1 = vi.fn().mockResolvedValue([{ id: 'teacher-123', fullName: 'John Doe' }]);
    const whereMock1 = vi.fn(() => ({ limit: limitMock1 }));
    const fromMock1 = vi.fn(() => ({ where: whereMock1 }));
    
    const limitMock2 = vi.fn().mockResolvedValue([{ id: 'role-1', userId: 'teacher-123', role: 'teacher' }]);
    const whereMock2 = vi.fn(() => ({ limit: limitMock2 }));
    const fromMock2 = vi.fn(() => ({ where: whereMock2 }));
    
    vi.mocked(db.select)
      .mockReturnValueOnce({ from: fromMock1 } as any)
      .mockReturnValueOnce({ from: fromMock2 } as any);
  });

  it('should return 405 for unsupported methods', async () => {
    await handler(req as NextApiRequest, res as NextApiResponse);

    expect(statusMock).toHaveBeenCalledWith(405);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Method not allowed' });
  });
});
