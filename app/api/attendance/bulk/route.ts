
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
        const { date, records } = body;

        if (!Array.isArray(records) || records.length === 0) {
            return NextResponse.json({ error: 'No records provided' }, { status: 400 });
        }

        const recordDate = date ? new Date(date) : new Date();

        // Transaction to ensure atomicity
        // We will loop through records and upsert them (update if exists, create if not)
        // using a transaction is efficient for batch operations (though prisma $transaction is sequential promises)

        const operations = records.map((record: any) => {
            return prisma.attendance.create({
                data: {
                    status: record.status,
                    date: recordDate,
                    studentId: record.studentId
                    // Note: Schema doesn't have unique constraint on [studentId, date] yet, 
                    // should probably add it, but for now just create.
                    // If we want to replace existing for that day, we should delete first or check.
                    // For simplicity V1: Just create. 
                }
            });
        });

        // Optional: Delete existing records for these students on this date to prevent duplicates
        // This is a "replace" strategy
        const studentIds = records.map((r: any) => r.studentId);

        // Start of day and end of day for deletion range
        const start = new Date(recordDate); start.setHours(0, 0, 0, 0);
        const end = new Date(recordDate); end.setHours(23, 59, 59, 999);

        await prisma.$transaction([
            prisma.attendance.deleteMany({
                where: {
                    studentId: { in: studentIds },
                    date: {
                        gte: start,
                        lte: end
                    }
                }
            }),
            ...operations
        ]);

        return NextResponse.json({ message: 'Attendance saved successfully', count: records.length });

    } catch (error) {
        console.error('Bulk Attendance Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
