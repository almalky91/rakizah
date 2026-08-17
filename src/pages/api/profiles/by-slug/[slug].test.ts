import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextApiRequest, NextApiResponse } from 'next';
import handler from './[slug]';

// Mock the database
vi.mock('@/db', () => ({
  db: {
    select: vi.fn(),
  },
}));

import { db } from '@/db';

describe('GET /api/profiles/by-slug/[slug]', () => {
  let req: Partial<NextApiRequest>;
  let res: Partial<NextApiResponse>;
  let jsonMock: ReturnType<typeof vi.fn>;
  let statusMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup response mock
    jsonMock = vi.fn();
    statusMock = vi.fn(() => ({ json: jsonMock }));

    res = {
      status: statusMock,
      json: jsonMock,
    };
  });

  it('should return 400 if slug is missing', async () => {
    req = {
      method: 'GET',
      query: {},
    };

    await handler(req as NextApiRequest, res as NextApiResponse);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      error: 'Invalid slug parameter',
    });
  });

  it('should return 400 if slug is empty string', async () => {
    req = {
      method: 'GET',
      query: { slug: '' },
    };

    await handler(req as NextApiRequest, res as NextApiResponse);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      error: 'Slug parameter is required',
    });
  });

  it('should return 405 for non-GET methods', async () => {
    req = {
      method: 'POST',
      query: { slug: 'john-doe' },
    };

    await handler(req as NextApiRequest, res as NextApiResponse);

    expect(statusMock).toHaveBeenCalledWith(405);
    expect(jsonMock).toHaveBeenCalledWith({
      error: 'Method not allowed',
    });
  });

  it('should return 404 if teacher not found', async () => {
    const mockSelect = vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]), // Empty array = not found
        }),
      }),
    });

    (db.select as any) = mockSelect;

    req = {
      method: 'GET',
      query: { slug: 'nonexistent-teacher' },
    };

    await handler(req as NextApiRequest, res as NextApiResponse);

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({
      error: 'Teacher not found',
    });
  });

  it('should return profile with skills for valid slug', async () => {
    const mockProfile = {
      id: 'teacher-123',
      email: 'teacher@example.com',
      fullName: 'John Doe',
      bio: 'Math teacher',
      phoneNumber: '1234567890',
      schoolName: 'Test School',
      publicSlug: 'john-doe',
      pageTitle: 'John Doe - Math Teacher',
      pageTemplate: 'default',
      createdAt: new Date('2024-01-01'),
    };

    const mockSkills = [
      {
        skillId: 'skill-1',
        skillNumber: 101,
        skillTitle: 'Basic Addition',
        difficultyLevel: 'basic',
        displayOrder: 1,
        fieldId: 'field-1',
        fieldName: 'Arithmetic',
        fieldDisplayOrder: 1,
        gradeId: 'grade-1',
        gradeName: 'Grade 3',
        gradeDisplayOrder: 1,
      },
      {
        skillId: 'skill-2',
        skillNumber: 102,
        skillTitle: 'Basic Subtraction',
        difficultyLevel: 'basic',
        displayOrder: 2,
        fieldId: 'field-1',
        fieldName: 'Arithmetic',
        fieldDisplayOrder: 1,
        gradeId: 'grade-1',
        gradeName: 'Grade 3',
        gradeDisplayOrder: 1,
      },
    ];

    // Mock profile query (first select call)
    const profileMock = vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([mockProfile]),
        }),
      }),
    });

    // Mock skills query (second select call)
    const skillsMock = vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        innerJoin: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnValue({
            innerJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                orderBy: vi.fn().mockResolvedValue(mockSkills),
              }),
            }),
          }),
        }),
      }),
    });

    // Mock db.select to return different mocks for each call
    let callCount = 0;
    (db.select as any) = vi.fn(() => {
      callCount++;
      return callCount === 1 ? profileMock() : skillsMock();
    });

    req = {
      method: 'GET',
      query: { slug: 'john-doe' },
    };

    await handler(req as NextApiRequest, res as NextApiResponse);

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({
      data: {
        profile: mockProfile,
        skills: [
          {
            id: 'skill-1',
            skillNumber: 101,
            title: 'Basic Addition',
            difficultyLevel: 'basic',
            displayOrder: 1,
            field: {
              id: 'field-1',
              name: 'Arithmetic',
              displayOrder: 1,
            },
            grade: {
              id: 'grade-1',
              name: 'Grade 3',
              displayOrder: 1,
            },
          },
          {
            id: 'skill-2',
            skillNumber: 102,
            title: 'Basic Subtraction',
            difficultyLevel: 'basic',
            displayOrder: 2,
            field: {
              id: 'field-1',
              name: 'Arithmetic',
              displayOrder: 1,
            },
            grade: {
              id: 'grade-1',
              name: 'Grade 3',
              displayOrder: 1,
            },
          },
        ],
      },
    });
  });

  it('should handle database errors gracefully', async () => {
    const mockSelect = vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockRejectedValue(new Error('Database connection failed')),
        }),
      }),
    });

    (db.select as any) = mockSelect;

    req = {
      method: 'GET',
      query: { slug: 'john-doe' },
    };

    await handler(req as NextApiRequest, res as NextApiResponse);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      error: 'Internal server error',
    });
  });

  it('should return profile with empty skills array if teacher has no skills', async () => {
    const mockProfile = {
      id: 'teacher-123',
      email: 'teacher@example.com',
      fullName: 'John Doe',
      bio: 'New teacher',
      phoneNumber: '1234567890',
      schoolName: 'Test School',
      publicSlug: 'john-doe',
      pageTitle: 'John Doe - Teacher',
      pageTemplate: 'default',
      createdAt: new Date('2024-01-01'),
    };

    // Mock profile query
    const profileMock = vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([mockProfile]),
        }),
      }),
    });

    // Mock skills query returning empty array
    const skillsMock = vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        innerJoin: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnValue({
            innerJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                orderBy: vi.fn().mockResolvedValue([]),
              }),
            }),
          }),
        }),
      }),
    });

    let callCount = 0;
    (db.select as any) = vi.fn(() => {
      callCount++;
      return callCount === 1 ? profileMock() : skillsMock();
    });

    req = {
      method: 'GET',
      query: { slug: 'john-doe' },
    };

    await handler(req as NextApiRequest, res as NextApiResponse);

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({
      data: {
        profile: mockProfile,
        skills: [],
      },
    });
  });
});
