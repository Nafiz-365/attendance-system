import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth"; // Assuming this helper exists or similar logic

export async function GET() {
    try {
        const notices = await (prisma as any).notice.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                author: {
                    select: { name: true, role: true }
                }
            }
        });
        return NextResponse.json(notices);
    } catch (error) {
        console.error("GET Notices Error:", error);
        return NextResponse.json({ error: "Failed to fetch notices" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        // Get session to verify user is authenticated
        const session = await getSession(req);
        if (!session || !session.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { title, content, audience } = body;

        // Basic validation
        if (!title || !content || !audience) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const notice = await (prisma as any).notice.create({
            data: {
                title,
                content,
                audience,
                authorId: Number(session.userId),
                isPublished: true
            }
        });

        return NextResponse.json(notice);
    } catch (error) {
        console.error("POST Notice Error:", error);
        return NextResponse.json({ error: "Failed to create notice" }, { status: 500 });
    }
}
