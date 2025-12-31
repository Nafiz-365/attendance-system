import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
    const session = await getSession(request);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const student = await prisma.student.findFirst({
            where: { email: String(session.email) }
        });

        if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 });

        // Find active session first
        const activeSession = await prisma.academicSession.findFirst({
            where: { isActive: true }
        });

        if (!activeSession) return NextResponse.json({ courses: [] });

        // Find allocations for this student's batch/section in active session
        const allocations = await prisma.subjectAllocation.findMany({
            where: {
                batch: student.batch,
                section: student.section,
                sessionId: activeSession.id
            },
            include: {
                course: true,
                teacher: true,
                // optimized: include attendance count for this course
                _count: {
                    select: { attendance: { where: { studentId: student.id } } }
                }
            }
        });

        return NextResponse.json(allocations);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
