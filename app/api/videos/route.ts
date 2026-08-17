import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { videos } from '@/db/schema/content';
import { requireRoleApp } from '@/lib/auth-helpers-app';
import { eq } from 'drizzle-orm';
import { v7 as uuidv7 } from 'uuid';
import { z } from 'zod';

// Zod schema for video validation
const CreateVideoSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  youtubeUrl: z.string().url('Invalid YouTube URL').max(500, 'URL too long'),
});

/**
 * GET /api/videos
 * Retrieves list of videos with optional teacherId filter
 * Query params:
 *   - teacherId: Optional filter for videos by specific teacher
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');

    let videoList;
    if (teacherId) {
      // Filter by teacherId
      videoList = await db
        .select()
        .from(videos)
        .where(eq(videos.teacherId, teacherId));
    } else {
      // Return all videos
      videoList = await db.select().from(videos);
    }

    return NextResponse.json({
      data: videoList,
      message: 'Videos retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to retrieve videos',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/videos
 * Creates a new video (teacher/admin only)
 * Body: { title: string, youtubeUrl: string }
 */
export async function POST(request: NextRequest) {
  // Require teacher or admin role
  const { session, errorResponse } = await requireRoleApp(['teacher', 'admin']);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();

    // Validate request body
    const validationResult = CreateVideoSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation error',
          message: 'Invalid video data',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { title, youtubeUrl } = validationResult.data;

    // Create new video
    const newVideo = {
      id: uuidv7(),
      teacherId: session!.user.id,
      title,
      youtubeUrl,
      views: 0,
      createdAt: new Date(),
    };

    await db.insert(videos).values(newVideo);

    return NextResponse.json(
      {
        data: newVideo,
        message: 'Video created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating video:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to create video',
      },
      { status: 500 }
    );
  }
}
