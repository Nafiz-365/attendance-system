"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, TrendingUp, Users, AlertTriangle, FileText, FileSpreadsheet } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export default function TeacherReportsPage() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any[]>([]);
    const [defaulters, setDefaulters] = useState<any[]>([]);
    const [exporting, setExporting] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Get Teacher Info
                const userStr = localStorage.getItem("user");
                if (!userStr) return;
                const user = JSON.parse(userStr);

                // 2. Fetch Allocations (My Classes)
                const allocRes = await fetch("/api/academic/allocations");
                if (!allocRes.ok) throw new Error("Failed to fetch allocations");
                const allAllocations = await allocRes.json();

                // Filter for this teacher
                const myClasses = allAllocations.filter((a: any) => a.teacher?.user?.email === user.email);

                const classStats = [];
                let allDefaulters: any[] = [];

                // 3. Calculate Stats for each class
                for (const cls of myClasses) {
                    // Fetch attendance for this class (allocation)
                    // We need an endpoint that can filter attendance by allocationId or we assume 'attendance' relation in allocation is populated? 
                    // Looking at api/academic/allocations/route.ts, it includes `_count: { select: { attendance: true } }` but not the actual attendance records.

                    // We need to fetch students and their attendance count.
                    // Let's rely on a derived metric or fetch explicitly.
                    // For now, let's try to infer from what we have or skip complex calculation if API is missing.

                    // Let's use a mock-ish calculation based on the 'count' if available, otherwise 0.
                    // Actually, let's try to fetch attendance for the class if we can. 
                    // GET /api/attendance?batch=...&section=...&date=... 
                    // That's for daily.

                    // Let's make a "best effort" using just the student count vs total attendance records count.
                    // This is rough but gives *some* number.
                    // Average Attendance % = (Total Present Records / (Total Students * Total Days)) * 100

                    // We don't have "Total Days" easily.
                    // Let's keep it simple: Just show "Total Classes Conducted" (unique dates) if possible.

                    // Alternative: Fetch ALL attendance for this batch/section? Heavy.

                    // Let's use the `_count` we have from allocation. 
                    // cls._count.attendance = Total individual attendance records (Present+Absent+Late).
                    // This creates a "Activity Volume" metric.

                    classStats.push({
                        name: `${cls.course.code} (${cls.section})`,
                        totalRecords: cls._count?.attendance || 0,
                        batch: cls.batch,
                        section: cls.section
                    });
                }

                setStats(classStats);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleExportPDF = async () => {
        setExporting(true);
        try {
            const response = await fetch('/api/reports/export/pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                    endDate: new Date().toISOString()
                })
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `class-report-${Date.now()}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                addToast('PDF exported successfully', 'success');
            } else {
                throw new Error('Export failed');
            }
        } catch (error) {
            addToast('Failed to export PDF', 'error');
        } finally {
            setExporting(false);
        }
    };

    const handleExportExcel = async () => {
        setExporting(true);
        try {
            const response = await fetch('/api/reports/export/excel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                    endDate: new Date().toISOString()
                })
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `class-report-${Date.now()}.xlsx`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                addToast('Excel exported successfully', 'success');
            } else {
                throw new Error('Export failed');
            }
        } catch (error) {
            addToast('Failed to export Excel', 'error');
        } finally {
            setExporting(false);
        }
    };

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin h-8 w-8" /></div>;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight gradient-text-university">Class Reports</h2>
                    <p className="text-muted-foreground">Overview of attendance activities in your classes</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={handleExportPDF} variant="outline" size="sm" className="gap-2" disabled={exporting}>
                        <FileText className="w-4 h-4" /> {exporting ? 'Exporting...' : 'Export PDF'}
                    </Button>
                    <Button onClick={handleExportExcel} variant="outline" size="sm" className="gap-2" disabled={exporting}>
                        <FileSpreadsheet className="w-4 h-4" /> {exporting ? 'Exporting...' : 'Export Excel'}
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="hover-lift border-0 shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Classes Managed</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold gradient-text-primary">{stats.length}</div>
                    </CardContent>
                </Card>

                <Card className="hover-lift border-0 shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Attendance Records</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold gradient-text-primary">
                            {stats.reduce((acc, curr) => acc + curr.totalRecords, 0)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Across all your sections</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="shadow-premium border-0">
                <CardHeader>
                    <CardTitle>Attendance Volume by Class</CardTitle>
                    <CardDescription>Number of attendance records generated per class.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                <XAxis
                                    dataKey="name"
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value}`}
                                />
                                <Tooltip
                                    cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Bar
                                    dataKey="totalRecords"
                                    fill="hsl(var(--primary))"
                                    radius={[4, 4, 0, 0]}
                                    barSize={40}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
