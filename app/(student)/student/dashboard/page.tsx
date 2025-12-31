"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Calendar, UserCheck, UserX, Clock, RefreshCw, Bell } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function StudentDashboard() {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<string>("");
    const [notices, setNotices] = useState<any[]>([]);
    const { addToast } = useToast();

    const fetchStats = useCallback(async (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true);
            setError("");
        }
        try {
            const res = await fetch('/api/student/stats');
            const data = await res.json();

            if (res.ok) {
                setData(data);
                if (isRefresh) addToast("Dashboard updated", "success");
            } else {
                setError(data.error || "Failed to load");
                // addToast("Failed to load dashboard data", "error"); // Reduce noise
            }
        } catch (error) {
            console.error(error);
            setError("Network error");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [addToast]);

    useEffect(() => {
        setTimeout(() => fetchStats(), 800);

        // Fetch notices
        const fetchNotices = async () => {
            try {
                const res = await fetch('/api/notices');
                if (res.ok) {
                    const allNotices = await res.json();
                    // Filter for students only
                    const studentNotices = allNotices.filter((n: any) =>
                        n.audience === 'ALL' || n.audience === 'STUDENTS'
                    );
                    setNotices(studentNotices.slice(0, 3)); // Show latest 3
                }
            } catch (error) {
                console.error('Failed to fetch notices', error);
            }
        };
        fetchNotices();
    }, [fetchStats]);

    if (loading) return <DashboardSkeleton />;

    if (error) return (
        <div className="flex flex-col items-center justify-center p-8 text-center h-[50vh] space-y-4">
            <div className="text-destructive font-bold text-lg">Error Loading Dashboard</div>
            <div className="text-muted-foreground">{error}</div>
            <p className="text-sm text-muted">Ensure you are logged in with a Student account.</p>
            <Button onClick={() => fetchStats(true)} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
            </Button>
        </div>
    );

    if (!data) return null;

    return (
        <div className="space-y-6 animate-fade-in p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Welcome, {data.studentName}</h2>
                    <p className="text-muted-foreground">Batch {data.batch} | Section {data.section} | Student ID: {data.studentId}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => fetchStats(true)}
                        disabled={refreshing}
                        title="Refresh Data"
                    >
                        <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                    </Button>
                    <Badge variant={data.stats.attendanceRate >= 75 ? "default" : "destructive"} className="text-lg px-3 py-1">
                        {data.stats.attendanceRate}% Attendance
                    </Badge>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="hover-lift glass">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.stats.totalClasses}</div>
                        <p className="text-xs text-muted-foreground">Days of operation</p>
                    </CardContent>
                </Card>
                <Card className="hover-lift glass">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Present</CardTitle>
                        <UserCheck className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.stats.presentCount}</div>
                        <p className="text-xs text-muted-foreground">Days attended</p>
                    </CardContent>
                </Card>
                <Card className="hover-lift glass">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Absent</CardTitle>
                        <UserX className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.stats.absentCount}</div>
                        <p className="text-xs text-muted-foreground">Days missed</p>
                    </CardContent>
                </Card>
                <Card className="hover-lift glass">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Late</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.stats.lateCount}</div>
                        <p className="text-xs text-muted-foreground">Days late</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="col-span-1 hover-lift glass">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Link href="/student/leaves" className="w-full p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-blue-600" />
                            <div>
                                <p className="font-medium">Apply for Leave</p>
                                <p className="text-sm text-muted-foreground">Request time off</p>
                            </div>
                        </Link>
                        <Link href="/student/attendance" className="w-full p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors flex items-center gap-3">
                            <UserCheck className="h-5 w-5 text-green-600" />
                            <div>
                                <p className="font-medium">Check Attendance</p>
                                <p className="text-sm text-muted-foreground">View your records</p>
                            </div>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="col-span-4 hover-lift glass">
                    <CardHeader>
                        <CardTitle>Recent Attendance History</CardTitle>
                        <CardDescription>Your last 5 attendance records.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {data.recentActivity.map((record: any) => (
                                <div key={record.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                    <div>
                                        <p className="font-medium text-sm">
                                            {record.allocation?.course?.code || "Class Activity"} - {new Date(record.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Marked by {record.allocation?.teacher?.name || "Teacher"} at {new Date(record.date).toLocaleTimeString()}
                                        </p>
                                    </div>
                                    <Badge variant={
                                        record.status === 'Present' ? 'default' :
                                            record.status === 'Absent' ? 'destructive' : 'secondary'
                                    }>
                                        {record.status}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-1 hover-lift glass">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5 text-blue-500" />
                            Announcements
                        </CardTitle>
                        <CardDescription>Recent notices from administration</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {notices.length > 0 ? (
                                notices.map((notice) => (
                                    <div key={notice.id} className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                                        <div className="flex items-start justify-between gap-2">
                                            <h4 className="font-semibold text-sm">{notice.title}</h4>
                                            <Badge variant="secondary" className="text-[10px] shrink-0">
                                                {notice.audience}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                            {notice.content}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground/60 mt-1">
                                            {new Date(notice.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No new announcements
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function DashboardSkeleton() {
    return (
        <div className="space-y-6 animate-pulse p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <Skeleton className="h-8 w-32" />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="glass">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-4 rounded-full" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-16 mb-2" />
                            <Skeleton className="h-3 w-32" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="col-span-1 glass">
                    <CardHeader>
                        <Skeleton className="h-6 w-32" />
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                    </CardContent>
                </Card>

                <Card className="col-span-4 glass">
                    <CardHeader>
                        <Skeleton className="h-6 w-48 mb-2" />
                        <Skeleton className="h-4 w-64" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                    <div className="space-y-1">
                                        <Skeleton className="h-4 w-48" />
                                        <Skeleton className="h-3 w-32" />
                                    </div>
                                    <Skeleton className="h-6 w-20 rounded-full" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
