
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import * as XLSX from 'xlsx';

export async function GET(request: Request) {
    const session = await getSession(request);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Fetch all students with aggregate attendance
        const students = await prisma.student.findMany({
            include: {
                attendance: true,
                department: true
            },
            orderBy: { studentId: 'asc' }
        });

        const data = [];

        for (const student of students) {
            const total = student.attendance.length;
            const attended = student.attendance.filter((a: any) => a.status === 'Present' || a.status === 'Late').length;
            const rate = total > 0 ? ((attended / total) * 100).toFixed(1) + '%' : 'N/A';

            data.push({
                'Student ID': student.studentId,
                'Name': student.name,
                'Department': student.department?.code || '',
                'Class': `${student.batch}-${student.section}`,
                'Total Sessions': total,
                'Attendance %': rate
            });
        }

        // Generate Excel
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Summary");

        const buf = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

        return new NextResponse(buf, {
            status: 200,
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="class_summary_report.xlsx"`
            }
        });

    } catch (error: any) {
        console.error('Report Generation Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
