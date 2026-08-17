import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { publicVideoViews } from '@/db';
import { eq } from 'drizzle-orm';
import { validate } from 'uuid';
import { z } from 'zod';
import { requireOwnershipApp } from '@/lib/auth-helpers-app.js';


/**
 * GET /api/video-views/public/teacher/[id]
 * Tracks anonymous student video view from public pages for specific teacher
 */
export async function GET (
    request: NextRequest,
    { params }: { params: { id: string } })
{
  try {
    const { id } = params;

    // Validate id in UUID format
    if (!validate(id)) {
        return NextResponse.json({
            error: "Invalid id"
        }, { status: 400 });
    }

    // const { session, errorResponse }  = requireOwnershipApp(id);

    // if (errorResponse) return errorResponse;

    const [results] = await db
    .select()
    .from('public_video_views')
    .where(eq(publicVideoViews.teacherId, id));

    return NextResponse.json({
        message: "Public Video Views Retrieved",
        data: results
    });

  } catch (error) {
    console.error('Error tracking public video view:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: 'Failed to track public video view',
    }, { status: 500 });
  }
}

