import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

        // Fetch attendance records
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

        // Create PDF
        const doc = new jsPDF('landscape');

        // Add title
        doc.setFontSize(18);
        doc.text('Attendance Report', 14, 15);

        // Add metadata
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);
        if (startDate && endDate) {
            doc.text(`Period: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`, 14, 27);
        }
        doc.text(`Total Records: ${filteredRecords.length}`, 14, 32);

        // Prepare table data
        const tableData = filteredRecords.map(record => [
            new Date(record.date).toLocaleDateString(),
            record.student.studentId,
            record.student.name,
            record.student.department.name,
            `${record.student.batch}-${record.student.section}`,
            record.allocation?.course?.code || 'N/A',
            record.allocation?.teacher?.name || 'N/A',
            record.status
        ]);

        // Add table
        autoTable(doc, {
            startY: 38,
            head: [['Date', 'Student ID', 'Name', 'Department', 'Batch-Sec', 'Course', 'Teacher', 'Status']],
            body: tableData,
            theme: 'grid',
            styles: { fontSize: 8, cellPadding: 2 },
            headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            columnStyles: {
                0: { cellWidth: 22 },
                1: { cellWidth: 25 },
                2: { cellWidth: 40 },
                3: { cellWidth: 35 },
                4: { cellWidth: 20 },
                5: { cellWidth: 25 },
                6: { cellWidth: 35 },
                7: { cellWidth: 20 }
            }
        });

        // Generate PDF buffer
        const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

        // Return as downloadable file
        return new NextResponse(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename=attendance-report-${Date.now()}.pdf`
            }
        });

    } catch (error) {
        console.error('PDF export error:', error);
        return NextResponse.json({ error: 'Failed to generate PDF report' }, { status: 500 });
    }
}
