import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// GET: Fetch leave requests
// Admin: Fetch all (with filters optional)
// Student: Fetch own
export async function GET(request: Request) {
    const session = await getSession(request);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        const whereClause: any = {};
        if (status) whereClause.status = status;

        // Determine user identity
        const student = await prisma.student.findFirst({
            where: { userId: Number(session.userId) }
        });

        const teacher = !student ? await prisma.teacher.findUnique({
            where: { userId: Number(session.userId) }
        }) : null;

        if (session.role === 'ADMIN') {
            // Admin sees all leaves
        } else if (student) {
            whereClause.studentId = student.id;
        } else if (teacher) {
            // Teacher sees: Own leaves OR Student leaves from same department
            whereClause.OR = [
                { teacherId: teacher.id },
                { student: { departmentId: teacher.departmentId } }
            ];
        } else {
            return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
        }

        const leaves = await prisma.leaveRequest.findMany({
            where: whereClause,
            include: {
                student: {
                    select: {
                        name: true,
                        studentId: true,
                        batch: true,
                        section: true,
                        department: { select: { code: true } }
                    }
                },
                teacher: {
                    select: {
                        name: true,
                        employeeId: true,
                        department: { select: { code: true } }
                    }
                },
                approvedBy: {
                    select: {
                        name: true,
                        role: true
                    }
                }
            } as any,
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(leaves);

    } catch (error) {
        console.error('Fetch Leaves Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST: Apply for leave
export async function POST(request: Request) {
    const session = await getSession(request);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { startDate, endDate, reason } = body;

        if (!startDate || !endDate || !reason) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Find profile
        const student = await prisma.student.findFirst({
            where: { userId: Number(session.userId) }
        });

        const teacher = !student ? await prisma.teacher.findUnique({
            where: { userId: Number(session.userId) }
        }) : null;

        if (!student && !teacher) {
            return NextResponse.json({ error: 'Only students or teachers can apply for leave' }, { status: 403 });
        }

        const leave = await prisma.leaveRequest.create({
            data: {
                studentId: student?.id,
                teacherId: teacher?.id,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                reason,
                status: 'PENDING'
            } as any
        });

        return NextResponse.json(leave);

    } catch (error) {
        console.error('Apply Leave Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
