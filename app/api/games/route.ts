import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { games } from '@/db/schema/content';
import { requireRole } from '@/lib/auth-helpers';
import { eq } from 'drizzle-orm';
import { v7 as uuidv7 } from 'uuid';
import { z } from 'zod';

// Zod schema for game validation
const CreateGameSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  gameType: z.string().min(1, 'Game type is required').max(50, 'Game type too long'),
  config: z.record(z.any()).or(z.array(z.any())), // JSON object or array for game configuration
});

/**
 * GET /api/games
 * Retrieves list of games with optional teacherId filter
 * Query params:
 *   - teacherId: Optional filter for games by specific teacher
 * 
 * Requirements: 6.1 (List games), 7.1 (GET endpoint)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');

    let gameList;
    if (teacherId) {
      // Filter by teacherId
      gameList = await db
        .select()
        .from(games)
        .where(eq(games.teacherId, teacherId));
    } else {
      // Return all games
      gameList = await db.select().from(games);
    }

    return NextResponse.json({
      data: gameList,
      message: 'Games retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching games:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to retrieve games',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/games
 * Creates a new game (teacher/admin only)
 * Body: { title: string, gameType: string, config: JSON }
 * 
 * Requirements: 6.2 (Create game), 6.3 (Validate game data), 7.2 (POST endpoint), 
 *               7.3 (Zod validation), 10.3 (Teacher/admin role check)
 */
export async function POST(request: NextRequest) {
  // Require teacher or admin role
  const session = await requireRole(request, ['teacher', 'admin']);
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    // Validate request body
    const validationResult = CreateGameSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation error',
          message: 'Invalid game data',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { title, gameType, config } = validationResult.data;

    // Create new game
    const newGame = {
      id: uuidv7(),
      teacherId: session.user.id,
      title,
      gameType,
      config: JSON.stringify(config),
      createdAt: new Date(),
    };

    await db.insert(games).values(newGame);

    // Return created game with parsed config
    return NextResponse.json(
      {
        data: {
          ...newGame,
          config: config, // Return as object, not string
        },
        message: 'Game created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating game:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to create game',
      },
      { status: 500 }
    );
  }
}
