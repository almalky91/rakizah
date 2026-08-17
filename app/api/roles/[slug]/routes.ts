import { db } from "@/db/index.js";
import { NextRequest, NextResponse } from "next/server";
import { userRoles } from '@/db/schema/auth.js'

export async function GET(
    request: NextRequest,
    { params, query }: { params: { role: string }, query: { page: number, limit: number } }
) {
    const { role } = params;
    let { page = 1, limit = 10 } = query;

    try {
        if (limit > 100)
            limit = 10;

        if (!['admin', 'teacher', 'student'].includes(role)) {
            return NextResponse.json({ error: "Invalid role type" }, {
                status: 400
            });
        }

        const [roles] = await db
        .select({
            id: userRoles,
            user_id: userRoles.userId,
            user_role: userRoles.role
        }).from(userRoles)
        .limit(limit)
        .offset((page - 1) * limit);

        if (!roles)
            return NextResponse.json({ error: "User roles not found" }, { status: 404 });

        // Return user roles data
        return NextResponse.json({ data: roles });
    } catch(error) {
        console.error("Error fetching roles:", error.message);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}