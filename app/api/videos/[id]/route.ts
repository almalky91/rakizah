import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { videos } from '@/db/schema/content';
import { requireOwnership } from '@/lib/auth-helpers';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// Zod schema for video update validation
const UpdateVideoSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long').optional(),
  youtubeUrl: z.string().url('Invalid YouTube URL').max(500, 'URL too long').optional(),
});

/**
 * GET /api/videos/[id]
 * Retrieves a single video by ID
 * Anonymous access allowed for public viewing
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const [video] = await db
      .select()
      .from(videos)
      .where(eq(videos.id, params.id))
      .limit(1);

    if (!video) {
      return NextResponse.json(
        {
          error: 'Not found',
          message: 'Video not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: video,
      message: 'Video retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching video:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to retrieve video',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/videos/[id]
 * Updates a video (owner or admin only)
 * Body: { title?: string, youtubeUrl?: string }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // First, fetch the video to check ownership
    const [video] = await db
      .select()
      .from(videos)
      .where(eq(videos.id, params.id))
      .limit(1);

    if (!video) {
      return NextResponse.json(
        {
          error: 'Not found',
          message: 'Video not found',
        },
        { status: 404 }
      );
    }

    // Require ownership (teacher who created it or admin)
    const session = await requireOwnership(request, video.teacherId);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You do not have permission to update this video' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validationResult = UpdateVideoSchema.safeParse(body);
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

    const updateData: any = {};
    if (validationResult.data.title) {
      updateData.title = validationResult.data.title;
    }
    if (validationResult.data.youtubeUrl) {
      updateData.youtubeUrl = validationResult.data.youtubeUrl;
    }

    // Update video
    await db
      .update(videos)
      .set(updateData)
      .where(eq(videos.id, params.id));

    // Fetch updated video
    const [updatedVideo] = await db
      .select()
      .from(videos)
      .where(eq(videos.id, params.id))
      .limit(1);

    return NextResponse.json({
      data: updatedVideo,
      message: 'Video updated successfully',
    });
  } catch (error) {
    console.error('Error updating video:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to update video',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/videos/[id]
 * Deletes a video (owner or admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // First, fetch the video to check ownership
    const [video] = await db
      .select()
      .from(videos)
      .where(eq(videos.id, params.id))
      .limit(1);

    if (!video) {
      return NextResponse.json(
        {
          error: 'Not found',
          message: 'Video not found',
        },
        { status: 404 }
      );
    }

    // Require ownership (teacher who created it or admin)
    const session = await requireOwnership(request, video.teacherId);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You do not have permission to delete this video' },
        { status: 403 }
      );
    }

    // Delete video (cascade will handle related records)
    await db.delete(videos).where(eq(videos.id, params.id));

    return NextResponse.json({
      data: { id: params.id },
      message: 'Video deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting video:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to delete video',
      },
      { status: 500 }
    );
  }
}
