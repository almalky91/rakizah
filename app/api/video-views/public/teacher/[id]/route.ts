import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { publicVideoViews } from '@/db';
import { eq, count } from 'drizzle-orm';
import { validate } from 'uuid';

/**
 * GET /api/video-views/public/teacher/[id]
 * Retrieves count and details of anonymous student video views for a specific teacher
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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

    // Fetch all public video views for this teacher
    const results = await db
      .select()
      .from(publicVideoViews)
      .where(eq(publicVideoViews.teacherId, id));

    return NextResponse.json({
      message: 'Public video views retrieved',
      data: results,
      count: results.length,
    });
  } catch (error) {
    console.error('Error retrieving public video views:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to retrieve public video views',
      },
      { status: 500 }
    );
  }
}

