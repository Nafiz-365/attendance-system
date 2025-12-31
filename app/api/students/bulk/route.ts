import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
    const session = await getSession(request);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { students } = body;

        if (!Array.isArray(students) || students.length === 0) {
            return NextResponse.json({ error: 'Invalid payload: students array is required' }, { status: 400 });
        }

        // 1. Fetch all departments for this user/admin to build a lookup map
        const departments = await prisma.department.findMany({
            where: { userId: Number(session.userId) },
            select: { id: true, code: true }
        });

        const deptMap = new Map();
        departments.forEach(d => {
            deptMap.set(d.code.toUpperCase(), d.id);
        });

        const validStudents = [];
        const errors = [];

        for (const student of students) {
            // Basic field validation
            if (!student.name || !student.studentId || !student.email) {
                errors.push(`Row ${student.studentId || 'unknown'}: Missing name, ID, or email`);
                continue;
            }

            // Resolve Department
            let deptId = student.departmentId;
            // If departmentCode provided, lookup ID
            if (student.departmentCode) {
                const code = student.departmentCode.toString().toUpperCase().trim();
                if (deptMap.has(code)) {
                    deptId = deptMap.get(code);
                } else {
                    const available = Array.from(deptMap.keys()).join(', ');
                    errors.push(`Row ${student.studentId}: Invalid Department Code '${student.departmentCode}'. Your available codes: [${available}]`);
                    continue;
                }
            } else if (!deptId) {
                // Try to see if departmentId is actually a code (legacy/Excel mixup)
                const codeTry = String(student.departmentId || '').toUpperCase().trim();
                if (deptMap.has(codeTry)) {
                    deptId = deptMap.get(codeTry);
                } else {
                    const available = Array.from(deptMap.keys()).join(', ');
                    // Fallback to integer check if numeric
                    if (!departments.find(d => d.id === Number(student.departmentId))) {
                        errors.push(`Row ${student.studentId}: Missing or Invalid Department ID/Code. Your available codes: [${available}]`);
                        continue;
                    }
                }
            }

            validStudents.push({
                name: student.name,
                studentId: student.studentId,
                email: student.email,
                batch: student.batch || '50',
                section: student.section || 'A',
                departmentId: Number(deptId),
                userId: Number(session.userId),
                semester: student.semester || '1st Semester',
                phone: student.phone || ''
            });
        }

        if (validStudents.length === 0) {
            return NextResponse.json({
                error: 'No valid students found to import.',
                details: errors
            }, { status: 400 });
        }

        // Check for existing duplicates (Student ID or Email) to provide better feedback
        const studentIds = validStudents.map(s => s.studentId);
        const emails = validStudents.map(s => s.email);

        console.log(`Checking duplicates for ${studentIds.length} IDs and ${emails.length} Emails`);

        const existingStudents = await prisma.student.findMany({
            where: {
                OR: [
                    { studentId: { in: studentIds } },
                    { email: { in: emails } }
                ]
            },
            select: { studentId: true, email: true }
        });

        console.log(`Found ${existingStudents.length} existing matches in DB`);

        const existingSet = new Set([
            ...existingStudents.map(s => s.studentId.toLowerCase()),
            ...existingStudents.map(s => s.email.toLowerCase())
        ]);

        const newStudents = validStudents.filter(s => {
            const isDuplicate = existingSet.has(s.studentId.toLowerCase()) || existingSet.has(s.email.toLowerCase());
            if (isDuplicate) {
                console.log(`Skipping Duplicate: ID=${s.studentId}, Email=${s.email}`);
            }
            return !isDuplicate;
        });

        const duplicateCount = validStudents.length - newStudents.length;

        let count = 0;
        if (newStudents.length > 0) {
            console.log(`Attempting to insert ${newStudents.length} new students...`);
            const result = await prisma.student.createMany({
                data: newStudents,
                skipDuplicates: true // Just in case of race condition
            });
            count = result.count;
            console.log(`Prisma inserted ${count} records.`);
        } else {
            console.log("No new students to insert after filtering.");
        }

        return NextResponse.json({
            message: 'Bulk import processed',
            count: count,
            duplicates: duplicateCount,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error: any) {
        console.error('Bulk Import Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
