import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { studentIds, newSemester, newSection } = body;

        if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
            return NextResponse.json({ error: "No students selected" }, { status: 400 });
        }

        if (!newSemester) {
            return NextResponse.json({ error: "New semester is required" }, { status: 400 });
        }

        const updateData: any = { semester: newSemester };
        if (newSection) {
            updateData.section = newSection;
        }

        const result = await (prisma as any).student.updateMany({
            where: {
                id: {
                    in: studentIds
                }
            },
            data: updateData
        });

        return NextResponse.json({
            message: "Students promoted successfully",
            count: result.count
        });

    } catch (error) {
        console.error("Promotion Error:", error);
        return NextResponse.json({ error: "Failed to promote students" }, { status: 500 });
    }
}
