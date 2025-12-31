'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Download,
    FileText,
    BarChart3,
    PieChart,
    Activity,
    TrendingUp,
    Users,
    AlertCircle,
    Clock,
    FileSpreadsheet,
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart as RePieChart,
    Pie,
    Cell,
} from 'recharts';
import { useToast } from '@/components/ui/toast';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';

interface Activity {
    id: number;
    action: string;
    description: string;
    time: string;
}

interface Defaulter {
    studentId: string;
    name: string;
    batch: string;
    section: string;
    rate: number;
}

interface ReportStats {
    monthlyAverage: number;
    bestClass: string;
    bestClassRate: number;
    totalPresent: number;
    reportsGenerated: number;
    attendanceTrend: { date: string; percentage: number }[];
    defaulterDistribution: { name: string; value: number; fill: string }[];
    topDefaulters: Defaulter[];
}

export default function ReportsPage() {
    const [stats, setStats] = useState<ReportStats | null>(null);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [monthDate, setMonthDate] = useState(
        new Date().toISOString().split('T')[0]
    );
    const [monthBatch, setMonthBatch] = useState('50');
    const [exporting, setExporting] = useState(false);
    const { addToast } = useToast();

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [statsRes, activityRes] = await Promise.all([
                fetch('/api/reports/stats'),
                fetch('/api/reports/recent'),
            ]);

            if (statsRes.ok) setStats((await statsRes.json()) as ReportStats);
            if (activityRes.ok)
                setActivities((await activityRes.json()) as Activity[]);
        } catch (error) {
            console.error(error);
            addToast('Failed to load dashboard data', 'error');
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDownloadSummary = () =>
        window.open('/api/reports/summary', '_blank');

    const handleDownloadMonthly = () => {
        const query = new URLSearchParams({
            date: monthDate,
            batch: monthBatch,
        }).toString();
        window.open(`/api/reports/monthly?${query}`, '_blank');
    };

    const handleExportPDF = async () => {
        setExporting(true);
        try {
            const response = await fetch('/api/reports/export/pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    startDate: new Date(
                        Date.now() - 30 * 24 * 60 * 60 * 1000
                    ).toISOString(),
                    endDate: new Date().toISOString(),
                }),
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `attendance-report-${Date.now()}.pdf`;
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
                    startDate: new Date(
                        Date.now() - 30 * 24 * 60 * 60 * 1000
                    ).toISOString(),
                    endDate: new Date().toISOString(),
                }),
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `attendance-report-${Date.now()}.xlsx`;
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

    return (
        <div className="space-y-8 animate-fade-in p-1">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight gradient-text-university">
                        Reports & Analytics
                    </h2>
                    <p className="text-muted-foreground mt-1">
                        Real-time insights and performance metrics
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={handleExportPDF}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        disabled={exporting}
                    >
                        <FileText className="w-4 h-4" />{' '}
                        {exporting ? 'Exporting...' : 'Export PDF'}
                    </Button>
                    <Button
                        onClick={handleExportExcel}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        disabled={exporting}
                    >
                        <FileSpreadsheet className="w-4 h-4" />{' '}
                        {exporting ? 'Exporting...' : 'Export Excel'}
                    </Button>
                    <Button
                        onClick={fetchData}
                        variant="outline"
                        size="sm"
                        className="gap-2 hover:bg-muted"
                    >
                        <Activity className="w-4 h-4 text-primary" /> Refresh
                    </Button>
                </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="shadow-sm border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Monthly Avg
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats?.monthlyAverage || 0}%
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Overall attendance rate
                        </p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Best Class
                        </CardTitle>
                        <Users className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats?.bestClass || 'N/A'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {stats?.bestClassRate || 0}% attendance rate
                        </p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Present
                        </CardTitle>
                        <Users className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats?.totalPresent || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Students present this month
                        </p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Activities
                        </CardTitle>
                        <Activity className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats?.reportsGenerated || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            System events logged
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid gap-6 md:grid-cols-7">
                <Card className="md:col-span-4 shadow-premium border-0">
                    <CardHeader>
                        <CardTitle>Attendance Trends</CardTitle>
                        <CardDescription>
                            Daily attendance percentage (Last 7 Days)
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        {stats && stats.attendanceTrend ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.attendanceTrend}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                        opacity={0.3}
                                    />
                                    <XAxis
                                        dataKey="date"
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fontSize: 12 }}
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `${value}%`}
                                        tick={{ fontSize: 12 }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{
                                            borderRadius: '8px',
                                            border: 'none',
                                            boxShadow:
                                                '0 4px 12px rgba(0,0,0,0.1)',
                                        }}
                                    />
                                    <Bar
                                        dataKey="percentage"
                                        fill="#3b82f6"
                                        radius={[4, 4, 0, 0]}
                                        barSize={40}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground animate-pulse">
                                Loading trends...
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="md:col-span-3 shadow-premium border-0">
                    <CardHeader>
                        <CardTitle>Performance Zones</CardTitle>
                        <CardDescription>
                            Student distribution by attendance rate
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        {stats && stats.defaulterDistribution ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <RePieChart>
                                    <Pie
                                        data={stats.defaulterDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {stats?.defaulterDistribution?.map(
                                            (entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={entry.fill}
                                                    strokeWidth={0}
                                                />
                                            )
                                        )}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '8px',
                                            border: 'none',
                                            boxShadow:
                                                '0 4px 12px rgba(0,0,0,0.1)',
                                        }}
                                    />
                                </RePieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground animate-pulse">
                                Loading...
                            </div>
                        )}
                        <div className="flex justify-center gap-4 mt-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-red-500"></div>{' '}
                                Critical (&lt;50%)
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>{' '}
                                Risk (50-75%)
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>{' '}
                                Good (&gt;75%)
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* List Widgets */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="shadow-md">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-red-500" />
                                Top Defaulters
                            </CardTitle>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs h-8"
                                onClick={() =>
                                    window.open(
                                        '/api/reports/defaulters',
                                        '_blank'
                                    )
                                }
                            >
                                View All
                            </Button>
                        </div>
                        <CardDescription>
                            Students with lowest attendance requiring attention
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats &&
                            stats.topDefaulters &&
                            stats.topDefaulters.length > 0 ? (
                                stats.topDefaulters.map((student) => (
                                    <div
                                        key={student.studentId}
                                        className="flex items-center justify-between pb-2 border-b last:border-0 last:pb-0"
                                    >
                                        <div>
                                            <p className="font-medium text-sm">
                                                {student.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {student.batch} - Section{' '}
                                                {student.section}
                                            </p>
                                        </div>
                                        <Badge
                                            variant="destructive"
                                            className="ml-auto"
                                        >
                                            {student.rate}%
                                        </Badge>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No critical defaulters found!
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-md">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Clock className="w-4 h-4 text-blue-500" />
                                Recent Activity
                            </CardTitle>
                        </div>
                        <CardDescription>
                            Latest attendance logs
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[200px] pr-4">
                            <div className="space-y-4">
                                {activities.length > 0 ? (
                                    activities.map((activity) => (
                                        <div
                                            key={activity.id}
                                            className="flex items-start gap-4 pb-2"
                                        >
                                            <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-400 shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium leading-none">
                                                    {activity.action}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {activity.description}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground/60">
                                                    {format(
                                                        new Date(activity.time),
                                                        'MMM d, h:mm a'
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        No recent activity.
                                    </p>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions / Downloads */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="bg-muted/30 border-dashed border-2">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">
                            Class Summary Report
                        </CardTitle>
                        <CardDescription>
                            Export overview CSV/Excel
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            variant="outline"
                            className="w-full bg-white dark:bg-black"
                            onClick={handleDownloadSummary}
                        >
                            <Download className="mr-2 h-4 w-4" /> Download
                            Report
                        </Button>
                    </CardContent>
                </Card>

                <Card className="bg-muted/30 border-dashed border-2">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle className="text-sm font-medium">
                                    Monthly Detailed Report
                                </CardTitle>
                                <CardDescription>
                                    Select filters to export
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex gap-2">
                        <Input
                            type="month"
                            value={monthDate.slice(0, 7)}
                            onChange={(e) =>
                                setMonthDate(e.target.value + '-01')
                            }
                            className="bg-white dark:bg-black"
                        />
                        <Input
                            placeholder="Batch"
                            value={monthBatch}
                            onChange={(e) => setMonthBatch(e.target.value)}
                            className="w-24 bg-white dark:bg-black"
                        />
                        <Button
                            variant="outline"
                            className="bg-white dark:bg-black"
                            onClick={handleDownloadMonthly}
                        >
                            <Download className="h-4 w-4" />
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
