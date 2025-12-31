import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// PUT: Update status (Approve/Reject)
export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
    const session = await getSession(request);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await context.params;
        const body = await request.json();
        const { status } = body; // APPROVED, REJECTED

        if (!['APPROVED', 'REJECTED'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        // Verify Admin (User owner) or Global Admin
        const leave = await prisma.leaveRequest.findUnique({
            where: { id: parseInt(id) },
            include: {
                student: true,
                teacher: true
            } as any
        }) as any;

        if (!leave) {
            return NextResponse.json({ error: 'Leave request not found' }, { status: 404 });
        }

        // Global Admin Override
        if (session.role === 'ADMIN') {
            // Allowed
        } else {
            // Check ownership or authority

            // 1. User is the creator (Student or Teacher checking their own status? No, usually they can't approve their own)
            // But strict ownership was here before? Removing self-approval if that was implied.
            // Actually, the previous logic `isStudentOwner` probably meant "Are you allowed to update this?". 
            // Usually only Admin/Teacher updates status. Students shouldn't "PUT" status.
            // But let's check if the user is a Teacher of the same department.

            const teacher = await prisma.teacher.findUnique({
                where: { userId: Number(session.userId) }
            });

            const isDeptTeacher = teacher && leave.student && leave.student.departmentId === teacher.departmentId;

            if (!isDeptTeacher) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
        }

        const updatedLeave = await prisma.leaveRequest.update({
            where: { id: parseInt(id) },
            data: {
                status,
                // @ts-ignore
                approvedById: Number(session.userId)
            }
        });

        return NextResponse.json(updatedLeave);

    } catch (error) {
        console.error('Update Leave Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// DELETE: Cancel request
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
    const session = await getSession(request);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await context.params;

        const leave = await prisma.leaveRequest.findUnique({
            where: { id: parseInt(id) },
            include: { student: true, teacher: true } as any
        }) as any;

        if (!leave) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        // Determine if user is student or admin
        const student = await prisma.student.findFirst({
            where: { email: session.email as string }
        });

        const isAdmin = leave.student.userId === Number(session.userId);
        const isOwnerStudent = student && student.id === leave.studentId;

        if (!isAdmin && !isOwnerStudent) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // If student, can only delete if PENDING
        if (isOwnerStudent && leave.status !== 'PENDING') {
            return NextResponse.json({ error: 'Cannot cancel processed leave' }, { status: 400 });
        }

        await prisma.leaveRequest.delete({
            where: { id: parseInt(id) }
        });

        return NextResponse.json({ message: 'Deleted successfully' });

    } catch (error) {
        console.error('Delete Leave Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
