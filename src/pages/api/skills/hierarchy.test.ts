import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextApiRequest, NextApiResponse } from 'next';
import handler from './hierarchy';
import { db } from '@/db';

// Mock the database module
vi.mock('@/db', () => ({
  db: {
    select: vi.fn(),
  },
}));

describe('GET /api/skills/hierarchy', () => {
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
    };
    
    res = {
      status: statusMock as any,
      json: jsonMock,
    };
  });

  it('should return 405 for non-GET methods', async () => {
    req.method = 'POST';
    
    await handler(req as NextApiRequest, res as NextApiResponse);
    
    expect(statusMock).toHaveBeenCalledWith(405);
    expect(jsonMock).toHaveBeenCalledWith({
      error: 'Method not allowed',
      message: 'Only GET method is supported',
    });
  });

  it('should return skills hierarchy with proper structure', async () => {
    // Mock database responses
    const mockGrades = [
      { id: 'grade-1', name: 'Grade 1', displayOrder: 1, createdAt: new Date() },
      { id: 'grade-2', name: 'Grade 2', displayOrder: 2, createdAt: new Date() },
    ];
    
    const mockFields = [
      { id: 'field-1', gradeId: 'grade-1', name: 'Math', displayOrder: 1, createdAt: new Date() },
      { id: 'field-2', gradeId: 'grade-1', name: 'Science', displayOrder: 2, createdAt: new Date() },
    ];
    
    const mockSubjects = [
      { id: 'subject-1', fieldId: 'field-1', name: 'Numbers', displayOrder: 1, createdAt: new Date() },
    ];
    
    const mockSkills = [
      {
        id: 'skill-1',
        fieldId: 'field-1',
        gradeId: 'grade-1',
        skillNumber: 1,
        title: 'Count to 10',
        difficultyLevel: 'basic',
        displayOrder: 1,
        createdAt: new Date(),
      },
    ];

    // Mock the chained methods
    const orderByMock = vi.fn().mockResolvedValue([]);
    const fromMock = vi.fn(() => ({ orderBy: orderByMock }));
    
    // Setup Promise.all to return our mock data
    vi.mocked(db.select).mockReturnValue({ from: fromMock } as any);
    orderByMock
      .mockResolvedValueOnce(mockGrades)
      .mockResolvedValueOnce(mockFields)
      .mockResolvedValueOnce(mockSubjects)
      .mockResolvedValueOnce(mockSkills);

    await handler(req as NextApiRequest, res as NextApiResponse);

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({
      data: expect.arrayContaining([
        expect.objectContaining({
          grade: expect.objectContaining({
            id: 'grade-1',
            name: 'Grade 1',
          }),
          fields: expect.arrayContaining([
            expect.objectContaining({
              field: expect.objectContaining({
                id: 'field-1',
                name: 'Math',
              }),
              subjects: expect.any(Array),
              skills: expect.any(Array),
            }),
          ]),
        }),
      ]),
      message: 'Skills hierarchy retrieved successfully',
    });
  });

  it('should handle empty database gracefully', async () => {
    // Mock empty database responses
    const orderByMock = vi.fn()
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);
    
    const fromMock = vi.fn(() => ({ orderBy: orderByMock }));
    vi.mocked(db.select).mockReturnValue({ from: fromMock } as any);

    await handler(req as NextApiRequest, res as NextApiResponse);

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({
      data: [],
      message: 'Skills hierarchy retrieved successfully',
    });
  });

  it('should handle database errors', async () => {
    // Mock database error
    const orderByMock = vi.fn().mockRejectedValue(new Error('Database connection failed'));
    const fromMock = vi.fn(() => ({ orderBy: orderByMock }));
    vi.mocked(db.select).mockReturnValue({ from: fromMock } as any);

    await handler(req as NextApiRequest, res as NextApiResponse);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      error: 'Internal server error',
      message: 'Failed to retrieve skills hierarchy',
    });
  });

  it('should return fields with empty arrays when no subjects or skills exist', async () => {
    const mockGrades = [
      { id: 'grade-1', name: 'Grade 1', displayOrder: 1, createdAt: new Date() },
    ];
    
    const mockFields = [
      { id: 'field-1', gradeId: 'grade-1', name: 'Math', displayOrder: 1, createdAt: new Date() },
    ];

    const orderByMock = vi.fn()
      .mockResolvedValueOnce(mockGrades)
      .mockResolvedValueOnce(mockFields)
      .mockResolvedValueOnce([]) // No subjects
      .mockResolvedValueOnce([]); // No skills
    
    const fromMock = vi.fn(() => ({ orderBy: orderByMock }));
    vi.mocked(db.select).mockReturnValue({ from: fromMock } as any);

    await handler(req as NextApiRequest, res as NextApiResponse);

    expect(statusMock).toHaveBeenCalledWith(200);
    const response = jsonMock.mock.calls[0][0];
    expect(response.data[0].fields[0].subjects).toEqual([]);
    expect(response.data[0].fields[0].skills).toEqual([]);
  });
});
