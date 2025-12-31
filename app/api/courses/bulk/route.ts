
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
    const session = await getSession(request);
    if (!session || session.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { courses } = body;

        if (!Array.isArray(courses) || courses.length === 0) {
            return NextResponse.json({ error: 'Invalid payload: courses array is required' }, { status: 400 });
        }

        const departments = await prisma.department.findMany({
            where: { userId: Number(session.userId) },
            select: { id: true, code: true }
        });

        const deptMap = new Map();
        departments.forEach(d => {
            deptMap.set(d.code.toUpperCase(), d.id);
        });

        const validCourses = [];
        const errors = [];
        const codesToCheck = new Set<string>();

        // Validation Loop
        for (const c of courses) {
            if (!c.name || !c.code || !c.credits) {
                errors.push(`Row ${c.code || 'unknown'}: Missing Name, Code, or Credits`);
                continue;
            }

            // Department resolution
            let deptId = c.departmentId;
            if (c.departmentCode) {
                const code = c.departmentCode.toString().toUpperCase().trim();
                if (deptMap.has(code)) {
                    deptId = deptMap.get(code);
                } else {
                    const available = Array.from(deptMap.keys()).join(', ');
                    errors.push(`Row ${c.code}: Invalid Dept Code '${c.departmentCode}'. Available: [${available}]`);
                    continue;
                }
            } else if (!deptId || !departments.find(d => d.id === Number(deptId))) {
                // Fallback 
                const codeTry = String(c.departmentId || '').toUpperCase().trim();
                if (deptMap.has(codeTry)) {
                    deptId = deptMap.get(codeTry);
                } else {
                    errors.push(`Row ${c.code}: Invalid Dept ID/Code`);
                    continue;
                }
            }

            validCourses.push({ ...c, departmentId: Number(deptId) });
            codesToCheck.add(c.code.toLowerCase());
        }

        if (validCourses.length === 0) {
            return NextResponse.json({
                error: 'No valid courses found to import.',
                details: errors
            }, { status: 400 });
        }

        // Check Duplicates: Courses must be unique by Code within a Department? 
        // Schema doesn't enforce global unique Course Code, but likely unique per Dept?
        // Let's check matches on Code globally first for simpler feedback, or per user visible courses.
        // Actually, schema `model Course` has `code String`. No unique constrain visible in earlier `view_file`.
        // But logical uniqueness is usually desired. Let's assume global Code uniqueness for simplicity or just check if it exists for this user's depts?
        // The most robust check is `findMany` with `code` in the list to skip duplicates.

        const existingCourses = await prisma.course.findMany({
            where: {
                AND: [
                    { code: { in: Array.from(codesToCheck) } },
                    { departmentId: { in: departments.map(d => d.id) } } // Only check our depts
                ]
            },
            select: { code: true }
        });

        const existingSet = new Set(existingCourses.map(c => c.code.toLowerCase()));

        const newCourses = validCourses.filter(c => !existingSet.has(c.code.toLowerCase()));

        const duplicateCount = validCourses.length - newCourses.length;

        let importedCount = 0;
        if (newCourses.length > 0) {
            const result = await prisma.course.createMany({
                data: newCourses.map(c => ({
                    name: c.name,
                    code: c.code,
                    credits: Number(c.credits),
                    instructor: c.instructor || 'TBD',
                    departmentId: c.departmentId,
                    userId: Number(session.userId)
                })),
                skipDuplicates: true
            });
            importedCount = result.count;
        }

        return NextResponse.json({
            message: 'Bulk import processed',
            count: importedCount,
            duplicates: duplicateCount,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error: any) {
        console.error('Course Bulk Import Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
