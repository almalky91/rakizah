/**
 * API Client Utilities
 * 
 * This module provides a typed fetch wrapper for frontend-backend communication
 * using Next.js API routes. It handles authentication via NextAuth session cookies
 * automatically and provides consistent error handling.
 * 
 * Requirements: 8.1, 8.3, 8.4, 8.7
 */

/**
 * Custom error class for API errors
 * Provides structured error information including status code and optional details
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Extended fetch options with authentication control
 */
interface FetchOptions extends RequestInit {
  /**
   * Whether to require authentication for this request
   * Defaults to true - set to false for public endpoints
   */
  requireAuth?: boolean;
}

/**
 * API response structure used by all API routes
 */
interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  details?: any;
}

/**
 * Base fetch function with authentication and error handling
 * 
 * This function wraps the native fetch API to provide:
 * - Automatic authentication via NextAuth session cookies
 * - Consistent error handling with ApiError
 * - Proper content-type headers
 * - Credential inclusion for cookie-based sessions
 * 
 * @param endpoint - API endpoint path (without /api prefix)
 * @param options - Fetch options including requireAuth flag
 * @returns Parsed JSON response
 * @throws ApiError with status code and error details
 * 
 * @example
 * // Authenticated request
 * const data = await apiFetch<Quiz>('/quizzes/123');
 * 
 * @example
 * // Public request
 * const data = await apiFetch<Profile>('/profiles/by-slug/teacher-name', { 
 *   requireAuth: false 
 * });
 * 
 * @example
 * // POST request with body
 * const result = await apiFetch<Quiz>('/quizzes', {
 *   method: 'POST',
 *   body: JSON.stringify({ title: 'New Quiz', questions: [...] })
 * });
 */
export async function apiFetch<T = any>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { requireAuth = true, ...fetchOptions } = options;

  const rawBody = fetchOptions.body;
  const shouldStringifyBody =
    typeof rawBody !== 'undefined' &&
    rawBody !== null &&
    typeof rawBody !== 'string' &&
    !(rawBody instanceof FormData) &&
    !(rawBody instanceof URLSearchParams) &&
    !(rawBody instanceof Blob) &&
    !(rawBody instanceof ArrayBuffer) &&
    !(rawBody instanceof ReadableStream) &&
    !(rawBody instanceof Uint8Array);

  const serializedBody = shouldStringifyBody
    ? JSON.stringify(rawBody)
    : rawBody;

  // Set up headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  // For authenticated requests, NextAuth automatically includes the session
  // cookie, so we don't need to manually add any headers. The session cookie
  // is httpOnly and set by NextAuth on the server side.
  // We just need to ensure credentials are included in the request.

  // Construct full URL - ensure endpoint starts with /
  const url = `/api${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    // Make the request with credentials included for cookie-based auth
    const response = await fetch(url, {
      ...fetchOptions,
      body: serializedBody,
      headers,
      credentials: 'include', // Include cookies for NextAuth session
    });

    // Handle non-OK responses
    if (!response.ok) {
      // Try to parse error response
      let errorData: ApiResponse;
      try {
        errorData = await response.json();
      } catch {
        // If JSON parsing fails, use status text
        errorData = {
          error: response.statusText || 'Request failed',
          message: `HTTP ${response.status}`,
        };
      }

      throw new ApiError(
        response.status,
        errorData.error || errorData.message || 'Request failed',
        errorData.details
      );
    }

    // Parse successful response
    const data: ApiResponse<T> = await response.json();
    
    // Return the data field if it exists, otherwise return the whole response
    return (data.data !== undefined ? data.data : data) as T;
  } catch (error) {
    // Re-throw ApiError as-is
    if (error instanceof ApiError) {
      throw error;
    }

    // Wrap network errors or other exceptions
    if (error instanceof Error) {
      throw new ApiError(0, error.message);
    }

    // Unknown error
    throw new ApiError(0, 'An unknown error occurred');
  }
}

/**
 * Helper function to build query string from params object
 * Filters out undefined/null values
 * 
 * @param params - Object of query parameters
 * @returns Query string (without leading ?)
 * 
 * @example
 * buildQueryString({ teacherId: '123', limit: 10 })
 * // Returns: "teacherId=123&limit=10"
 */
export function buildQueryString(params: Record<string, any>): string {
  const entries = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
  
  return entries.length > 0 ? entries.join('&') : '';
}

/**
 * Helper function to make GET requests with query parameters
 * 
 * @param endpoint - API endpoint path
 * @param params - Query parameters object
 * @param options - Additional fetch options
 * @returns Parsed response data
 * 
 * @example
 * const quizzes = await apiGet<Quiz[]>('/quizzes', { teacherId: '123' });
 */
export async function apiGet<T = any>(
  endpoint: string,
  params?: Record<string, any>,
  options?: FetchOptions
): Promise<T> {
  const queryString = params ? buildQueryString(params) : '';
  const url = queryString ? `${endpoint}?${queryString}` : endpoint;
  
  return apiFetch<T>(url, {
    method: 'GET',
    ...options,
  });
}

/**
 * Helper function to make POST requests
 * 
 * @param endpoint - API endpoint path
 * @param data - Request body data (will be JSON stringified)
 * @param options - Additional fetch options
 * @returns Parsed response data
 * 
 * @example
 * const quiz = await apiPost<Quiz>('/quizzes', { 
 *   title: 'New Quiz', 
 *   questions: [...] 
 * });
 */
export async function apiPost<T = any>(
  endpoint: string,
  data: any,
  options?: FetchOptions
): Promise<T> {
  return apiFetch<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
    ...options,
  });
}

/**
 * Helper function to make PUT requests
 * 
 * @param endpoint - API endpoint path
 * @param data - Request body data (will be JSON stringified)
 * @param options - Additional fetch options
 * @returns Parsed response data
 * 
 * @example
 * const updated = await apiPut<Quiz>('/quizzes/123', { 
 *   title: 'Updated Title' 
 * });
 */
export async function apiPut<T = any>(
  endpoint: string,
  data: any,
  options?: FetchOptions
): Promise<T> {
  return apiFetch<T>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
    ...options,
  });
}

/**
 * Helper function to make DELETE requests
 * 
 * @param endpoint - API endpoint path
 * @param options - Additional fetch options
 * @returns Parsed response data
 * 
 * @example
 * await apiDelete('/quizzes/123');
 */
export async function apiDelete<T = any>(
  endpoint: string,
  options?: FetchOptions
): Promise<T> {
  return apiFetch<T>(endpoint, {
    method: 'DELETE',
    ...options,
  });
}

// ============================================================================
// Resource-Specific API Objects
// ============================================================================

/**
 * Import Drizzle types for type-safe API methods
 */
import type { 
  Quiz, NewQuiz,
  Video, NewVideo,
  Game, NewGame,
  Profile,
  Skill,
  QuizResult, NewQuizResult,
  GameScore, NewGameScore
} from '@/db';

/**
 * Quiz API - CRUD operations for quiz resources
 * Requirements: 14.2, 14.4, 14.5
 */
export const quizApi = {
  /**
   * List quizzes, optionally filtered by teacher
   * @param teacherId - Optional teacher ID to filter by
   */
  list: async (teacherId?: string): Promise<Quiz[]> => {
    return apiGet<Quiz[]>('/quizzes', teacherId ? { teacherId } : undefined, { requireAuth: false });
  },

  /**
   * Get a single quiz by ID
   * @param id - Quiz ID
   */
  get: async (id: string): Promise<Quiz> => {
    return apiGet<Quiz>(`/quizzes/${id}`, undefined, { requireAuth: false });
  },

  /**
   * Create a new quiz
   * @param data - Quiz creation data
   */
  create: async (data: { title: string; questions: any[] }): Promise<Quiz> => {
    return apiPost<Quiz>('/quizzes', data);
  },

  /**
   * Update an existing quiz
   * @param id - Quiz ID
   * @param data - Partial quiz data to update
   */
  update: async (id: string, data: Partial<Quiz>): Promise<Quiz> => {
    return apiPut<Quiz>(`/quizzes/${id}`, data);
  },

  /**
   * Delete a quiz
   * @param id - Quiz ID
   */
  delete: async (id: string): Promise<{ message: string }> => {
    return apiDelete<{ message: string }>(`/quizzes/${id}`);
  },
};

/**
 * Video API - CRUD operations for video resources
 * Requirements: 14.2, 14.4, 14.5
 */
export const videoApi = {
  /**
   * List videos, optionally filtered by teacher
   * @param teacherId - Optional teacher ID to filter by
   */
  list: async (teacherId?: string): Promise<Video[]> => {
    return apiGet<Video[]>('/videos', teacherId ? { teacherId } : undefined, { requireAuth: false });
  },

  /**
   * Get a single video by ID
   * @param id - Video ID
   */
  get: async (id: string): Promise<Video> => {
    return apiGet<Video>(`/videos/${id}`, undefined, { requireAuth: false });
  },

  /**
   * Create a new video
   * @param data - Video creation data
   */
  create: async (data: { title: string; youtubeUrl: string }): Promise<Video> => {
    return apiPost<Video>('/videos', data);
  },

  /**
   * Update an existing video
   * @param id - Video ID
   * @param data - Partial video data to update
   */
  update: async (id: string, data: Partial<Video>): Promise<Video> => {
    return apiPut<Video>(`/videos/${id}`, data);
  },

  /**
   * Delete a video
   * @param id - Video ID
   */
  delete: async (id: string): Promise<{ message: string }> => {
    return apiDelete<{ message: string }>(`/videos/${id}`);
  },

  /**
   * Track a video view (authenticated or anonymous)
   * @param videoId - Video ID
   * @param studentName - Student name for anonymous tracking
   */
  trackView: async (videoId: string, studentName?: string): Promise<{ message: string }> => {
    const endpoint = studentName ? '/video-views/public' : '/video-views';
    return apiPost<{ message: string }>(endpoint, { videoId, studentName }, {
      requireAuth: !studentName,
    });
  },
};

/**
 * Game API - CRUD operations for game resources
 * Requirements: 14.2, 14.4, 14.5
 */
export const gameApi = {
  /**
   * List games, optionally filtered by teacher
   * @param teacherId - Optional teacher ID to filter by
   */
  list: async (teacherId?: string): Promise<Game[]> => {
    return apiGet<Game[]>('/games', teacherId ? { teacherId } : undefined, { requireAuth: false });
  },

  /**
   * Get a single game by ID
   * @param id - Game ID
   */
  get: async (id: string): Promise<Game> => {
    return apiGet<Game>(`/games/${id}`, undefined, { requireAuth: false });
  },

  /**
   * Create a new game
   * @param data - Game creation data
   */
  create: async (data: { title: string; gameType: string; config: any }): Promise<Game> => {
    return apiPost<Game>('/games', data);
  },

  /**
   * Update an existing game
   * @param id - Game ID
   * @param data - Partial game data to update
   */
  update: async (id: string, data: Partial<Game>): Promise<Game> => {
    return apiPut<Game>(`/games/${id}`, data);
  },

  /**
   * Delete a game
   * @param id - Game ID
   */
  delete: async (id: string): Promise<{ message: string }> => {
    return apiDelete<{ message: string }>(`/games/${id}`);
  },

  /**
   * Submit a game score
   * @param data - Game score data
   */
  submitScore: async (data: {
    source: string;
    points: number;
    studentId: string;
    teacherId: string;
  }): Promise<{ message: string }> => {
    return apiPost<{ message: string }>('/game-scores', data);
  },
};

/**
 * Profile API - User profile operations
 * Requirements: 14.2, 14.4, 14.5
 */
export const profileApi = {
  /**
   * Get a profile by ID
   * @param id - Profile ID
   */
  get: async (id: string): Promise<Profile> => {
    return apiGet<Profile>(`/profiles/${id}`);
  },

  /**
   * Get a profile by public slug (for public teacher pages)
   * @param slug - Public slug
   */
  getBySlug: async (slug: string): Promise<Profile & { skills: Skill[] }> => {
    return apiGet<Profile & { skills: Skill[] }>(`/profiles/by-slug/${slug}`, undefined, {
      requireAuth: false,
    });
  },

  /**
   * Update a profile
   * @param id - Profile ID
   * @param data - Partial profile data to update
   */
  update: async (id: string, data: Partial<Profile>): Promise<Profile> => {
    return apiPut<Profile>(`/profiles/${id}`, data);
  },

  /**
   * Check if a public slug is available
   * @param slug - Slug to check
   * @param excludeUserId - User ID to exclude from check (for current user)
   */
  checkSlugAvailability: async (slug: string, excludeUserId?: string): Promise<{ available: boolean }> => {
    return apiGet<{ available: boolean }>('/profiles/check-slug', { slug, excludeUserId });
  },
};

/**
 * Skills API - Skills hierarchy operations
 * Requirements: 14.2, 14.4, 14.5
 */
export const skillsApi = {
  /**
   * Get the complete skills hierarchy (grades, fields, subjects, skills)
   */
  getHierarchy: async (): Promise<any> => {
    return apiGet<any>('/skills/hierarchy', undefined, { requireAuth: false });
  },

  /**
   * Get skills for a specific grade
   * @param gradeId - Grade ID
   */
  getByGrade: async (gradeId: string): Promise<Skill[]> => {
    return apiGet<Skill[]>(`/skills/by-grade/${gradeId}`, undefined, { requireAuth: false });
  },
};

/**
 * Quiz Results API - Quiz result submission and retrieval
 * Requirements: 14.2, 14.4, 14.5
 */
export const quizResultsApi = {
  /**
   * List quiz results
   * @param filters - Optional filters (quizId, studentId, teacherId)
   */
  list: async (filters?: { quizId?: string; studentId?: string; teacherId?: string }): Promise<QuizResult[]> => {
    return apiGet<QuizResult[]>('/quiz-results', filters);
  },

  /**
   * Submit a quiz result (authenticated)
   * @param data - Quiz result data
   */
  submit: async (data: {
    quizId: string;
    teacherId: string;
    score: number;
    answers?: any[];
  }): Promise<QuizResult> => {
    return apiPost<QuizResult>('/quiz-results', data);
  },

  /**
   * Submit a public quiz result (anonymous)
   * @param data - Public quiz result data
   */
  submitPublic: async (data: {
    quizId: string;
    teacherId: string;
    studentName: string;
    score: number;
    totalQuestions: number;
    answers?: any[];
  }): Promise<{ message: string }> => {
    return apiPost<{ message: string }>('/quiz-results/public', data, {
      requireAuth: false,
    });
  },

  /**
   * Get all public quiz results for a teacher (with quiz titles)
   * @param teacherId - Teacher ID
   */
  getPublicByTeacher: async (teacherId: string): Promise<any[]> => {
    return apiGet<any[]>(`/quiz-results/public/teacher/${teacherId}`);
  },

  /**
   * Delete a specific public quiz result
   * @param id - Result ID
   */
  deletePublic: async (id: string): Promise<{ message: string }> => {
    return apiDelete<{ message: string }>(`/quiz-results/public/${id}`);
  },

  /**
   * Delete all public data (quiz results and video views) for a student
   * @param teacherId - Teacher ID
   * @param studentName - Student name
   */
  deleteStudentData: async (teacherId: string, studentName: string): Promise<{ message: string }> => {
    return apiFetch<{ message: string }>('/quiz-results/public/student', {
      method: 'DELETE',
      body: JSON.stringify({ teacherId, studentName }),
    });
  },
};

/**
 * Game Scores API - Game score operations
 * Requirements: 14.2, 14.4, 14.5
 */
export const gameScoresApi = {
  /**
   * List game scores
   * @param filters - Optional filters (studentId, teacherId)
   */
  list: async (filters?: { studentId?: string; teacherId?: string }): Promise<GameScore[]> => {
    return apiGet<GameScore[]>('/game-scores', filters);
  },

  /**
   * Get leaderboard for a teacher
   * @param teacherId - Teacher ID
   */
  leaderboard: async (teacherId: string): Promise<any[]> => {
    return apiGet<any[]>(`/game-scores/leaderboard/${teacherId}`, undefined, { requireAuth: false });
  },
};

/**
 * Teachers API - Teacher management operations
 * Requirements: 14.2, 14.4, 14.5
 */
export const teachersApi = {
  /**
   * List all teachers
   */
  list: async (): Promise<Profile[]> => {
    return apiGet<Profile[]>('/teachers');
  },

  /**
   * Get teacher skills
   * @param teacherId - Teacher ID
   */
  getSkills: async (teacherId: string): Promise<Skill[]> => {
    return apiGet<Skill[]>(`/teachers/${teacherId}/skills`);
  },

  /**
   * Update teacher skills
   * @param teacherId - Teacher ID
   * @param skillIds - Array of skill IDs
   */
  updateSkills: async (teacherId: string, skillIds: string[]): Promise<{ message: string }> => {
    return apiPut<{ message: string }>(`/teachers/${teacherId}/skills`, { skillIds });
  },
};

/**
 * Video Views API - Video view tracking and retrieval
 * Requirements: 14.2, 14.4, 14.5
 */
export const videoViewsApi = {
  /**
   * Get all public video views for a teacher
   * @param teacherId - Teacher ID
   */
  getPublicByTeacher: async (teacherId: string): Promise<any[]> => {
    return apiGet<any[]>(`/video-views/public/teacher/${teacherId}`);
  },
};

/**
 * Auth API - Authentication operations
 * Requirements: 14.2, 14.4, 14.5
 */
export const authApi = {
  /**
   * Change user email
   * @param newEmail - New email address
   */
  changeEmail: async (newEmail: string): Promise<{ message: string; data: { email: string } }> => {
    return apiPost<{ message: string; data: { email: string } }>('/auth/change-email', { newEmail });
  },

  /**
   * Change user password
   * @param newPassword - New password
   * @param confirmPassword - Confirmation of new password
   */
  changePassword: async (newPassword: string, confirmPassword: string): Promise<{ message: string }> => {
    return apiPost<{ message: string }>('/auth/change-password', { newPassword, confirmPassword });
  },

  /**
   * Get current user info
   */
  me: async (): Promise<any> => {
    return apiGet<any>('/auth/me');
  },
};

/**
 * Chatbot API - AI-powered skill assistant
 * Requirements: Educational assistance for students
 */
export const chatbotApi = {
  /**
   * Send a message to the AI chatbot for skill assistance
   * @param data - Chatbot request data
   */
  sendMessage: async (data: {
    message: string;
    skillId: string;
    conversationHistory?: Array<{
      role: 'user' | 'assistant';
      content: string;
    }>;
  }): Promise<{
    response: string;
    options: string[];
  }> => {
    return apiPost<{ response: string; options: string[] }>('/chatbot', data, {
      requireAuth: false, // Public endpoint for students
    });
  },
};

