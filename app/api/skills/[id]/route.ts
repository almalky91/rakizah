import { db } from '@/db';
import { skills } from '@/db/schema/skills';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { requireRoleApp } from '@/lib/auth-helpers-app';

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    const skillId = params.id;

    try {
        // Check admin authentication here if needed
        const { session, errorResponse } = await requireRoleApp(['admin']);

        if (errorResponse) return errorResponse;

        await db.delete(skills).where(eq(skills.id, skillId));

        return NextResponse.json({ message: 'Skill deleted successfully' });
    } catch(error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}