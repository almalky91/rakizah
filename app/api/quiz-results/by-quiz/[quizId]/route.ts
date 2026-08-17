import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { quizResults, publicQuizResults, quizzes, profiles } from '@/db';
import { requireRole } from '@/lib/auth-helpers';
import { eq } from 'drizzle-orm';

/**
 * GET /api/quiz-results/by-quiz/[quizId]
 * Retrieves all results (authenticated and anonymous) for a specific quiz
 * Requires teacher or admin role
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { quizId: string } }
) {
  const { quizId } = params;

  if (!quizId || typeof quizId !== 'string') {
    return NextResponse.json({
      error: 'Invalid quiz ID',
      message: 'Quiz ID must be a string'
    }, { status: 400 });
  }

  // Require teacher or admin role
  const session = await requireRole(request, ['teacher', 'admin']);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Verify quiz exists
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

    // If user is a teacher (not admin), verify they own the quiz
    if (session.user.role === 'teacher' && quiz.teacherId !== session.user.id) {
      return NextResponse.json({
        error: 'Forbidden',
        message: 'You can only view results for your own quizzes',
      }, { status: 403 });
    }

    // Fetch authenticated quiz results with student profile information
    const authenticatedResults = await db
      .select({
        id: quizResults.id,
        quizId: quizResults.quizId,
        studentId: quizResults.studentId,
        studentName: profiles.fullName,
        studentEmail: profiles.email,
        score: quizResults.score,
        answers: quizResults.answers,
        createdAt: quizResults.createdAt,
        type: 'authenticated' as const,
      })
      .from(quizResults)
      .leftJoin(profiles, eq(quizResults.studentId, profiles.id))
      .where(eq(quizResults.quizId, quizId));

    // Fetch public/anonymous quiz results
    const anonymousResults = await db
      .select({
        id: publicQuizResults.id,
        quizId: publicQuizResults.quizId,
        studentName: publicQuizResults.studentName,
        score: publicQuizResults.score,
        totalQuestions: publicQuizResults.totalQuestions,
        answers: publicQuizResults.answers,
        createdAt: publicQuizResults.createdAt,
        type: 'anonymous' as const,
      })
      .from(publicQuizResults)
      .where(eq(publicQuizResults.quizId, quizId));

    // Parse JSON answers for both result types
    const parsedAuthenticatedResults = authenticatedResults.map(result => ({
      ...result,
      answers: result.answers && typeof result.answers === 'string'
        ? JSON.parse(result.answers)
        : result.answers,
    }));

    const parsedAnonymousResults = anonymousResults.map(result => ({
      ...result,
      answers: result.answers && typeof result.answers === 'string'
        ? JSON.parse(result.answers)
        : result.answers,
    }));

    return NextResponse.json({
      data: {
        quizId,
        quizTitle: quiz.title,
        authenticatedResults: parsedAuthenticatedResults,
        anonymousResults: parsedAnonymousResults,
        totalResults: parsedAuthenticatedResults.length + parsedAnonymousResults.length,
      },
      message: 'Quiz results retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching quiz results:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: 'Failed to retrieve quiz results',
    }, { status: 500 });
  }
}
