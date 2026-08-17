import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { gameScores } from '@/db/schema/results';
import { requireAuth } from '@/lib/auth-helpers';
import { v7 as uuidv7 } from 'uuid';
import { z } from 'zod';

// Zod schema for game score submission
const SubmitGameScoreSchema = z.object({
  source: z.string().min(1, 'Source is required').max(255, 'Source too long'),
  points: z.number().int('Points must be an integer').min(0, 'Points must be non-negative'),
  studentId: z.string().uuid('Invalid student ID format'),
  teacherId: z.string().uuid('Invalid teacher ID format'),
});

/**
 * POST /api/game-scores
 * Submits a game score for an authenticated student
 * Body: { source: string, points: number, studentId: string, teacherId: string }
 * 
 * Requirements:
 * - 6.1: Student authentication required
 * - 6.2: Student access restrictions (can only submit scores for themselves)
 * - 10.4: Authorization enforcement
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
    const validationResult = SubmitGameScoreSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({
        error: 'Validation error',
        message: 'Invalid game score data',
        details: validationResult.error.errors,
      }, { status: 400 });
    }

    const { source, points, studentId, teacherId } = validationResult.data;

    // Validate student access restriction: user can only submit scores for themselves
    if (session.user.id !== studentId) {
      return NextResponse.json({
        error: 'Forbidden',
        message: 'You can only submit scores for yourself',
      }, { status: 403 });
    }

    // Create game score record
    const newScore = {
      id: uuidv7(),
      studentId,
      teacherId,
      points,
      source,
      createdAt: new Date(),
    };

    await db.insert(gameScores).values(newScore);

    return NextResponse.json({
      data: newScore,
      message: 'Game score submitted successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error submitting game score:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: 'Failed to submit game score',
    }, { status: 500 });
  }
}
