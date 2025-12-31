import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const sessions = await (prisma as any).academicSession.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { allocations: true }
                }
            }
        });
        return NextResponse.json(sessions);
    } catch (error) {
        console.error("GET Session Error:", error);
        return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, startDate, endDate, isActive } = body;

        const session = await (prisma as any).academicSession.create({
            data: {
                name,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                isActive: isActive || false,
            }
        });

        return NextResponse.json(session);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { id, isActive } = body;

        if (isActive) {
            // Deactivate all other sessions first logic
            await (prisma as any).academicSession.updateMany({
                where: { id: { not: id }, isActive: true },
                data: { isActive: false }
            });
        }

        const session = await (prisma as any).academicSession.update({
            where: { id: parseInt(id) },
            data: { isActive }
        });

        return NextResponse.json(session);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update session" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

        await (prisma as any).academicSession.delete({
            where: { id: parseInt(id) }
        });

        return NextResponse.json({ message: "Session deleted" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete session" }, { status: 500 });
    }
}
