import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { quizzes } from '@/db/schema/content';
import { requireRoleApp } from '@/lib/auth-helpers-app';
import { eq } from 'drizzle-orm';
import { v7 as uuidv7 } from 'uuid';
import { z } from 'zod';

// Zod schema for quiz validation
const QuizQuestionSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  options: z.array(z.string()).min(2, 'At least 2 options required'),
  correctAnswer: z.string().min(1, 'Correct answer is required'),
});

const CreateQuizSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  questions: z.array(QuizQuestionSchema).min(1, 'At least 1 question required'),
});

/**
 * GET /api/quizzes
 * Retrieves list of quizzes with optional teacherId filter
 * Query params:
 *   - teacherId: Optional filter for quizzes by specific teacher
 * 
 * Requirements: 15.3
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');

    let quizList;
    if (teacherId) {
      // Filter by teacherId
      quizList = await db
        .select()
        .from(quizzes)
        .where(eq(quizzes.teacherId, teacherId));
    } else {
      // Return all quizzes
      quizList = await db.select().from(quizzes);
    }

    // Parse questions for each quiz if they're stored as JSON string
    const parsedQuizList = quizList.map(quiz => {
      let parsedQuestions = quiz.questions;
      if (typeof quiz.questions === 'string') {
        try {
          parsedQuestions = JSON.parse(quiz.questions);
        } catch (e) {
          console.error('Error parsing quiz questions:', e);
        }
      }
      return {
        ...quiz,
        questions: parsedQuestions,
      };
    });

    return NextResponse.json({
      data: parsedQuizList,
      message: 'Quizzes retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to retrieve quizzes',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/quizzes
 * Creates a new quiz (teacher/admin only)
 * Body: { title: string, questions: Array<{ question, options, correctAnswer }> }
 * 
 * Requirements: 15.5
 */
export async function POST(request: NextRequest) {
  // Require teacher or admin role
  const { session, errorResponse } = await requireRoleApp(['teacher', 'admin']);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();

    // Validate request body
    const validationResult = CreateQuizSchema.safeParse(body);
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

    const { title, questions } = validationResult.data;

    // Create new quiz
    const newQuiz = {
      id: uuidv7(),
      teacherId: session!.user.id,
      title,
      questions: JSON.stringify(questions),
      createdAt: new Date(),
    };

    await db.insert(quizzes).values(newQuiz);

    // Return created quiz with parsed questions
    return NextResponse.json(
      {
        data: {
          ...newQuiz,
          questions: questions, // Return as object, not string
        },
        message: 'Quiz created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating quiz:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to create quiz',
      },
      { status: 500 }
    );
  }
}
