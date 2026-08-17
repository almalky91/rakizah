import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { quizResults, quizzes } from '@/db';
import { requireAuth } from '@/lib/auth-helpers';
import { eq } from 'drizzle-orm';
import { v7 as uuidv7 } from 'uuid';
import { z } from 'zod';

// Zod schema for authenticated quiz result submission
const SubmitQuizResultSchema = z.object({
  quizId: z.string().uuid('Invalid quiz ID format'),
  score: z.number().int().min(0, 'Score must be non-negative'),
  answers: z.array(z.any()).optional(), // Array of student answers
});

/**
 * POST /api/quiz-results
 * Submits quiz result for an authenticated student
 * Body: { quizId: string, score: number, answers?: Array<any> }
 */
export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const session = await requireAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();

    // Validate request body
    const validationResult = SubmitQuizResultSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({
        error: 'Validation error',
        message: 'Invalid quiz result data',
        details: validationResult.error.errors,
      }, { status: 400 });
    }

    const { quizId, score, answers } = validationResult.data;

    // Fetch quiz to get teacherId
    const [quiz] = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.id, quizId))
      .limit(1);

    if (!quiz) {
      return NextResponse.json({
        error: 'Not found',
        message: 'Quiz not found',
      }, { status: 404 });
    }

    // Create quiz result
    const newResult = {
      id: uuidv7(),
      quizId,
      studentId: session.user.id,
      teacherId: quiz.teacherId,
      score,
      answers: answers ? JSON.stringify(answers) : null,
      createdAt: new Date(),
    };

    await db.insert(quizResults).values(newResult);

    // Return created result with parsed answers
    return NextResponse.json({
      data: {
        ...newResult,
        answers: answers || null, // Return as object, not string
      },
      message: 'Quiz result submitted successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error submitting quiz result:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: 'Failed to submit quiz result',
    }, { status: 500 });
  }
}
