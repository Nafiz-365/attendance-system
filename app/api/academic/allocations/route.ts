import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const sessionId = searchParams.get("sessionId");

        const where = sessionId ? { sessionId: parseInt(sessionId) } : {};

        const allocations = await (prisma as any).subjectAllocation.findMany({
            where,
            include: {
                course: true,
                teacher: {
                    include: { user: true }
                },
                session: true,
                _count: {
                    select: { attendance: true }
                }
            },
            orderBy: { id: 'desc' }
        });
        return NextResponse.json(allocations);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch allocations" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { teacherId, courseId, batch, section, sessionId } = body;

        // Check if allocation already exists
        const existing = await (prisma as any).subjectAllocation.findFirst({
            where: {
                courseId: parseInt(courseId),
                batch,
                section,
                sessionId: parseInt(sessionId)
            }
        });

        if (existing) {
            return NextResponse.json({ error: "Allocation already exists for this course, batch and session" }, { status: 400 });
        }

        const allocation = await (prisma as any).subjectAllocation.create({
            data: {
                teacherId: parseInt(teacherId),
                courseId: parseInt(courseId),
                batch,
                section,
                sessionId: parseInt(sessionId)
            },
            include: {
                course: true,
                teacher: true,
                session: true
            }
        });

        return NextResponse.json(allocation);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to create allocation" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Allocation ID is required" }, { status: 400 });
        }

        await (prisma as any).subjectAllocation.delete({
            where: { id: parseInt(id) }
        });

        return NextResponse.json({ message: "Allocation deleted" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete allocation" }, { status: 500 });
    }
}
