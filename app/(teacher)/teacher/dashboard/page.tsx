"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, BookOpen, Users, Calendar, CheckCircle, Clock, Bell } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const DAYS = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

export default function TeacherDashboard() {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);
    const [schedule, setSchedule] = useState<any[]>([]);
    const [notices, setNotices] = useState<any[]>([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            const userDataStr = localStorage.getItem("user");
            if (userDataStr) {
                const userData = JSON.parse(userDataStr);
                setUser(userData);

                try {
                    const res = await fetch(`/api/teacher/stats?email=${userData.email}`);
                    if (res.ok) {
                        const data = await res.json();
                        setStats(data.stats);
                        setSchedule(data.todaysSchedule);
                    }
                } catch (e) {
                    console.error("Failed to load dashboard", e);
                }
            }
            setLoading(false);
        };

        fetchDashboardData();

        // Fetch notices
        const fetchNotices = async () => {
            try {
                const res = await fetch('/api/notices');
                if (res.ok) {
                    const allNotices = await res.json();
                    // Filter for teachers
                    const teacherNotices = allNotices.filter((n: any) =>
                        n.audience === 'ALL' || n.audience === 'TEACHERS'
                    );
                    setNotices(teacherNotices.slice(0, 3));
                }
            } catch (error) {
                console.error('Failed to fetch notices', error);
            }
        };
        fetchNotices();
    }, []);

    if (loading) {
        return (
            <div className="space-y-4 p-8">
                <Skeleton className="h-12 w-[300px]" />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-32 rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Welcome, {user?.name}!</h2>
                    <p className="text-muted-foreground">Here is your daily overview.</p>
                </div>
                <div className="text-right">
                    <p className="text-xl font-bold text-primary">{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</p>
                    <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString()}</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="hover-lift">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Today's Classes</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">{stats?.todaysClassesCount || 0}</div>
                        <p className="text-xs text-muted-foreground">Scheduled sessions</p>
                    </CardContent>
                </Card>
                <Card className="hover-lift">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Subjects</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalAllocations || 0}</div>
                        <p className="text-xs text-muted-foreground">Assigned courses</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-4 lg:col-span-2">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold">Today's Schedule</h3>
                    </div>
                    {schedule.length > 0 ? (
                        <div className="space-y-4">
                            {schedule.map((routine) => (
                                <Card key={routine.id} className="hover-lift glass border-l-4 border-l-primary">
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div>
                                            <h4 className="font-bold text-lg">{routine.allocation.course.code} - {routine.allocation.course.name}</h4>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                                <Badge variant="secondary">{routine.allocation.batch} - {routine.allocation.section}</Badge>
                                                {routine.roomNo && <Badge variant="outline"><span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> Room {routine.roomNo}</span></Badge>}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center gap-2 font-mono text-lg font-semibold text-primary">
                                                <Clock className="h-4 w-4" />
                                                {routine.startTime}
                                            </div>
                                            <div className="mt-2">
                                                <Link href={`/teacher/attendance?allocationId=${routine.allocationId}`}>
                                                    <Button size="sm">Take Attendance</Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="bg-muted/50 border-dashed">
                            <CardContent className="p-8 text-center text-muted-foreground">
                                <Calendar className="h-10 w-10 mx-auto mb-2 opacity-50" />
                                <p>No classes scheduled for today.</p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Announcements</h3>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Bell className="h-4 w-4 text-blue-500" />
                                Recent Notices
                            </CardTitle>
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

                    <h3 className="text-xl font-semibold">Quick Actions</h3>
                    <Card>
                        <CardContent className="p-0">
                            {[
                                { label: "Mark Attendance", desc: "Record daily attendance", href: "/teacher/attendance", icon: CheckCircle, color: "text-green-600" },
                                { label: "My Profile", desc: "View your details", href: "/teacher/profile", icon: Users, color: "text-blue-600" },
                                { label: "Leave Requests", desc: "Review applications", href: "/teacher/leaves", icon: Calendar, color: "text-purple-600" },
                            ].map((item, i) => (
                                <Link key={i} href={item.href} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors border-b last:border-0">
                                    <div className={`h-10 w-10 rounded-full bg-muted flex items-center justify-center ${item.color}`}>
                                        <item.icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-medium">{item.label}</p>
                                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                                    </div>
                                </Link>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
