import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';


// GET: Fetch all students for the logged-in user
export async function GET(request: Request) {
    const session = await getSession(request);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { role, userId } = session as any;

    if (role === 'STUDENT') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const batchFilter = searchParams.get('batch');
    const sectionFilter = searchParams.get('section');
    const departmentIdFilter = searchParams.get('departmentId');

    try {
        const whereClause: any = {};

        if (role === 'TEACHER') {
            // Teacher sees students in their department
            const teacher = await prisma.teacher.findUnique({
                where: { userId: Number(userId) },
                select: { departmentId: true }
            });

            if (!teacher) {
                return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 });
            }
            whereClause.departmentId = teacher.departmentId;
        } else {
            // Admin sees all students
            // whereClause.userId = Number(userId); // Removing this restriction
        }

        if (batchFilter) {
            whereClause.batch = batchFilter;
        }

        if (sectionFilter) {
            whereClause.section = sectionFilter;
        }

        // Allow Admin to filter by department, but Teachers are already locked to theirs
        if (departmentIdFilter) {
            // If teacher tries to filter by another department, it will conflict with whereClause.departmentId check?
            // If teacher: whereClause.departmentId is SET. If they pass another ID, we should probably ignore or error.
            // But let's safely override IF Admin.
            if (role !== 'TEACHER') {
                whereClause.departmentId = Number(departmentIdFilter);
            } else {
                // Determine if they match? 
                // Currently strictly filtering by teacher's department is safer.
                if (Number(departmentIdFilter) !== whereClause.departmentId) {
                    return NextResponse.json([], { status: 200 }); // Return empty if searching outside dept
                }
            }
        }

        const students = await prisma.student.findMany({
            where: whereClause,
            include: {
                department: true
            },
            orderBy: {
                studentId: 'asc' // Sort by Student ID
            }
        });

        return NextResponse.json(students);
    } catch (error) {
        console.error('Failed to fetch students:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

import bcrypt from 'bcryptjs';

// ... (GET method remains same, skip to POST)

// POST: Create a new student
export async function POST(request: Request) {
    const session = await getSession(request);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();

        // Basic validation
        if (!body.name || !body.studentId || !body.departmentId || !body.email) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }


        // Check if department exists
        let departmentId = Number(body.departmentId);
        const departmentExists = await prisma.department.findUnique({
            where: { id: departmentId }
        });

        if (!departmentExists) {
            console.error(`Department ${body.departmentId} not found`);
            // Fallback: Use the first department found for this user/admin
            const firstDept = await prisma.department.findFirst({
                where: { userId: Number(session.userId) }
            });

            if (!firstDept) {
                return NextResponse.json({ error: 'No department found. Please create a department first.' }, { status: 400 });
            }
            departmentId = firstDept.id;
        }

        const hashedPassword = await bcrypt.hash(body.password || 'password123', 10);

        const newStudent = await prisma.$transaction(async (tx) => {
            // 1. Create User
            let user = await tx.user.findUnique({ where: { email: body.email } });

            if (!user) {
                user = await tx.user.create({
                    data: {
                        name: body.name,
                        email: body.email,
                        password: hashedPassword,
                        role: 'STUDENT'
                    }
                });
            } else {
                // If user exists, ensure they are STUDENT? Or just proceed?
                // If they are TEACHER, we can't make them STUDENT easily in single role system.
                // Assuming single role per user for now.
                if (user.role !== 'STUDENT') {
                    throw new Error(`User with email ${body.email} already exists as ${user.role}`);
                }
            }

            // 2. Create Student Linked to User
            return await tx.student.create({
                data: {
                    name: body.name,
                    email: body.email,
                    phone: body.phone || '',
                    studentId: body.studentId,
                    departmentId: departmentId,
                    batch: body.batch || '50',
                    section: body.section || 'A',
                    semester: body.semester || '1st Semester',
                    userId: user.id
                }
            });
        });

        return NextResponse.json(newStudent);

    } catch (error: any) {
        console.error('Failed to create student:', error);
        if (error.code === 'P2002') {
            const target = error.meta?.target;
            return NextResponse.json({ error: `Student with this ${target ? target : 'ID/Email'} already exists` }, { status: 409 });
        }
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
