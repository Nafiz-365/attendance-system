
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const recentAttendance = await prisma.attendance.findMany({
            take: 5,
            orderBy: {
                date: 'desc',
            },
            include: {
                student: true,
            },
        });

        const formattedActivity = recentAttendance.map((record: any) => ({
            id: record.id,
            action: `Marked ${record.status}`,
            description: `${record.student.name} (${record.student.batch}-${record.student.section})`,
            time: record.date.toISOString(), // Client will format this
            status: 'Complete'
        }));

        return NextResponse.json(formattedActivity);
    } catch (error) {
        console.error('Recent Activity API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
