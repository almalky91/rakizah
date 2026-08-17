import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { publicQuizResults, publicVideoViews } from '@/db';
import { eq, and } from 'drizzle-orm';
import { requireAuthApp } from '@/lib/auth-helpers-app';
import { z } from 'zod';

// Schema for deleting student data
const DeleteStudentDataSchema = z.object({
  studentName: z.string().min(1, 'Student name is required'),
  teacherId: z.string().uuid('Invalid teacher ID format'),
});

/**
 * DELETE /api/quiz-results/public/student
 * Deletes all public quiz results and video views for a specific student name under a teacher
 * Body: { studentName: string, teacherId: string }
 */
export async function DELETE(request: NextRequest) {
  try {
    // Require authentication
    const { session, errorResponse } = await requireAuthApp();
    if (errorResponse) return errorResponse;

    // Parse request body
    const body = await request.json();

    // Validate request body
    const validationResult = DeleteStudentDataSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation error',
          message: 'Invalid request data',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { studentName, teacherId } = validationResult.data;

    // Verify the user is the teacher or admin
    if (session && session.user.id !== teacherId && session.user.role !== 'admin') {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'You do not have permission to delete this student data',
        },
        { status: 403 }
      );
    }

    // Delete all quiz results for this student under this teacher
    await db
      .delete(publicQuizResults)
      .where(
        and(
          eq(publicQuizResults.teacherId, teacherId),
          eq(publicQuizResults.studentName, studentName)
        )
      );

    // Delete all video views for this student under this teacher
    await db
      .delete(publicVideoViews)
      .where(
        and(
          eq(publicVideoViews.teacherId, teacherId),
          eq(publicVideoViews.studentName, studentName)
        )
      );

    return NextResponse.json({
      message: `All data for student "${studentName}" deleted successfully`,
    });
  } catch (error) {
    console.error('Error deleting student data:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to delete student data',
      },
      { status: 500 }
    );
  }
}
