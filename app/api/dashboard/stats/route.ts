import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { startOfDay, endOfDay, subDays, format } from 'date-fns';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') || 'today';

        const now = new Date();
        let start = startOfDay(now);
        const end = endOfDay(now);

        if (period === 'week') {
            start = subDays(start, 7);
        } else if (period === 'month') {
            start = subDays(start, 30);
        }

        // 2. Counts
        const [totalStudents, totalTeachers, totalCourses, presentToday, absentToday, lateToday] = await Promise.all([
            prisma.student.count(),
            prisma.teacher.count(),
            prisma.course.count(),
            prisma.attendance.count({
                where: {
                    date: { gte: start, lte: end },
                    status: 'Present'
                }
            }),
            prisma.attendance.count({
                where: {
                    date: { gte: start, lte: end },
                    status: 'Absent'
                }
            }),
            prisma.attendance.count({
                where: {
                    date: { gte: start, lte: end },
                    status: 'Late'
                }
            })
        ]);

        // 3. Recent Activity (Top 5)
        const recentActivity = await prisma.attendance.findMany({
            take: 5,
            orderBy: { date: 'desc' },
            include: { student: true }
        });

        const formattedActivity = recentActivity.map((record: any) => {
            let statusColor = "text-gray-600";
            if (record.status === 'Present') statusColor = "text-green-600";
            else if (record.status === 'Absent') statusColor = "text-red-600";
            else if (record.status === 'Late') statusColor = "text-yellow-600";

            return {
                id: record.id,
                student: record.student.name,
                action: `marked ${record.status.toLowerCase()}`,
                time: record.date.toISOString(), // Client will format
                status: record.status,
                statusColor
            };
        });

        // 4. Performance (Global Attendance Rate)
        const globalRate = totalStudents > 0
            ? Math.round(((presentToday + lateToday) / totalStudents) * 100)
            : 0;

        // 5. Weekly Stats (Last 7 Days)
        const sevenDaysAgo = subDays(start, 6);
        const weeklyAttendance = await prisma.attendance.findMany({
            where: {
                date: { gte: sevenDaysAgo }
            }
        });

        const weeklyStatsMap = new Map();
        // Initialize last 7 days with 0
        for (let i = 0; i < 7; i++) {
            const day = subDays(end, i);
            const dateStr = format(day, 'EEE'); // Mon, Tue, etc.
            weeklyStatsMap.set(dateStr, { date: dateStr, present: 0, absent: 0 });
        }

        weeklyAttendance.forEach((record: any) => {
            const dateStr = format(record.date, 'EEE');
            if (weeklyStatsMap.has(dateStr)) {
                const dayStat = weeklyStatsMap.get(dateStr);
                if (record.status === 'Present' || record.status === 'Late') dayStat.present++;
                else if (record.status === 'Absent') dayStat.absent++;
            }
        });

        // Convert map to array and reverse to show oldest to newest
        const weeklyStats = Array.from(weeklyStatsMap.values()).reverse();

        // 6. Batch-Section Summary (replacing Class Summary)
        // Fetch all students to know their batch and section, then group attendance
        const allStudents = await prisma.student.findMany({
            select: { id: true, batch: true, section: true }
        });

        const studentGroupMap = new Map();
        allStudents.forEach((s: any) => {
            // Batch usually already contains "Batch", so we just use it, or clean it if needed.
            // Assuming DB stores "Batch 50", we just use s.batch.
            const groupKey = `${s.batch} - Section ${s.section}`;
            studentGroupMap.set(s.id, groupKey);
        });

        const groupAttendanceMap = new Map<string, { present: number, total: number }>();

        // Initialize batch-section groups
        const uniqueGroups = Array.from(new Set(allStudents.map((s: any) => `${s.batch} - Section ${s.section}`))).sort();
        uniqueGroups.forEach((group: any) => {
            groupAttendanceMap.set(group, { present: 0, total: 0 });
        });

        // Use today's attendance for group summary
        const todaysAttendance = await prisma.attendance.findMany({
            where: { date: { gte: start, lte: end } }
        });

        todaysAttendance.forEach((record: any) => {
            const studentGroup = studentGroupMap.get(record.studentId);
            if (studentGroup && groupAttendanceMap.has(studentGroup)) {
                const stats = groupAttendanceMap.get(studentGroup)!;
                stats.total++;
                if (record.status === 'Present' || record.status === 'Late') stats.present++;
            }
        });

        const classStats = Array.from(groupAttendanceMap.entries()).map(([groupName, stats]) => ({
            name: groupName,
            rate: stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0
        }));

        return NextResponse.json({
            totalStudents,
            totalTeachers,
            totalCourses,
            presentToday,
            absentToday,
            lateToday,
            globalRate,
            recentActivity: formattedActivity,
            weeklyStats,
            classStats
        });

    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
