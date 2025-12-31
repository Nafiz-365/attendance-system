import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        const whereClause: any = {};
        if (email) {
            whereClause.email = email;
            // Or via user relation if email is stored there? 
            // Schema has email on Teacher AND User. Let's assume Teacher.email matches User.email 
            // per the POST logic.
        }

        const teachers = await prisma.teacher.findMany({
            where: whereClause,
            include: {
                department: { select: { name: true, code: true } },
                user: { select: { email: true } }
            },
            orderBy: { name: 'asc' }
        });
        return NextResponse.json(teachers);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch teachers" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, employeeId, departmentId, phone, password } = body;

        // 1. Check if email exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "User with this email already exists" },
                { status: 400 }
            );
        }

        // 2. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Create User and Teacher in transaction
        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    role: "TEACHER"
                }
            });

            const teacher = await tx.teacher.create({
                data: {
                    name,
                    email,
                    employeeId,
                    phone,
                    userId: user.id,
                    departmentId
                }
            });

            return teacher;
        });

        return NextResponse.json(result);
    } catch (error: any) {
        console.error(error);
        return NextResponse.json(
            { error: error.message || "Failed to create teacher" },
            { status: 500 }
        );
    }
}
