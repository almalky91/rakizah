import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { gameScores } from '@/db/schema/results';
import { profiles } from '@/db/schema/auth';
import { eq, sql, desc } from 'drizzle-orm';
import { z } from 'zod';

// Zod schema for teacherId parameter validation
const TeacherIdSchema = z.string().uuid('Invalid teacher ID format');

/**
 * GET /api/game-scores/leaderboard/[teacherId]
 * Returns top game scores for a teacher's students
 * 
 * Requirements:
 * - 6.1: Anonymous access allowed (no authentication required)
 * - 16.5: Public leaderboard functionality
 * 
 * Returns: Array of { studentName: string, totalPoints: number, rank: number }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { teacherId: string } }
) {
  try {
    const { teacherId } = params;

    // Validate teacherId parameter
    const validationResult = TeacherIdSchema.safeParse(teacherId);
    if (!validationResult.success) {
      return NextResponse.json({
        error: 'Validation error',
        message: 'Invalid teacher ID format',
        details: validationResult.error.errors,
      }, { status: 400 });
    }

    const validTeacherId = validationResult.data;

    // Query to aggregate scores by student and join with profiles for names
    // Using Drizzle ORM to:
    // 1. Filter game_scores by teacherId
    // 2. Join with profiles to get student full names
    // 3. Group by student and sum points
    // 4. Order by total points descending
    // 5. Limit to top 20 results
    const leaderboardData = await db
      .select({
        studentId: gameScores.studentId,
        studentName: profiles.fullName,
        totalPoints: sql<number>`SUM(${gameScores.points})`.as('total_points'),
      })
      .from(gameScores)
      .innerJoin(profiles, eq(gameScores.studentId, profiles.id))
      .where(eq(gameScores.teacherId, validTeacherId))
      .groupBy(gameScores.studentId, profiles.fullName)
      .orderBy(desc(sql`total_points`))
      .limit(20);

    // Add rank to each entry
    const leaderboard = leaderboardData.map((entry, index) => ({
      rank: index + 1,
      studentName: entry.studentName || 'Unknown Student',
      totalPoints: entry.totalPoints,
    }));

    return NextResponse.json({
      data: leaderboard,
      message: 'Leaderboard retrieved successfully',
    });
  } catch (error) {
    console.error('Error retrieving leaderboard:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: 'Failed to retrieve leaderboard',
    }, { status: 500 });
  }
}
