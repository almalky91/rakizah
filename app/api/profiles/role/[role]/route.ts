import { db } from '@/db';
import { userRoles, profiles } from "@/db/schema/auth";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server.js";

const validRoles = new Set(["admin", "teacher", "student"]);

export async function GET(
    request: NextRequest,
    { params }: { params: { role: string } }
) {
    const { role } = params;

    try {
        if (!validRoles.has(role)) {
            return NextResponse.json({ error: "Invalid role" }, { status: 400 });
        }

        const rawLimit = Number(request.nextUrl.searchParams.get("limit") ?? "10");
        const rawPage = Number(request.nextUrl.searchParams.get("page") ?? "1");

        let limit = Number.isFinite(rawLimit) ? rawLimit : 10;
        let page = Number.isFinite(rawPage) ? rawPage : 1;

        if (limit < 1) limit = 1;
        if (limit > 100) limit = 100;
        if (page < 1) page = 1;

        const users = await db
            .select({
                id: profiles.id,
                email: profiles.email,
                fullName: profiles.fullName,
                bio: profiles.bio,
                phoneNumber: profiles.phoneNumber,
                schoolName: profiles.schoolName,
                publicSlug: profiles.publicSlug,
                pageTitle: profiles.pageTitle,
                pageTemplate: profiles.pageTemplate,
                subscriptionActive: profiles.subscriptionActive,
                subscriptionEndsAt: profiles.subscriptionEndsAt,
                trialEndsAt: profiles.trialEndsAt,
                updatedAt: profiles.updatedAt,
                userRole: userRoles.role,
            })
            .from(userRoles)
            .where(eq(userRoles.role, role as "admin" | "teacher" | "student"))
            .leftJoin(profiles, eq(userRoles.userId, profiles.id))
            .limit(limit)
            .offset((page - 1) * limit);

        return NextResponse.json({ data: users }, { status: 200 });
    } catch (error) {
        console.error(`Error during fetching profile (roles) data: ${error}`);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}