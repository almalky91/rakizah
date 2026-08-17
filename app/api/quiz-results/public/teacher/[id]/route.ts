import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { publicQuizResults, quizzes } from '@/db';
import { eq, desc } from 'drizzle-orm';
import { validate } from 'uuid';

/**
 * GET /api/quiz-results/public/teacher/[id]
 * Retrieves all public quiz results for a specific teacher with quiz titles
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate id in UUID format
    if (!validate(id)) {
      return NextResponse.json(
        {
          error: 'Invalid id format',
        },
        { status: 400 }
      );
    }

    // Fetch all public quiz results for this teacher
    const results = await db
      .select()
      .from(publicQuizResults)
      .where(eq(publicQuizResults.teacherId, id))
      .orderBy(desc(publicQuizResults.createdAt));

    // Fetch all quizzes for this teacher to map titles
    const teacherQuizzes = await db
      .select({
        id: quizzes.id,
        title: quizzes.title,
      })
      .from(quizzes)
      .where(eq(quizzes.teacherId, id));

    // Create a map of quiz IDs to titles
    const quizTitleMap = new Map(
      teacherQuizzes.map((q) => [q.id, q.title])
    );

    // Enrich results with quiz titles
    const enrichedResults = results.map((result) => ({
      ...result,
      quizTitle: quizTitleMap.get(result.quizId) || 'اختبار محذوف',
    }));

    return NextResponse.json({
      message: 'Public quiz results retrieved',
      data: enrichedResults,
    });
  } catch (error) {
    console.error('Error retrieving public quiz results:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to retrieve public quiz results',
      },
      { status: 500 }
    );
  }
}

