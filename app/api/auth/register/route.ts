import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';


export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password, name, role: rawRole, studentId, phone, department } = body;

        if (!email || !password || !name || !rawRole) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const role = rawRole.toUpperCase();

        // Validate role
        if (!['STUDENT', 'TEACHER', 'ADMIN'].includes(role)) {
            return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            // Special: Allow Students to "Activate" their pre-created account
            if (role === 'STUDENT' && studentId) {
                const studentRecord = await prisma.student.findFirst({
                    where: { email, studentId }
                });

                // If Student record exists AND is linked to this User (created by Admin)
                if (studentRecord && studentRecord.userId === existingUser.id) {
                    // Update their password to what they chose
                    const newHash = await hashPassword(password);
                    await prisma.user.update({
                        where: { id: existingUser.id },
                        data: {
                            password: newHash,
                            name: name // Update name if they fixed a typo
                        }
                    });

                    return NextResponse.json({
                        message: 'Account verified and activated successfully',
                        user: { id: existingUser.id, email: existingUser.email, name: existingUser.name, role: existingUser.role },
                    });
                }
            }

            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user with role
        const user = await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
                role: role as 'STUDENT' | 'TEACHER' | 'ADMIN',
            },
        });

        // If role is STUDENT, handle profile claiming (VERIFICATION REQUIRED)
        if (role === 'STUDENT') {
            if (!studentId || !department) {
                await prisma.user.delete({ where: { id: user.id } });
                return NextResponse.json({ error: 'Student ID and department are required' }, { status: 400 });
            }

            // STRICT VERIFICATION: Student record MUST exist (pre-created by Admin)
            const existingStudent = await prisma.student.findFirst({
                where: {
                    studentId: studentId,
                    email: email
                }
            });

            if (!existingStudent) {
                // Student record not found - reject registration
                await prisma.user.delete({ where: { id: user.id } });
                return NextResponse.json({
                    error: 'Student verification failed. Your Student ID and Email must be registered by an administrator before you can create an account. Please contact your institution.'
                }, { status: 403 });
            }

            // Check if this student profile is already claimed by another user
            if (existingStudent.userId) {
                await prisma.user.delete({ where: { id: user.id } });
                return NextResponse.json({
                    error: 'This student account has already been registered. If you forgot your password, please use the password reset option.'
                }, { status: 409 });
            }

            // All checks passed - Link the new User to the existing Student profile
            await prisma.student.update({
                where: { id: existingStudent.id },
                data: {
                    userId: user.id,
                    name: user.name // Update name from registration
                }
            });
        }

        // If role is TEACHER, create teacher record
        if (role === 'TEACHER') {
            if (!department) {
                await prisma.user.delete({ where: { id: user.id } });
                return NextResponse.json({ error: 'Department is required for teachers' }, { status: 400 });
            }

            // Find or create department
            let dept = await prisma.department.findFirst({
                where: { code: department.toUpperCase() }
            });

            if (!dept) {
                dept = await prisma.department.create({
                    data: {
                        name: getDepartmentName(department),
                        code: department.toUpperCase(),
                        hod: 'TBA',
                        userId: user.id,
                    }
                });
            }

            // Generate employee ID
            const employeeId = `EMP${Date.now().toString().slice(-6)}`;

            // Create teacher record
            await prisma.teacher.create({
                data: {
                    name: user.name,
                    email: user.email,
                    employeeId: employeeId,
                    phone: phone || '',
                    departmentId: dept.id,
                    userId: user.id,
                }
            });
        }

        // Return success (excluding password)
        return NextResponse.json({
            message: 'User created successfully',
            user: { id: user.id, email: user.email, name: user.name, role: user.role },
        });

    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// Helper function to get department name from code
function getDepartmentName(code: string): string {
    const deptMap: { [key: string]: string } = {
        'cse': 'Computer Science & Engineering',
        'eee': 'Electrical & Electronics Engineering',
        'bba': 'Business Administration',
        'ce': 'Civil Engineering',
        'me': 'Mechanical Engineering',
    };
    return deptMap[code.toLowerCase()] || code.toUpperCase();
}
