import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { games } from '@/db/schema/content';
import { requireOwnership } from '@/lib/auth-helpers';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// Zod schema for game update validation
const UpdateGameSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long').optional(),
  gameType: z.string().min(1, 'Game type is required').max(50, 'Game type too long').optional(),
  config: z.record(z.any()).or(z.array(z.any())).optional(), // JSON object or array for game configuration
});

/**
 * GET /api/games/[id]
 * Retrieves a single game by ID
 * Anonymous access allowed for public playing
 * 
 * Requirements: 7.2 (GET endpoint), 10.5 (Anonymous access)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const [game] = await db
      .select()
      .from(games)
      .where(eq(games.id, params.id))
      .limit(1);

    if (!game) {
      return NextResponse.json(
        {
          error: 'Not found',
          message: 'Game not found',
        },
        { status: 404 }
      );
    }

    // Parse config JSON string to object for response
    const gameWithParsedConfig = {
      ...game,
      config: typeof game.config === 'string' ? JSON.parse(game.config) : game.config,
    };

    return NextResponse.json({
      data: gameWithParsedConfig,
      message: 'Game retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching game:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to retrieve game',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/games/[id]
 * Updates an existing game (owner or admin only)
 * Body: { title?: string, gameType?: string, config?: JSON }
 * 
 * Requirements: 7.2 (PUT endpoint), 7.3 (Ownership validation)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Fetch the game to check ownership
    const [existingGame] = await db
      .select()
      .from(games)
      .where(eq(games.id, params.id))
      .limit(1);

    if (!existingGame) {
      return NextResponse.json(
        {
          error: 'Not found',
          message: 'Game not found',
        },
        { status: 404 }
      );
    }

    // Require ownership (owner or admin)
    const session = await requireOwnership(request, existingGame.teacherId);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You do not have permission to update this game' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validationResult = UpdateGameSchema.safeParse(body);
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

    const updateData = validationResult.data;

    // If no fields to update, return error
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          error: 'Bad request',
          message: 'No fields to update',
        },
        { status: 400 }
      );
    }

    // Prepare update object with JSON stringification for config
    const updateObject: any = {};
    if (updateData.title !== undefined) updateObject.title = updateData.title;
    if (updateData.gameType !== undefined) updateObject.gameType = updateData.gameType;
    if (updateData.config !== undefined) updateObject.config = JSON.stringify(updateData.config);

    // Update the game
    await db
      .update(games)
      .set(updateObject)
      .where(eq(games.id, params.id));

    // Fetch updated game
    const [updatedGame] = await db
      .select()
      .from(games)
      .where(eq(games.id, params.id))
      .limit(1);

    // Parse config for response
    const gameWithParsedConfig = {
      ...updatedGame,
      config: typeof updatedGame!.config === 'string' ? JSON.parse(updatedGame!.config) : updatedGame!.config,
    };

    return NextResponse.json({
      data: gameWithParsedConfig,
      message: 'Game updated successfully',
    });
  } catch (error) {
    console.error('Error updating game:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to update game',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/games/[id]
 * Deletes a game (owner or admin only)
 * 
 * Requirements: 7.3 (DELETE endpoint with ownership validation)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Fetch the game to check ownership
    const [existingGame] = await db
      .select()
      .from(games)
      .where(eq(games.id, params.id))
      .limit(1);

    if (!existingGame) {
      return NextResponse.json(
        {
          error: 'Not found',
          message: 'Game not found',
        },
        { status: 404 }
      );
    }

    // Require ownership (owner or admin)
    const session = await requireOwnership(request, existingGame.teacherId);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You do not have permission to delete this game' },
        { status: 403 }
      );
    }

    // Delete the game
    await db
      .delete(games)
      .where(eq(games.id, params.id));

    return NextResponse.json({
      message: 'Game deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting game:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to delete game',
      },
      { status: 500 }
    );
  }
}
