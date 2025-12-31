import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function PUT(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const session = await getSession(request);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const id = parseInt(params.id);
        const body = await request.json();
        const { name, code, credits, instructor, departmentId } = body;

        const course = await prisma.course.update({
            where: { id },
            data: {
                name,
                code,
                credits,
                instructor,
                departmentId: parseInt(departmentId)
            }
        });

        return NextResponse.json(course);
    } catch (error: any) {
        console.error('Update Course Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const session = await getSession(request);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const id = parseInt(params.id);

        await prisma.course.delete({
            where: {
                id: id
            }
        });

        return NextResponse.json({ message: 'Course deleted successfully' });
    } catch (error: any) {
        if (error.code === 'P2003') {
            return NextResponse.json({ error: 'Cannot delete course with associated records.' }, { status: 400 });
        }
        console.error('Delete Course Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
