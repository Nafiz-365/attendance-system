
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    const session = await getSession(request);
    if (!session || session.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { teachers } = body;

        if (!Array.isArray(teachers) || teachers.length === 0) {
            return NextResponse.json({ error: 'Invalid payload: teachers array is required' }, { status: 400 });
        }

        // 1. Fetch departments to build a lookup map
        const departments = await prisma.department.findMany({
            where: { userId: Number(session.userId) },
            select: { id: true, code: true }
        });

        const deptMap = new Map();
        departments.forEach(d => {
            deptMap.set(d.code.toUpperCase(), d.id);
        });

        const validTeachers = [];
        const errors = [];

        // 2. Build list of all IDs/Emails to check for duplicates efficiently
        const employeeIdsToCheck = new Set<string>();
        const emailsToCheck = new Set<string>();

        // Pre-validation Loop
        for (const t of teachers) {
            // Basic fields
            if (!t.name || !t.employeeId || !t.email) {
                errors.push(`Row ${t.employeeId || 'unknown'}: Missing Name, Employee ID, or Email`);
                continue;
            }

            // Department resolution
            let deptId = t.departmentId;
            if (t.departmentCode) {
                const code = t.departmentCode.toString().toUpperCase().trim();
                if (deptMap.has(code)) {
                    deptId = deptMap.get(code);
                } else {
                    const available = Array.from(deptMap.keys()).join(', ');
                    errors.push(`Row ${t.employeeId}: Invalid Dept Code '${t.departmentCode}'. Available: [${available}]`);
                    continue;
                }
            } else if (!deptId || !departments.find(d => d.id === Number(deptId))) {
                // Fallback try code match on ID field
                const codeTry = String(t.departmentId || '').toUpperCase().trim();
                if (deptMap.has(codeTry)) {
                    deptId = deptMap.get(codeTry);
                } else {
                    errors.push(`Row ${t.employeeId}: Invalid Dept ID/Code`);
                    continue;
                }
            }

            // Parse Date if present
            let joiningDate = null;
            if (t.joiningDate) {
                const d = new Date(t.joiningDate);
                if (!isNaN(d.getTime())) {
                    joiningDate = d;
                }
            }

            validTeachers.push({
                ...t,
                departmentId: Number(deptId),
                joiningDate,
                designation: t.designation || null,
                gender: t.gender || null,
                qualification: t.qualification || null,
                address: t.address || null
            });
            employeeIdsToCheck.add(t.employeeId.toLowerCase());
            emailsToCheck.add(t.email.toLowerCase());
        }

        if (validTeachers.length === 0) {
            return NextResponse.json({
                error: 'No valid teachers found to import.',
                details: errors
            }, { status: 400 });
        }

        // 3. Check Database Duplicates (User & Teacher tables)
        const existingUsers = await prisma.user.findMany({
            where: { email: { in: Array.from(emailsToCheck) } },
            select: { email: true }
        });

        const existingTeachers = await prisma.teacher.findMany({
            where: {
                OR: [
                    { email: { in: Array.from(emailsToCheck) } },
                    { employeeId: { in: Array.from(employeeIdsToCheck) } }
                ]
            },
            select: { email: true, employeeId: true }
        });

        const duplicateSet = new Set<string>();
        existingUsers.forEach(u => duplicateSet.add(u.email.toLowerCase()));
        existingTeachers.forEach(t => {
            duplicateSet.add(t.email.toLowerCase());
            duplicateSet.add(t.employeeId.toLowerCase());
        });

        const newTeachers = validTeachers.filter(t =>
            !duplicateSet.has(t.email.toLowerCase()) && !duplicateSet.has(t.employeeId.toLowerCase())
        );

        const duplicateCount = validTeachers.length - newTeachers.length;

        // 4. Create Users and Teachers in Transaction
        const defaultPasswordHash = await bcrypt.hash('password123', 10);
        let importedCount = 0;

        for (const t of newTeachers) {
            try {
                await prisma.$transaction(async (tx) => {
                    const passwordHash = t.password ? await bcrypt.hash(t.password, 10) : defaultPasswordHash;

                    const user = await tx.user.create({
                        data: {
                            name: t.name,
                            email: t.email,
                            password: passwordHash,
                            role: 'TEACHER'
                        }
                    });

                    await tx.teacher.create({
                        data: {
                            name: t.name,
                            email: t.email,
                            employeeId: t.employeeId,
                            phone: t.phone || null,
                            departmentId: t.departmentId,
                            userId: user.id,

                            // New Fields
                            designation: t.designation,
                            gender: t.gender,
                            qualification: t.qualification,
                            joiningDate: t.joiningDate,
                            address: t.address
                        } as any
                    });
                });
                importedCount++;
            } catch (err: any) {
                console.error(`Failed to import teacher ${t.email}:`, err);
                errors.push(`Row ${t.employeeId}: Database Error`);
            }
        }

        return NextResponse.json({
            message: 'Bulk import processed',
            count: importedCount,
            duplicates: duplicateCount,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error: any) {
        console.error('Teacher Bulk Import Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
