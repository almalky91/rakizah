import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { publicVideoViews, videos } from '@/db';
import { eq, sql } from 'drizzle-orm';
import { v7 as uuidv7 } from 'uuid';
import { z } from 'zod';

// Zod schema for anonymous/public video view tracking
const TrackPublicVideoViewSchema = z.object({
  videoId: z.string().uuid('Invalid video ID format'),
  studentName: z.string().min(1, 'Student name is required').max(255, 'Name too long'),
});

/**
 * POST /api/video-views/public
 * Tracks anonymous student video view from public pages
 * Body: { videoId: string, studentName: string }
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate request body
    const validationResult = TrackPublicVideoViewSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({
        error: 'Validation error',
        message: 'Invalid video view data',
        details: validationResult.error.errors,
      }, { status: 400 });
    }

    const { videoId, studentName } = validationResult.data;

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

    // Create public video view record
    const newView = {
      id: uuidv7(),
      videoId,
      teacherId: video.teacherId,
      studentName,
      viewedAt: new Date(),
    };

    await db.insert(publicVideoViews).values(newView);

    // Increment video views counter
    await db
      .update(videos)
      .set({
        views: sql`${videos.views} + 1`,
      })
      .where(eq(videos.id, videoId));

    return NextResponse.json({
      data: newView,
      message: 'Public video view tracked successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error tracking public video view:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: 'Failed to track public video view',
    }, { status: 500 });
  }
}

