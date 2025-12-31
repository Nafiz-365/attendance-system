
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import * as jose from "jose";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-change-this";

async function getUserFromToken() {
    const cookieStore = cookies();
    const token = cookieStore.get("token");

    if (!token) return null;

    try {
        const { payload } = await jose.jwtVerify(
            token.value,
            new TextEncoder().encode(JWT_SECRET)
        );
        return payload as { userId: number; email: string; role: string };
    } catch (error) {
        return null;
    }
}

export async function GET() {
    const user = await getUserFromToken();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: user.userId },
            orderBy: { createdAt: "desc" },
            take: 50, // Limit to last 50
        });
        return NextResponse.json(notifications);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch notifications" },
            { status: 500 }
        );
    }
}

export async function PATCH(request: Request) {
    const user = await getUserFromToken();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { id, all } = body; // id to mark specific as read, all=true to mark all

        if (all) {
            await prisma.notification.updateMany({
                where: { userId: user.userId, isRead: false },
                data: { isRead: true },
            });
        } else if (id) {
            // Create permission check
            const notification = await prisma.notification.findUnique({ where: { id } });
            if (!notification || notification.userId !== user.userId) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
            }

            await prisma.notification.update({
                where: { id },
                data: { isRead: true },
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to update notification" },
            { status: 500 }
        );
    }
}
