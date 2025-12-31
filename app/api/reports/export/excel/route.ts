import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { startDate, endDate, departmentId, batch, section } = body;

        // Build query filters
        const where: any = {};

        if (startDate && endDate) {
            where.date = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            };
        }

        // Fetch attendance records with student and course info
        const attendanceRecords = await prisma.attendance.findMany({
            where,
            include: {
                student: {
                    include: {
                        department: true
                    }
                },
                allocation: {
                    include: {
                        course: true,
                        teacher: true
                    }
                }
            },
            orderBy: {
                date: 'desc'
            }
        });

        // Filter by department, batch, section if provided
        let filteredRecords = attendanceRecords;

        if (departmentId) {
            filteredRecords = filteredRecords.filter(r => r.student.departmentId === parseInt(departmentId));
        }

        if (batch) {
            filteredRecords = filteredRecords.filter(r => r.student.batch === batch);
        }

        if (section) {
            filteredRecords = filteredRecords.filter(r => r.student.section === section);
        }

        // Prepare data for Excel
        const excelData = filteredRecords.map(record => ({
            'Date': new Date(record.date).toLocaleDateString(),
            'Student ID': record.student.studentId,
            'Student Name': record.student.name,
            'Department': record.student.department.name,
            'Batch': record.student.batch,
            'Section': record.student.section,
            'Course': record.allocation?.course?.name || 'N/A',
            'Course Code': record.allocation?.course?.code || 'N/A',
            'Teacher': record.allocation?.teacher?.name || 'N/A',
            'Status': record.status,
            'Marked At': new Date(record.date).toLocaleString()
        }));

        // Create workbook and worksheet
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(excelData);

        // Set column widths
        ws['!cols'] = [
            { wch: 12 }, // Date
            { wch: 12 }, // Student ID
            { wch: 20 }, // Student Name
            { wch: 20 }, // Department
            { wch: 10 }, // Batch
            { wch: 10 }, // Section
            { wch: 25 }, // Course
            { wch: 12 }, // Course Code
            { wch: 20 }, // Teacher
            { wch: 10 }, // Status
            { wch: 18 }, // Marked At
        ];

        XLSX.utils.book_append_sheet(wb, ws, 'Attendance Report');

        // Generate buffer
        const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

        // Return as downloadable file
        return new NextResponse(excelBuffer, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename=attendance-report-${Date.now()}.xlsx`
            }
        });

    } catch (error) {
        console.error('Excel export error:', error);
        return NextResponse.json({ error: 'Failed to generate Excel report' }, { status: 500 });
    }
}
