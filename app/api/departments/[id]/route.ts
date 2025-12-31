
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

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

        await prisma.department.delete({
            where: {
                id: id
            }
        });

        return NextResponse.json({ message: 'Department deleted successfully' });
    } catch (error: any) {
        if (error.code === 'P2003') {
            return NextResponse.json({ error: 'Cannot delete department with existing students or courses.' }, { status: 400 });
        }
        console.error('Delete Department Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

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
        const { name, code, hod } = body;

        const department = await prisma.department.update({
            where: { id },
            data: {
                name,
                code,
                hod,
            }
        });

        return NextResponse.json(department);
    } catch (error: any) {
        console.error('Update Department Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
