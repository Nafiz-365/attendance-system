import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from 'bcryptjs';

export async function PUT(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const id = parseInt(params.id);
        const body = await req.json();
        const { name, email, employeeId, phone, departmentId, password } = body;

        const result = await prisma.$transaction(async (tx) => {
            // Update Teacher profile
            const teacher = await tx.teacher.update({
                where: { id },
                data: {
                    name,
                    email,
                    employeeId,
                    phone,
                    departmentId
                }
            });

            // Update linked User email/name/password if they exist
            if (teacher.userId) {
                const userData: any = { name, email };
                if (password && password.trim() !== '') {
                    userData.password = await bcrypt.hash(password, 10);
                }

                await tx.user.update({
                    where: { id: teacher.userId },
                    data: userData
                });
            }

            return teacher;
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Failed to update teacher" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        console.log(`DELETE Teacher API received request for ID: ${params.id}`);
        const id = parseInt(params.id);

        if (isNaN(id)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        // Get teacher to find userId
        const teacher = await prisma.teacher.findUnique({
            where: { id },
            select: { userId: true }
        });

        if (teacher && teacher.userId) {
            console.log(`Found linked User ID: ${teacher.userId}. Attempting cascade delete...`);
            try {
                // Delete the User directly (Prisma cascade will handle the Teacher profile)
                await prisma.user.delete({
                    where: { id: teacher.userId }
                });
                console.log('User deleted successfully (Teacher should cascade)');
            } catch (userErr) {
                console.error('Failed to delete linked User, attempting to delete Teacher directly:', userErr);
                // Fallback
                await prisma.teacher.delete({ where: { id } });
            }
        } else {
            console.log('No linked User found or Teacher missing specific user link. Deleting Teacher directly...');
            await prisma.teacher.delete({ where: { id } });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Delete Teacher Error Traced:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return NextResponse.json(
            {
                error: errorMessage || "Failed to delete teacher",
                details: JSON.stringify(error, Object.getOwnPropertyNames(error))
            },
            { status: 500 }
        );
    }
}
