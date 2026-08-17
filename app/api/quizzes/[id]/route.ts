import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { quizzes } from '@/db/schema/content';
import { requireOwnershipApp } from '@/lib/auth-helpers-app';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// Zod schema for quiz update validation
const QuizQuestionSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  options: z.array(z.string()).min(2, 'At least 2 options required'),
  correctAnswer: z.string().min(1, 'Correct answer is required'),
});

const UpdateQuizSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long').optional(),
  questions: z.array(QuizQuestionSchema).min(1, 'At least 1 question required').optional(),
});

/**
 * GET /api/quizzes/[id]
 * Retrieves a single quiz by ID
 * Anonymous access allowed for public quiz taking
 * 
 * Requirements: 15.3
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const quizId = params.id;

    const [quiz] = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.id, quizId))
      .limit(1);

    if (!quiz) {
      return NextResponse.json(
        {
          error: 'Not found',
          message: 'Quiz not found',
        },
        { status: 404 }
      );
    }

    // Parse questions if they're stored as JSON string
    let parsedQuestions = quiz.questions;
    if (typeof quiz.questions === 'string') {
      try {
        parsedQuestions = JSON.parse(quiz.questions);
      } catch (e) {
        console.error('Error parsing quiz questions:', e);
      }
    }

    return NextResponse.json({
      data: {
        ...quiz,
        questions: parsedQuestions,
      },
      message: 'Quiz retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to retrieve quiz',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/quizzes/[id]
 * Updates a quiz (owner or admin only)
 * Body: { title?: string, questions?: Array<{ question, options, correctAnswer }> }
 * 
 * Requirements: 15.6
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const quizId = params.id;

    // First, fetch the quiz to check ownership
    const [quiz] = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.id, quizId))
      .limit(1);

    if (!quiz) {
      return NextResponse.json(
        {
          error: 'Not found',
          message: 'Quiz not found',
        },
        { status: 404 }
      );
    }

    // Require ownership (teacher who created it or admin)
    const { session, errorResponse } = await requireOwnershipApp(quiz.teacherId);
    if (errorResponse) return errorResponse;

    const body = await request.json();

    // Validate request body
    const validationResult = UpdateQuizSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation error',
          message: 'Invalid quiz data',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (validationResult.data.title) {
      updateData.title = validationResult.data.title;
    }
    if (validationResult.data.questions) {
      updateData.questions = JSON.stringify(validationResult.data.questions);
    }

    // Update quiz
    await db
      .update(quizzes)
      .set(updateData)
      .where(eq(quizzes.id, quizId));

    // Fetch updated quiz
    const [updatedQuiz] = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.id, quizId))
      .limit(1);

    // Parse questions for response
    let parsedQuestions = updatedQuiz.questions;
    if (typeof updatedQuiz.questions === 'string') {
      try {
        parsedQuestions = JSON.parse(updatedQuiz.questions);
      } catch (e) {
        console.error('Error parsing quiz questions:', e);
      }
    }

    return NextResponse.json({
      data: {
        ...updatedQuiz,
        questions: parsedQuestions,
      },
      message: 'Quiz updated successfully',
    });
  } catch (error) {
    console.error('Error updating quiz:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to update quiz',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/quizzes/[id]
 * Deletes a quiz (owner or admin only)
 * 
 * Requirements: 15.6
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const quizId = params.id;

    // First, fetch the quiz to check ownership
    const [quiz] = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.id, quizId))
      .limit(1);

    if (!quiz) {
      return NextResponse.json(
        {
          error: 'Not found',
          message: 'Quiz not found',
        },
        { status: 404 }
      );
    }

    // Require ownership (teacher who created it or admin)
    const { session, errorResponse } = await requireOwnershipApp(quiz.teacherId);
    if (errorResponse) return errorResponse;

    // Delete quiz (cascade will handle related records)
    await db.delete(quizzes).where(eq(quizzes.id, quizId));

    return NextResponse.json({
      data: { id: quizId },
      message: 'Quiz deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to delete quiz',
      },
      { status: 500 }
    );
  }
}
