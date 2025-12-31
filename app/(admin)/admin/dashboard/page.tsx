'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { AttendanceChart } from '@/components/charts/attendance-chart';
import {
    Users,
    UserCheck,
    UserX,
    Clock,
    TrendingUp,
    Calendar,
    AlertCircle,
    Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';

interface DashboardStats {
    totalStudents: number;
    totalTeachers: number;
    totalCourses: number;
    presentToday: number;
    absentToday: number;
    lateToday: number;
    globalRate: number;
    recentActivity: Array<{
        id: number;
        student: string;
        action: string;
        time: string;
        status: string;
        statusColor: string;
    }>;
    weeklyStats: Array<{
        date: string;
        present: number;
        absent: number;
    }>;
    classStats: Array<{
        name: string;
        rate: number;
    }>;
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [selectedPeriod, setSelectedPeriod] = useState('today');

    useEffect(() => {
        async function fetchStats() {
            setLoading(true);
            try {
                const res = await fetch(
                    `/api/dashboard/stats?period=${selectedPeriod}`
                );
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (error) {
                console.error('Failed to fetch dashboard stats', error);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, [selectedPeriod]);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    const kpiData = [
        {
            title: 'Total Students',
            value: stats?.totalStudents.toString() || '0',
            icon: Users,
            description: 'Registered students',
            color: 'text-blue-600',
            change: 'Total',
            href: '/admin/students',
        },
        {
            title: 'Total Teachers',
            value: stats?.totalTeachers.toString() || '0',
            icon: Users,
            description: 'Faculty members',
            color: 'text-purple-600',
            change: 'Active',
            href: '/admin/teachers',
        },
        {
            title: 'Total Courses',
            value: stats?.totalCourses.toString() || '0',
            icon: Calendar,
            description: 'Active courses',
            color: 'text-indigo-600',
            change: 'Active',
            href: '/admin/courses',
        },
        {
            title: 'Present',
            value: stats?.presentToday.toString() || '0',
            icon: UserCheck,
            description: 'Attendance records',
            color: 'text-green-600',
            change:
                selectedPeriod === 'today'
                    ? 'Today'
                    : selectedPeriod === 'week'
                    ? 'This Week'
                    : 'This Month',
        },
        {
            title: 'Absent',
            value: stats?.absentToday.toString() || '0',
            icon: UserX,
            description: 'Attendance records',
            color: 'text-red-600',
            change:
                selectedPeriod === 'today'
                    ? 'Today'
                    : selectedPeriod === 'week'
                    ? 'This Week'
                    : 'This Month',
        },
        {
            title: 'Late Arrivals',
            value: stats?.lateToday.toString() || '0',
            icon: Clock,
            description: 'Attendance records',
            color: 'text-yellow-600',
            change:
                selectedPeriod === 'today'
                    ? 'Today'
                    : selectedPeriod === 'week'
                    ? 'This Week'
                    : 'This Month',
        },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">
                        Dashboard
                    </h2>
                    <p className="text-muted-foreground">
                        Overview of today&apos;s attendance metrics.
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-sm text-muted-foreground">
                        {formatDate(currentTime)}
                    </div>
                    <div className="text-lg font-medium">
                        {formatTime(currentTime)}
                    </div>
                </div>
            </div>

            <div className="flex gap-2">
                {['today', 'week', 'month'].map((period) => (
                    <button
                        key={period}
                        onClick={() => setSelectedPeriod(period)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            selectedPeriod === period
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                    >
                        {period.charAt(0).toUpperCase() + period.slice(1)}
                    </button>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {kpiData.map((item, index) => {
                    const Icon = item.icon;
                    const CardContentWrapper = (
                        <Card className="hover:shadow-lg transition-all duration-300 transform hover:scale-105 border-0 glass-card h-full cursor-pointer">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {item.title}
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                    <Icon className={`h-4 w-4 ${item.color}`} />
                                    <span className="text-xs font-medium text-green-600">
                                        {item.change}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {item.value}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {item.description}
                                </p>
                            </CardContent>
                        </Card>
                    );

                    if (item.href) {
                        return (
                            <Link key={index} href={item.href}>
                                {CardContentWrapper}
                            </Link>
                        );
                    }

                    return <div key={index}>{CardContentWrapper}</div>;
                })}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 border-0 glass-card">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Attendance Overview
                                </CardTitle>
                                <CardDescription>
                                    Weekly attendance trends for the current
                                    month.
                                </CardDescription>
                            </div>
                            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                                View Details
                            </button>
                        </div>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <AttendanceChart data={stats?.weeklyStats || []} />
                    </CardContent>
                </Card>

                <Card className="col-span-3 border-0 glass-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Recent Activity
                        </CardTitle>
                        <CardDescription>
                            Latest attendance logs
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 max-h-80 overflow-y-auto">
                            {stats?.recentActivity &&
                            stats.recentActivity.length > 0 ? (
                                stats.recentActivity.map((activity) => (
                                    <div
                                        key={activity.id}
                                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium leading-none">
                                                    {activity.student}{' '}
                                                    {activity.action}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {new Date(
                                                        activity.time
                                                    ).toLocaleTimeString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div
                                            className={`text-sm font-medium ${activity.statusColor}`}
                                        >
                                            {activity.status}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No activity today
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-0 glass-card bg-blue-50/50 dark:bg-blue-900/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-700">
                            <AlertCircle className="h-5 w-5" />
                            Quick Actions
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Link
                            href="/admin/attendance"
                            className="w-full text-left p-3 rounded-lg bg-background/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors block border"
                        >
                            <p className="font-medium">Mark Attendance</p>
                            <p className="text-sm text-muted-foreground">
                                Record today&apos;s attendance
                            </p>
                        </Link>
                        <Link
                            href="/admin/reports"
                            className="w-full text-left p-3 rounded-lg bg-background/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors block border"
                        >
                            <p className="font-medium">Generate Report</p>
                            <p className="text-sm text-muted-foreground">
                                Create attendance report
                            </p>
                        </Link>
                        <Link
                            href="/admin/students"
                            className="w-full text-left p-3 rounded-lg bg-background/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors block border"
                        >
                            <p className="font-medium">Add Student</p>
                            <p className="text-sm text-muted-foreground">
                                Register new student
                            </p>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="border-0 glass-card bg-green-50/50 dark:bg-green-900/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-700">
                            <TrendingUp className="h-5 w-5" />
                            Performance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between text-sm">
                                    <span>Attendance Rate</span>
                                    <span className="font-medium">
                                        {stats?.globalRate || 0}%
                                    </span>
                                </div>
                                <div className="h-2 bg-green-200 rounded-full mt-1">
                                    <div
                                        className="h-2 bg-green-500 rounded-full"
                                        style={{
                                            width: `${stats?.globalRate || 0}%`,
                                        }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 glass-card bg-purple-50/50 dark:bg-purple-900/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-purple-700">
                            <Users className="h-5 w-5" />
                            Class Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 text-sm">
                            {stats?.classStats &&
                            stats.classStats.length > 0 ? (
                                stats.classStats.map((cls, idx) => (
                                    <div
                                        key={idx}
                                        className="flex justify-between"
                                    >
                                        <span>Class {cls.name}</span>
                                        <span
                                            className={`font-medium ${
                                                cls.rate >= 80
                                                    ? 'text-green-600'
                                                    : cls.rate >= 50
                                                    ? 'text-yellow-600'
                                                    : 'text-red-600'
                                            }`}
                                        >
                                            {cls.rate}%
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-muted-foreground">
                                    No classes available
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
