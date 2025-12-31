import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
    const session = await getSession(request);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const student = await prisma.student.findFirst({
            where: { email: String(session.email) }
        });

        if (!student) {
            return NextResponse.json({ error: 'Student found' }, { status: 404 });
        }

        const attendance = await prisma.attendance.findMany({
            where: { studentId: student.id },
            orderBy: { date: 'desc' },
            include: {
                allocation: {
                    include: {
                        course: true,
                        teacher: true
                    }
                }
            }
        });

        const stats = {
            total: attendance.length,
            present: attendance.filter(a => a.status === 'Present').length,
            absent: attendance.filter(a => a.status === 'Absent').length,
            late: attendance.filter(a => a.status === 'Late').length,
            percentage: attendance.length > 0
                ? Math.round((attendance.filter(a => a.status === 'Present' || a.status === 'Late').length / attendance.length) * 100)
                : 0
        };

        return NextResponse.json({
            attendance,
            stats
        });

    } catch (error) {
        console.error('Student Attendance Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
