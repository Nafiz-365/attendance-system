import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';


// GET: Fetch attendance records (can filter by date, student, class)
export async function GET(request: Request) {
    const session = await getSession(request);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const studentId = searchParams.get('studentId');
    const batch = searchParams.get('batch');
    const section = searchParams.get('section');
    const allocationId = searchParams.get('allocationId');

    const { role, userId } = session as any;

    try {
        const whereClause: any = {};

        if (role === 'STUDENT') {
            const studentRecord = await prisma.student.findFirst({
                where: { email: session.email as string }
            });
            if (!studentRecord) return NextResponse.json({ error: 'Student record not found' }, { status: 404 });
            whereClause.studentId = studentRecord.id;
        } else if (role === 'TEACHER') {
            const teacher = await prisma.teacher.findUnique({
                where: { userId: Number(userId) },
                select: { departmentId: true }
            });
            if (!teacher) return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 });

            // Filter attendance by students in teacher's department
            whereClause.student = {
                departmentId: teacher.departmentId
            };
        } else {
            // Admin sees all
            // whereClause.student = {
            //     userId: Number(userId)
            // };
        }

        if (date) {
            const start = new Date(date);
            start.setHours(0, 0, 0, 0);
            const end = new Date(date);
            end.setHours(23, 59, 59, 999);
            whereClause.date = { gte: start, lte: end };
        }

        if (studentId) whereClause.studentId = Number(studentId);

        // Handling deep filtering for batch/section inside student
        if (batch || section) {
            whereClause.student = {
                ...whereClause.student || {},
            };
            if (batch) whereClause.student.batch = batch;
            if (section) whereClause.student.section = section;
        }

        if (allocationId) {
            whereClause.allocationId = parseInt(allocationId);
        }

        const attendance = await prisma.attendance.findMany({
            where: whereClause,
            include: {
                student: true
            },
            orderBy: {
                student: { studentId: 'asc' }
            }
        });

        return NextResponse.json(attendance);
    } catch (error) {
        console.error("Attendance fetch error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST: Mark attendance for a student (Bulk Support)
export async function POST(request: Request) {
    const session = await getSession(request);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { records, allocationId, date } = body;
        // records: [{ studentId: 1, status: 'Present' }, ...]

        if (!records || !Array.isArray(records) || records.length === 0) {
            return NextResponse.json({ error: 'Missing records array' }, { status: 400 });
        }

        const recordDate = date ? new Date(date) : new Date();
        const allocIdInt = allocationId ? parseInt(allocationId) : null;

        // Create records in transaction
        const createdRecords = await prisma.$transaction(
            records.map((rec: any) =>
                (prisma as any).attendance.create({
                    data: {
                        studentId: parseInt(rec.studentId),
                        status: rec.status,
                        date: recordDate,
                        allocationId: allocIdInt
                    }
                })
            )
        );

        return NextResponse.json({ success: true, count: createdRecords.length });

    } catch (error) {
        console.error("Attendance create error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
