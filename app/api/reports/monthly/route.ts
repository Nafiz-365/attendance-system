
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import * as XLSX from 'xlsx';

export async function GET(request: Request) {
    const session = await getSession(request);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date') || new Date().toISOString();
    const batchParam = searchParams.get('batch');
    const sectionParam = searchParams.get('section');
    const departmentId = searchParams.get('departmentId');

    try {
        const date = new Date(dateParam);
        const startDate = startOfMonth(date);
        const endDate = endOfMonth(date);

        const whereClause: any = {};
        if (batchParam) whereClause.batch = batchParam;
        if (sectionParam) whereClause.section = sectionParam;
        if (departmentId) whereClause.departmentId = parseInt(departmentId);

        // Fetch students and their attendance for the month
        const students = await prisma.student.findMany({
            where: whereClause,
            include: {
                attendance: {
                    where: {
                        date: {
                            gte: startDate,
                            lte: endDate
                        }
                    }
                },
                department: true
            },
            orderBy: { studentId: 'asc' }
        });

        const data = [];

        for (const student of students) {
            const totalDays = student.attendance.length;
            const present = student.attendance.filter((a: any) => a.status === 'Present').length;
            const absent = student.attendance.filter((a: any) => a.status === 'Absent').length;
            const late = student.attendance.filter((a: any) => a.status === 'Late').length;
            const rate = totalDays > 0 ? ((present + late) / totalDays * 100).toFixed(1) + '%' : '0%';

            data.push({
                'Student ID': student.studentId,
                'Name': student.name,
                'Department': student.department?.code || '',
                'Batch': student.batch,
                'Section': student.section,
                'Total Present': present,
                'Total Absent': absent,
                'Total Late': late,
                'Attendance Rate': rate
            });
        }

        // Generate Excel
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Monthly Report");

        const buf = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

        return new NextResponse(buf, {
            status: 200,
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="monthly_report_${format(date, 'yyyy_MM')}.xlsx"`
            }
        });

    } catch (error: any) {
        console.error('Report Generation Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
