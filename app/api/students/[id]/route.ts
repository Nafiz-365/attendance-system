
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
        // Extract fields to allow partial updates
        const { name, studentId, email, phone, departmentId, batch, section, semester } = body;

        const student = await prisma.student.update({
            where: { id },
            data: {
                name,
                studentId,
                email,
                phone,
                departmentId: departmentId ? parseInt(departmentId) : undefined,
                batch,
                section,
                semester
            }
        });

        return NextResponse.json(student);
    } catch (error: any) {
        console.error('Update Student Error:', error);
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
        console.log(`DELETE API received request for ID: ${params.id}`);
        const id = parseInt(params.id);
        if (isNaN(id)) {
            console.error('Invalid ID received');
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        // Find student first to get userId
        const student = await prisma.student.findUnique({
            where: { id },
            select: { userId: true }
        });

        if (student && student.userId) {
            console.log(`Found linked User ID: ${student.userId}. Attempting cascade delete...`);
            try {
                await prisma.user.delete({
                    where: { id: student.userId }
                });
                console.log('User deleted successfully (Student should cascade)');
            } catch (userErr) {
                console.error('Failed to delete linked User, attempting to delete Student directly:', userErr);
                // Fallback: Delete student if user delete failed (maybe user missing)
                await prisma.student.delete({ where: { id } });
            }
        } else {
            console.log('No linked User found or Student missing specific user link. Deleting Student directly...');
            await prisma.student.delete({ where: { id } });
        }

        return NextResponse.json({ message: 'Student deleted successfully' });
    } catch (error: any) {
        console.error('Delete Student Error Traced:', error);
        // Ensure error is serializable
        const errorMessage = error instanceof Error ? error.message : String(error);
        return NextResponse.json({
            error: errorMessage || 'Unknown Error Occurred',
            details: JSON.stringify(error, Object.getOwnPropertyNames(error))
        }, { status: 500 });
    }
}
