'use client';

import { useEffect, useState } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import {
    Loader2,
    CheckCircle,
    XCircle,
    Clock,
    GraduationCap,
    UserCog,
    Calendar,
    FileText,
    Search,
    Filter,
} from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/toast';
import { Input } from '@/components/ui/input';

interface LeaveRequest {
    id: number;
    startDate: string;
    endDate: string;
    reason: string;
    status: string;
    createdAt: string;
    student?: {
        name: string;
        rollNo: string;
        batch: string;
        section: string;
        department: {
            code: string;
        };
    };
    teacher?: {
        name: string;
        employeeId: string;
        department: {
            code: string;
        };
    };
    approvedBy?: {
        name: string;
        role: string;
    };
}

export default function AdminLeavesPage() {
    const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
    const [filter, setFilter] = useState<'ALL' | 'STUDENT' | 'TEACHER'>('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const { addToast } = useToast();

    const fetchLeaves = async () => {
        try {
            const res = await fetch('/api/leaves');
            if (res.ok) {
                const data = await res.json();
                setLeaves(data);
            }
        } catch (error) {
            console.error('Failed to fetch leaves', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaves();
    }, []);

    const handleUpdateStatus = async (
        id: number,
        status: 'APPROVED' | 'REJECTED'
    ) => {
        setUpdatingId(id);
        try {
            const res = await fetch(`/api/leaves/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });

            if (!res.ok) throw new Error('Failed to update status');

            addToast(`Leave ${status.toLowerCase()} successfully`, 'success');
            fetchLeaves();
        } catch (error) {
            addToast('Something went wrong', 'error');
        } finally {
            setUpdatingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="animate-spin" />
            </div>
        );
    }

    // Filter Logic
    const filteredLeaves = leaves.filter((l) => {
        const matchesType =
            filter === 'ALL' ||
            (filter === 'STUDENT' ? !!l.student : !!l.teacher);
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
            l.student?.name.toLowerCase().includes(searchLower) ||
            '' ||
            l.student?.rollNo.toLowerCase().includes(searchLower) ||
            '' ||
            l.teacher?.name.toLowerCase().includes(searchLower) ||
            '' ||
            l.teacher?.employeeId.toLowerCase().includes(searchLower) ||
            '';

        return matchesType && matchesSearch;
    });

    const pendingLeaves = filteredLeaves.filter((l) => l.status === 'PENDING');
    const historyLeaves = filteredLeaves.filter((l) => l.status !== 'PENDING');

    // Stats
    const totalPending = leaves.filter((l) => l.status === 'PENDING').length;
    const totalApproved = leaves.filter((l) => l.status === 'APPROVED').length;
    const totalRejected = leaves.filter((l) => l.status === 'REJECTED').length;

    return (
        <div className="space-y-8 animate-fade-in p-1">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">
                        Leave Management
                    </h2>
                    <p className="text-muted-foreground mt-1">
                        Oversee and manage student and teacher leave requests
                    </p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Pending Requests
                        </CardTitle>
                        <Clock className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                            {totalPending}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Awaiting action
                        </p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Approved Leaves
                        </CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {totalApproved}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Total approved
                        </p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Rejected Leaves
                        </CardTitle>
                        <XCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {totalRejected}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Total rejected
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                {/* Controls */}
                <div className="flex flex-col sm:flex-row justify-between gap-4 items-center bg-card p-4 rounded-lg border shadow-sm">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 bg-background"
                        />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
                        <Button
                            variant={filter === 'ALL' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFilter('ALL')}
                            className="whitespace-nowrap"
                        >
                            All Requests
                        </Button>
                        <Button
                            variant={
                                filter === 'STUDENT' ? 'default' : 'outline'
                            }
                            size="sm"
                            onClick={() => setFilter('STUDENT')}
                            className="whitespace-nowrap"
                        >
                            Students
                        </Button>
                        <Button
                            variant={
                                filter === 'TEACHER' ? 'default' : 'outline'
                            }
                            size="sm"
                            onClick={() => setFilter('TEACHER')}
                            className="whitespace-nowrap"
                        >
                            Teachers
                        </Button>
                    </div>
                </div>

                {/* Pending Requests Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-full">
                            <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <h3 className="text-xl font-semibold">
                            Pending Requests
                        </h3>
                        {pendingLeaves.length > 0 && (
                            <Badge
                                variant="secondary"
                                className="ml-2 bg-orange-100 text-orange-700 hover:bg-orange-200 border-none"
                            >
                                {pendingLeaves.length} New
                            </Badge>
                        )}
                    </div>

                    {pendingLeaves.length === 0 ? (
                        <Card className="border-dashed bg-muted/30">
                            <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                                <CheckCircle className="w-12 h-12 mb-4 text-muted-foreground/20" />
                                <p>
                                    No pending requests matching your filters.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {pendingLeaves.map((leave) => (
                                <Card
                                    key={leave.id}
                                    className="group relative overflow-hidden border-t-4 border-t-orange-500 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                                >
                                    <div className="absolute top-0 right-0 p-4">
                                        <Badge
                                            variant="outline"
                                            className={
                                                leave.student
                                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                    : 'bg-purple-50 text-purple-700 border-purple-200'
                                            }
                                        >
                                            {leave.student
                                                ? 'Student'
                                                : 'Teacher'}
                                        </Badge>
                                    </div>
                                    <CardHeader className="pb-3 pt-6">
                                        <div className="flex items-start gap-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                                                {(
                                                    leave.student?.name ||
                                                    leave.teacher?.name
                                                )?.charAt(0)}
                                            </div>
                                            <div>
                                                <CardTitle className="text-base font-bold line-clamp-1">
                                                    {leave.student?.name ||
                                                        leave.teacher?.name}
                                                </CardTitle>
                                                <div className="text-xs text-muted-foreground font-mono mt-1 flex items-center gap-1">
                                                    {leave.student ? (
                                                        <>
                                                            <GraduationCap
                                                                size={12}
                                                            />{' '}
                                                            {
                                                                leave.student
                                                                    .rollNo
                                                            }{' '}
                                                            •{' '}
                                                            {
                                                                leave.student
                                                                    .batch
                                                            }
                                                        </>
                                                    ) : (
                                                        <>
                                                            <UserCog
                                                                size={12}
                                                            />{' '}
                                                            {
                                                                leave.teacher
                                                                    ?.employeeId
                                                            }{' '}
                                                            •{' '}
                                                            {
                                                                leave.teacher
                                                                    ?.department
                                                                    ?.code
                                                            }
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="bg-muted/40 p-3 rounded-lg text-sm italic text-muted-foreground border border-border/40">
                                            {`"${leave.reason}"`}
                                        </div>

                                        <div className="flex items-center gap-2 text-sm font-medium text-foreground/80">
                                            <Calendar className="w-4 h-4 text-orange-500" />
                                            <span>
                                                {format(
                                                    new Date(leave.startDate),
                                                    'MMM d'
                                                )}
                                                <span className="text-muted-foreground mx-1">
                                                    ➜
                                                </span>
                                                {format(
                                                    new Date(leave.endDate),
                                                    'MMM d, yyyy'
                                                )}
                                            </span>
                                        </div>

                                        <div className="flex gap-3 pt-2">
                                            <Button
                                                className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow group-hover:opacity-100 transition-all"
                                                size="sm"
                                                onClick={() =>
                                                    handleUpdateStatus(
                                                        leave.id,
                                                        'APPROVED'
                                                    )
                                                }
                                                disabled={
                                                    updatingId === leave.id
                                                }
                                            >
                                                {updatingId === leave.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <CheckCircle className="w-4 h-4 mr-2" />
                                                )}
                                                Approve
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="flex-1 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 shadow-sm"
                                                size="sm"
                                                onClick={() =>
                                                    handleUpdateStatus(
                                                        leave.id,
                                                        'REJECTED'
                                                    )
                                                }
                                                disabled={
                                                    updatingId === leave.id
                                                }
                                            >
                                                {updatingId === leave.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <XCircle className="w-4 h-4 mr-2" />
                                                )}
                                                Reject
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                <Separator className="my-8" />

                {/* History Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full">
                            <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold">
                            Request History
                        </h3>
                    </div>

                    <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40 hover:bg-muted/60">
                                    <TableHead className="w-[200px]">
                                        Name
                                    </TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead className="w-[300px]">
                                        Reason
                                    </TableHead>
                                    <TableHead>Duration</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Processed By</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {historyLeaves.map((leave) => (
                                    <TableRow
                                        key={leave.id}
                                        className="hover:bg-muted/40 transition-colors"
                                    >
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
                                                    {(
                                                        leave.student?.name ||
                                                        leave.teacher?.name
                                                    )?.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-semibold">
                                                        {leave.student?.name ||
                                                            leave.teacher?.name}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {leave.student
                                                            ? leave.student
                                                                  .rollNo
                                                            : leave.teacher
                                                                  ?.employeeId}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="secondary"
                                                className="text-xs font-normal"
                                            >
                                                {leave.student
                                                    ? 'Student'
                                                    : 'Teacher'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div
                                                className="max-w-[280px] p-1 truncate text-sm text-foreground/80"
                                                title={leave.reason}
                                            >
                                                {leave.reason}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm font-medium">
                                                {format(
                                                    new Date(leave.startDate),
                                                    'MMM d'
                                                )}{' '}
                                                -{' '}
                                                {format(
                                                    new Date(leave.endDate),
                                                    'MMM d'
                                                )}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {format(
                                                    new Date(leave.createdAt),
                                                    'yyyy'
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={
                                                    leave.status === 'APPROVED'
                                                        ? 'bg-green-100 text-green-700 hover:bg-green-200 border-green-200'
                                                        : 'bg-red-100 text-red-700 hover:bg-red-200 border-red-200'
                                                }
                                            >
                                                {leave.status === 'APPROVED' ? (
                                                    <CheckCircle className="w-3 h-3 mr-1" />
                                                ) : (
                                                    <XCircle className="w-3 h-3 mr-1" />
                                                )}
                                                {leave.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {leave.approvedBy ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold">
                                                        {leave.approvedBy.name.charAt(
                                                            0
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-medium leading-none">
                                                            {
                                                                leave.approvedBy
                                                                    .name
                                                            }
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground">
                                                            {
                                                                leave.approvedBy
                                                                    .role
                                                            }
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground text-xs italic">
                                                    -
                                                </span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {historyLeaves.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="text-center h-32 text-muted-foreground"
                                        >
                                            <div className="flex flex-col items-center gap-1">
                                                <Search className="h-8 w-8 opacity-20" />
                                                <p>
                                                    No history available
                                                    matching your search.
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </div>
    );
}
