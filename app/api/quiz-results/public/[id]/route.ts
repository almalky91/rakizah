import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { publicQuizResults } from '@/db';
import { eq, and } from 'drizzle-orm';
import { validate } from 'uuid';
import { requireAuthApp } from '@/lib/auth-helpers-app';

/**
 * DELETE /api/quiz-results/public/[id]
 * Deletes a specific public quiz result
 * Requires authentication and ownership validation
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require authentication
    const { session, errorResponse } = await requireAuthApp();
    if (errorResponse) return errorResponse;

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

    // First, fetch the result to verify ownership
    const [result] = await db
      .select()
      .from(publicQuizResults)
      .where(eq(publicQuizResults.id, id))
      .limit(1);

    if (!result) {
      return NextResponse.json(
        {
          error: 'Not found',
          message: 'Quiz result not found',
        },
        { status: 404 }
      );
    }

    // Verify the user owns this result (is the teacher)
    if (
      session &&
      result.teacherId !== session.user.id &&
      session.user.role !== 'admin'
    ) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'You do not have permission to delete this result',
        },
        { status: 403 }
      );
    }

    // Delete the result
    await db
      .delete(publicQuizResults)
      .where(eq(publicQuizResults.id, id));

    return NextResponse.json({
      message: 'Public quiz result deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting public quiz result:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to delete public quiz result',
      },
      { status: 500 }
    );
  }
}
