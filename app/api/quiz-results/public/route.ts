import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { publicQuizResults, quizzes } from '@/db';
import { eq } from 'drizzle-orm';
import { v7 as uuidv7 } from 'uuid';
import { z } from 'zod';

// Zod schema for anonymous/public quiz result submission
const SubmitPublicQuizResultSchema = z.object({
  quizId: z.string().uuid('Invalid quiz ID format'),
  studentName: z.string().min(1, 'Student name is required').max(255, 'Name too long'),
  score: z.number().int().min(0, 'Score must be non-negative'),
  totalQuestions: z.number().int().min(1, 'Total questions must be at least 1'),
  answers: z.array(z.object({
    questionIndex: z.number().int(),
    answerIndex: z.number().int(),
  })).optional(), // Array of student answers with question and answer indices
});

/**
 * POST /api/quiz-results/public
 * Submits quiz result for an anonymous student (public quiz taking)
 * Body: { quizId: string, studentName: string, score: number, totalQuestions: number, answers?: Array<any> }
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Debug logging to see what's actually received
    console.log('Received body:', JSON.stringify(body, null, 2));
    console.log('Answers type:', Array.isArray(body.answers) ? 'array' : typeof body.answers);
    console.log('Answers value:', body.answers);

    // Validate request body
    const validationResult = SubmitPublicQuizResultSchema.safeParse(body);
    if (!validationResult.success) {
      console.error('Validation failed:', validationResult.error);
      return NextResponse.json({
        error: 'Validation error',
        message: 'Invalid quiz result data',
        details: validationResult.error.errors,
      }, { status: 400 });
    }

    const { quizId, studentName, score, totalQuestions, answers } = validationResult.data;

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

    // Create public quiz result
    const newResult = {
      id: uuidv7(),
      quizId,
      teacherId: quiz.teacherId,
      studentName,
      score,
      totalQuestions,
      answers: answers ? JSON.stringify(answers) : null,
      createdAt: new Date(),
    };

    await db.insert(publicQuizResults).values(newResult);

    // Return created result with parsed answers
    return NextResponse.json({
      data: {
        ...newResult,
        answers: answers || null, // Return as object, not string
      },
      message: 'Public quiz result submitted successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error submitting public quiz result:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: 'Failed to submit public quiz result',
    }, { status: 500 });
  }
}
