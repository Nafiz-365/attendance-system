
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
        const { searchParams } = new URL(request.url);
        const threshold = parseInt(searchParams.get('threshold') || '75');
        const batch = searchParams.get('batch');

        const whereClause: any = {};
        if (batch) whereClause.batch = batch;

        const students = await prisma.student.findMany({
            where: whereClause,
            include: {
                attendance: true,
                department: true
            },
            orderBy: { studentId: 'asc' }
        });

        const defaulters = [];

        for (const student of students) {
            const total = student.attendance.length;
            if (total === 0) continue;

            const attended = student.attendance.filter(a => a.status === 'Present' || a.status === 'Late').length;
            const rate = (attended / total) * 100;

            if (rate < threshold) {
                defaulters.push({
                    'Student ID': student.studentId,
                    'Name': student.name,
                    'Batch': student.batch,
                    'Section': student.section,
                    'Department': student.department?.name || 'N/A',
                    'Total Classes': total,
                    'Attended': attended,
                    'Attendance %': `${rate.toFixed(1)}%`,
                    'Status': 'Defaulter'
                });
            }
        }

        // Generate Excel
        const worksheet = XLSX.utils.json_to_sheet(defaulters);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Defaulters");

        const buf = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

        return new NextResponse(buf, {
            status: 200,
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="defaulters_report_below_${threshold}.xlsx"`
            }
        });

    } catch (error) {
        console.error('Defaulters Report Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
