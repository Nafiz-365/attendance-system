'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface AttendanceRecord {
    id: number;
    date: string;
    status: string;
    allocation?: {
        course: {
            code: string;
            name: string;
        };
    };
}

export default function StudentAttendancePage() {
    const [loading, setLoading] = useState(true);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [stats, setStats] = useState({
        total: 0,
        present: 0,
        absent: 0,
        late: 0,
        percentage: 0,
    });

    useEffect(() => {
        fetchAttendance();
    }, []);

    const fetchAttendance = async () => {
        try {
            const res = await fetch('/api/student/attendance');
            if (res.ok) {
                const data = await res.json();
                setAttendance(data.attendance);
                setStats(data.stats);
            } else {
                setStats({
                    total: 0,
                    present: 0,
                    absent: 0,
                    late: 0,
                    percentage: 0,
                });
            }
        } catch (error) {
            console.error('Failed to fetch attendance', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Present':
                return (
                    <Badge className="bg-green-500">
                        <CheckCircle className="w-3 h-3 mr-1" /> Present
                    </Badge>
                );
            case 'Absent':
                return (
                    <Badge variant="destructive">
                        <XCircle className="w-3 h-3 mr-1" /> Absent
                    </Badge>
                );
            case 'Late':
                return (
                    <Badge className="bg-yellow-500">
                        <Clock className="w-3 h-3 mr-1" /> Late
                    </Badge>
                );
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">
                    My Attendance
                </h2>
                <p className="text-muted-foreground">
                    View your attendance records
                </p>
            </div>

            {/* Statistics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Classes
                        </CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Present
                        </CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {stats.present}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Absent
                        </CardTitle>
                        <XCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {stats.absent}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Attendance Rate
                        </CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.percentage}%
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Attendance Records */}
            <Card>
                <CardHeader>
                    <CardTitle>Attendance History</CardTitle>
                </CardHeader>
                <CardContent>
                    {attendance.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No attendance records found
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {attendance.map((record) => (
                                <div
                                    key={record.id}
                                    className="flex items-center justify-between p-3 border rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <div className="flex flex-col">
                                            <span className="font-medium">
                                                {format(
                                                    new Date(record.date),
                                                    'PPP'
                                                )}
                                            </span>
                                            {record.allocation?.course && (
                                                <span className="text-xs text-muted-foreground">
                                                    {
                                                        record.allocation.course
                                                            .code
                                                    }{' '}
                                                    -{' '}
                                                    {
                                                        record.allocation.course
                                                            .name
                                                    }
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {getStatusBadge(record.status)}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
