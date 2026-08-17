import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { hash } from 'bcrypt';
import handler from '../register';
import { db } from '@/db';
import { profiles, userRoles } from '@/db/schema/auth';
import { eq } from 'drizzle-orm';

// Mock the database
vi.mock('@/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
  },
}));

// Mock bcrypt
vi.mock('bcrypt', () => ({
  hash: vi.fn(),
}));

// Mock uuid
vi.mock('uuid', () => ({
  v4: vi.fn(() => 'mock-uuid-123'),
}));

describe('POST /api/auth/register', () => {
  let mockReq: any;
  let mockRes: any;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Setup mock request
    mockReq = {
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User',
      },
    };

    // Setup mock response
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully register a new user with valid input', async () => {
    // Mock database to return no existing user
    const mockSelect = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
    };
    (db.select as any).mockReturnValue(mockSelect);

    // Mock bcrypt hash
    (hash as any).mockResolvedValue('hashed-password-123');

    // Mock database insert
    const mockInsert = {
      values: vi.fn().mockResolvedValue(undefined),
    };
    (db.insert as any).mockReturnValue(mockInsert);

    await handler(mockReq, mockRes);

    // Verify response
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'User registered successfully',
      user: {
        id: 'mock-uuid-123',
        email: 'test@example.com',
        fullName: 'Test User',
      },
    });

    // Verify password was hashed with bcrypt cost factor 12
    expect(hash).toHaveBeenCalledWith('password123', 12);

    // Verify profile was created
    expect(db.insert).toHaveBeenCalledWith(profiles);
    expect(mockInsert.values).toHaveBeenCalledWith({
      id: 'mock-uuid-123',
      email: 'test@example.com',
      fullName: 'Test User',
      passwordHash: 'hashed-password-123',
      pageTemplate: 'default',
      subscriptionActive: false,
    });

    // Verify user_role was created with 'student' role
    expect(db.insert).toHaveBeenCalledWith(userRoles);
  });

  it('should return 400 when email is invalid', async () => {
    mockReq.body.email = 'invalid-email';

    await handler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Invalid input',
        details: expect.arrayContaining([
          expect.objectContaining({
            field: 'email',
            message: 'Invalid email address',
          }),
        ]),
      })
    );
  });

  it('should return 400 when password is too short', async () => {
    mockReq.body.password = 'short';

    await handler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Invalid input',
        details: expect.arrayContaining([
          expect.objectContaining({
            field: 'password',
            message: 'Password must be at least 8 characters',
          }),
        ]),
      })
    );
  });

  it('should return 400 when fullName is too short', async () => {
    mockReq.body.fullName = 'A';

    await handler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Invalid input',
        details: expect.arrayContaining([
          expect.objectContaining({
            field: 'fullName',
            message: 'Full name must be at least 2 characters',
          }),
        ]),
      })
    );
  });

  it('should return 400 when email already exists', async () => {
    // Mock database to return existing user
    const mockSelect = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([
        {
          id: 'existing-user-id',
          email: 'test@example.com',
        },
      ]),
    };
    (db.select as any).mockReturnValue(mockSelect);

    await handler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Email already registered',
    });
  });

  it('should return 405 when method is not POST', async () => {
    mockReq.method = 'GET';

    await handler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(405);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Method not allowed',
    });
  });

  it('should return 500 when database error occurs', async () => {
    // Mock database to throw error
    const mockSelect = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockRejectedValue(new Error('Database connection failed')),
    };
    (db.select as any).mockReturnValue(mockSelect);

    await handler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Internal server error',
    });
  });

  it('should handle duplicate entry database error', async () => {
    // Mock database to return no existing user on check
    const mockSelect = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
    };
    (db.select as any).mockReturnValue(mockSelect);

    // Mock bcrypt hash
    (hash as any).mockResolvedValue('hashed-password-123');

    // Mock database insert to throw duplicate error
    const mockInsert = {
      values: vi
        .fn()
        .mockRejectedValue(new Error('Duplicate entry for key email')),
    };
    (db.insert as any).mockReturnValue(mockInsert);

    await handler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Email already registered',
    });
  });
});
