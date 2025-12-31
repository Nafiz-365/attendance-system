import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const sessionId = searchParams.get("sessionId");
        const batch = searchParams.get("batch");
        const section = searchParams.get("section");
        const teacherId = searchParams.get("teacherId");

        let where: any = {};

        // Filter by Session
        if (sessionId) {
            where.allocation = { sessionId: parseInt(sessionId) };
        }

        // Filter by Batch/Section
        if (batch && section) {
            where.allocation = {
                ...where.allocation,
                batch,
                section
            };
        }

        // Filter by Teacher
        if (teacherId) {
            where.allocation = {
                ...where.allocation,
                teacherId: parseInt(teacherId)
            };
        }

        const routines = await (prisma as any).classRoutine.findMany({
            where,
            include: {
                allocation: {
                    include: {
                        course: true,
                        teacher: true,
                        session: true
                    }
                }
            },
            orderBy: [
                { dayOfWeek: 'asc' }, // Monday first (assuming enum order)
                { startTime: 'asc' }
            ]
        });

        return NextResponse.json(routines);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to fetch routines" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { allocationId, dayOfWeek, startTime, endTime, roomNo } = body;

        // TODO: Add conflict check (Teacher or Room busy at this time)
        // For now, simple create
        const routine = await (prisma as any).classRoutine.create({
            data: {
                allocationId: parseInt(allocationId),
                dayOfWeek,
                startTime,
                endTime,
                roomNo
            }
        });

        return NextResponse.json(routine);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create routine slot" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        await (prisma as any).classRoutine.delete({
            where: { id: parseInt(id) }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete routine" }, { status: 500 });
    }
}
