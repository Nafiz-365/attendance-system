
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { startOfMonth, subMonths } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const now = new Date();
        const firstDayOfMonth = startOfMonth(now);
        const firstDayOfLastMonth = startOfMonth(subMonths(now, 1));

        // 1. Total Present (This Month)
        const totalPresent = await prisma.attendance.count({
            where: {
                status: 'Present',
                date: {
                    gte: firstDayOfMonth,
                },
            },
        });

        // 2. Monthly Average Attendance %
        const totalAttendanceRecords = await prisma.attendance.count({
            where: {
                date: {
                    gte: firstDayOfMonth,
                },
            },
        });

        const monthlyAverage = totalAttendanceRecords > 0
            ? Math.round((totalPresent / totalAttendanceRecords) * 100)
            : 0;

        // 3. Best Batch-Section
        // Group by student -> Batch-Section

        const students = await prisma.student.findMany({
            include: {
                attendance: {
                    where: {
                        date: { gte: firstDayOfMonth }
                    }
                }
            }
        });

        const groupStats: Record<string, { present: number, total: number }> = {};

        students.forEach((student: any) => {
            const groupName = `${student.batch}-${student.section}`;
            if (!groupStats[groupName]) {
                groupStats[groupName] = { present: 0, total: 0 };
            }
            const presentCount = student.attendance.filter((a: any) => a.status === 'Present').length;
            const totalCount = student.attendance.length;

            groupStats[groupName].present += presentCount;
            groupStats[groupName].total += totalCount;
        });

        let bestClass = "N/A";
        let bestClassRate = 0;

        Object.entries(groupStats).forEach(([groupName, stats]) => {
            const rate = stats.total > 0 ? (stats.present / stats.total) * 100 : 0;
            if (rate > bestClassRate) {
                bestClassRate = rate;
                bestClass = groupName;
            }
        });

        // 4. Reports Generated (Mock or Log)
        // Since we don't track "generating reports", we'll return a static number or count of "attendance logs" as activity.
        const reportsGenerated = await prisma.attendance.count({
            where: {
                date: { gte: firstDayOfMonth }
            }
        }); // Using total attendance records as a proxy for activity volume

        // 5. Attendance Trend (Last 7 Days)
        const trend = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const startOfDay = new Date(date.setHours(0, 0, 0, 0));
            const endOfDay = new Date(date.setHours(23, 59, 59, 999));

            const dailyTotal = await prisma.attendance.count({
                where: { date: { gte: startOfDay, lte: endOfDay } }
            });

            const dailyPresent = await prisma.attendance.count({
                where: {
                    date: { gte: startOfDay, lte: endOfDay },
                    status: 'Present'
                }
            });

            trend.push({
                date: startOfDay.toLocaleDateString('en-US', { weekday: 'short' }),
                percentage: dailyTotal > 0 ? Math.round((dailyPresent / dailyTotal) * 100) : 0
            });
        }

        // 6. Defaulter Distribution
        // We need to fetch all students and their attendance aggregation
        // This might be heavy, but strictly necessary for the pie chart.
        // Optimization: We already fetched students for "Best Batch". Reuse it.

        let range0to50 = 0;
        let range50to75 = 0;
        let range75to100 = 0;

        students.forEach((student: any) => {
            const total = student.attendance.length;
            if (total === 0) return;
            const present = student.attendance.filter((a: any) => a.status === 'Present').length;
            const rate = (present / total) * 100;

            if (rate < 50) range0to50++;
            else if (rate < 75) range50to75++;
            else range75to100++;
        });

        const distribution = [
            { name: '0-50%', value: range0to50, fill: '#ef4444' }, // Red
            { name: '50-75%', value: range50to75, fill: '#eab308' }, // Yellow
            { name: '75-100%', value: range75to100, fill: '#22c55e' } // Green
        ];

        // 7. Top Defaulters (Lowest 5)
        const topDefaulters = students
            .filter((s: any) => s.attendance.length > 0)
            .map((s: any) => {
                const total = s.attendance.length;
                const present = s.attendance.filter((a: any) => a.status === 'Present').length;
                return {
                    name: s.name,
                    studentId: s.studentId,
                    batch: s.batch,
                    section: s.section,
                    rate: Math.round((present / total) * 100)
                };
            })
            .sort((a: any, b: any) => a.rate - b.rate)
            .slice(0, 5);

        return NextResponse.json({
            monthlyAverage,
            totalPresent,
            bestClass,
            bestClassRate: Math.round(bestClassRate),
            reportsGenerated,
            attendanceTrend: trend,
            defaulterDistribution: distribution,
            topDefaulters
        });

    } catch (error) {
        console.error('Stats API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
