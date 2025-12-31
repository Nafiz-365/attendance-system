import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';


// GET: Fetch all courses for the logged-in user
export async function GET(request: Request) {
    const session = await getSession(request);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const courses = await prisma.course.findMany({
            where: {
                userId: Number(session.userId)
            },
            include: {
                department: true
            }
        });

        return NextResponse.json(courses);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST: Create a new course
export async function POST(request: Request) {
    const session = await getSession(request);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { name, code, credits, departmentId, instructor } = body;

        const newCourse = await prisma.course.create({
            data: {
                name,
                code,
                credits: Number(credits),
                instructor,
                departmentId: Number(departmentId),
                userId: Number(session.userId)
            }
        });

        return NextResponse.json(newCourse);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
