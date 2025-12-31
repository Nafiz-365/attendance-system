import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
    const session = await getSession(request);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Find the student record associated with this user's email identity
        const student = await prisma.student.findFirst({
            where: { email: String(session.email) }
        });

        if (!student) {
            return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
        }

        // Fetch attendance stats
        const totalClasses = await prisma.attendance.count({
            where: { studentId: student.id }
        });

        const presentCount = await prisma.attendance.count({
            where: { studentId: student.id, status: 'Present' }
        });

        const absentCount = await prisma.attendance.count({
            where: { studentId: student.id, status: 'Absent' }
        });

        const lateCount = await prisma.attendance.count({
            where: { studentId: student.id, status: 'Late' }
        });

        const recentActivity = await (prisma as any).attendance.findMany({
            where: { studentId: student.id },
            orderBy: { date: 'desc' },
            take: 5,
            include: {
                allocation: {
                    include: {
                        course: true,
                        teacher: true
                    }
                }
            }
        });

        const attendanceRate = totalClasses > 0
            ? Math.round(((presentCount + lateCount) / totalClasses) * 100)
            : 0;

        return NextResponse.json({
            studentName: student.name,
            studentId: student.studentId,
            batch: student.batch,
            section: student.section,
            stats: {
                attendanceRate,
                totalClasses,
                presentCount,
                absentCount,
                lateCount
            },
            recentActivity
        });

    } catch (error) {
        console.error('Student Stats Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
