import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// GET: Fetch all departments
export async function GET(request: Request) {
    console.log("Departments API Hit");
    const session = await getSession(request);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { role, userId } = session as any;
        const whereClause: any = {};

        // If Teacher, only show their department (if assigned)
        if (role === 'TEACHER') {
            const teacher = await prisma.teacher.findUnique({
                where: { userId: Number(userId) },
                select: { departmentId: true }
            });
            if (teacher) {
                whereClause.id = teacher.departmentId;
            } else {
                return NextResponse.json([]);
            }
        }
        // If Admin, show ALL departments

        const departments = await prisma.department.findMany({
            where: whereClause,
            include: {
                _count: {
                    select: { students: true }
                }
            }
        });

        // Map to match frontend expected format if needed
        const formatted = departments.map((d: any) => ({
            ...d,
            totalStudents: d._count.students,
            activeStudents: d._count.students // For now assuming all are active
        }));

        return NextResponse.json(formatted);
    } catch (error) {
        console.error("Departments GET Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST: Create a new department
export async function POST(request: Request) {
    const session = await getSession(request);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // 1. Verify User really exists (Fix for Stale Token after DB Reset)
        const userExists = await prisma.user.findUnique({
            where: { id: Number(session.userId) }
        });

        if (!userExists) {
            // User deleted but token remains? Force Logout.
            const response = NextResponse.json({ error: 'Session invalid. Please login again.' }, { status: 401 });
            response.cookies.delete('token');
            return response;
        }

        // 2. Security: Only Admin can create departments
        if (session.role !== 'ADMIN' && userExists.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden. Admins only.' }, { status: 403 });
        }

        const body = await request.json();
        const { name, code, hod } = body;

        const newDept = await prisma.department.create({
            data: {
                name,
                code: code.toUpperCase(),
                hod,
                userId: Number(session.userId)
            }
        });

        return NextResponse.json({
            ...newDept,
            totalStudents: 0,
            activeStudents: 0
        });
    } catch (error: any) {
        console.error("Departments POST Error:", error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
