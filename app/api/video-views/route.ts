import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { videoViews, videos } from '@/db';
import { requireAuth } from '@/lib/auth-helpers';
import { eq, sql } from 'drizzle-orm';
import { v7 as uuidv7 } from 'uuid';
import { z } from 'zod';

// Zod schema for video view tracking (authenticated users)
const TrackVideoViewSchema = z.object({
  videoId: z.string().uuid('Invalid video ID format'),
});

/**
 * POST /api/video-views
 * Tracks authenticated student video view
 * Body: { videoId: string }
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
    const validationResult = TrackVideoViewSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({
        error: 'Validation error',
        message: 'Invalid video view data',
        details: validationResult.error.errors,
      }, { status: 400 });
    }

    const { videoId } = validationResult.data;

    // Fetch video to get teacherId and verify it exists
    const [video] = await db
      .select()
      .from(videos)
      .where(eq(videos.id, videoId))
      .limit(1);

    if (!video) {
      return NextResponse.json({
        error: 'Not found',
        message: 'Video not found',
      }, { status: 404 });
    }

    // Create video view record
    const newView = {
      id: uuidv7(),
      videoId,
      studentId: session.user.id,
      teacherId: video.teacherId,
      viewedAt: new Date(),
    };

    await db.insert(videoViews).values(newView);

    // Increment video views counter
    await db
      .update(videos)
      .set({
        views: sql`${videos.views} + 1`,
      })
      .where(eq(videos.id, videoId));

    return NextResponse.json({
      data: newView,
      message: 'Video view tracked successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error tracking video view:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: 'Failed to track video view',
    }, { status: 500 });
  }
}
