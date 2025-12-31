import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const email = searchParams.get("email");

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        // 1. Get Teacher by Email
        const teacher = await (prisma as any).teacher.findUnique({
            where: { email },
            include: {
                user: true,
                allocations: {
                    include: {
                        course: true
                    }
                }
            }
        });

        if (!teacher) {
            return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
        }

        // 2. Get Today's Routines
        const days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
        const todayStr = days[new Date().getDay()];

        const todaysRoutines = await (prisma as any).classRoutine.findMany({
            where: {
                allocation: {
                    teacherId: teacher.id
                },
                dayOfWeek: todayStr
            },
            include: {
                allocation: {
                    include: {
                        course: true,
                    }
                }
            },
            orderBy: {
                startTime: 'asc'
            }
        });

        // 3. Get Pending Leaves (that this teacher needs to approve, if HOD?)
        // Or leaves requested by this teacher? 
        // Logic: Usually Dashboard shows "Leaves I need to approve" OR "My Leave Status".
        // Let's assume "Leaves to Approve" if they are HOD, or just "My Allocations" count.
        // For now, let's return allocations count.

        return NextResponse.json({
            teacher,
            stats: {
                totalAllocations: teacher.allocations.length,
                todaysClassesCount: todaysRoutines.length,
            },
            todaysSchedule: todaysRoutines
        });

    } catch (error) {
        console.error("Teacher Stats Error:", error);
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }
}
