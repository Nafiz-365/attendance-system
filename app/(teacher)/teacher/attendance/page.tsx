'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import {
    Users,
    CheckCircle,
    XCircle,
    Clock,
    Save,
    ArrowLeft,
    Loader2,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

interface Student {
    id: number;
    name: string;
    studentId: string;
    status: 'Present' | 'Absent' | 'Late' | null;
}

interface Allocation {
    id: number;
    teacherId: number;
    batch: string;
    section: string;
    course: {
        code: string;
        name: string;
    };
}

function AttendanceContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const allocationIdParam = searchParams.get('allocationId');

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [allocation, setAllocation] = useState<Allocation | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedDate, setSelectedDate] = useState(
        new Date().toISOString().split('T')[0]
    );

    // State for missing allocation selection
    const [allocations, setAllocations] = useState<Allocation[]>([]);

    // Debug state
    const [debugInfo, setDebugInfo] = useState<string>('');

    const { addToast } = useToast();

    const fetchTeacherAllocations = async () => {
        const userDataStr = localStorage.getItem('user');
        if (userDataStr) {
            const userData = JSON.parse(userDataStr);
            try {
                // 1. Get Teacher ID
                const teacherRes = await fetch(
                    `/api/teachers?email=${userData.email}`
                );
                if (teacherRes.ok) {
                    const teachers = await teacherRes.json();
                    if (teachers.length > 0) {
                        const teacherId = teachers[0].id;
                        console.log('Found Teacher ID:', teacherId);

                        // 2. Fetch Allocations
                        const allRes = await fetch('/api/academic/allocations');
                        if (allRes.ok) {
                            const all = await allRes.json();
                            console.log('Total Allocations:', all.length);

                            // Loose comparison
                            const myAllocations = all.filter(
                                (a: Allocation) => {
                                    const match = a.teacherId == teacherId;
                                    if (match) console.log('Match found:', a);
                                    return match;
                                }
                            );

                            setAllocations(myAllocations);

                            if (myAllocations.length === 0) {
                                setDebugInfo(
                                    `Teacher ID: ${teacherId}, Total Allocations: ${all.length}. No matches found.`
                                );
                            }
                        } else {
                            setDebugInfo('Failed to fetch allocations API');
                        }
                    } else {
                        setDebugInfo(
                            `No teacher profile found for email: ${userData.email}`
                        );
                    }
                } else {
                    setDebugInfo('Failed to fetch teacher profile API');
                }
            } catch (e: Error | unknown) {
                console.error('Failed to fetch classes', e);
                setDebugInfo(
                    `Error: ${e instanceof Error ? e.message : String(e)}`
                );
            }
        } else {
            setDebugInfo('No user logged in (localStorage empty)');
        }
        setLoading(false);
    };

    const fetchAllocationDetails = async (id: string) => {
        try {
            const allRes = await fetch('/api/academic/allocations');
            if (allRes.ok) {
                const all = await allRes.json();
                const found = all.find(
                    (a: Allocation) => a.id === parseInt(id)
                );
                if (found) {
                    setAllocation(found);
                    fetchStudents(found.batch, found.section);
                } else {
                    addToast('Allocation not found', 'error');
                    setLoading(false);
                }
            }
        } catch (e) {
            console.error(e);
            addToast('Error fetching class details', 'error');
            setLoading(false);
        }
    };

    const fetchStudents = async (batch: string, section: string) => {
        try {
            const res = await fetch(
                `/api/students?batch=${batch}&section=${section}`
            );
            if (res.ok) {
                const data = await res.json();
                setStudents(
                    data.map((s: Omit<Student, 'status'>) => ({
                        ...s,
                        status: null,
                    }))
                );
            }
        } catch (e) {
            addToast('Failed to fetch students', 'error');
        }
        setLoading(false);
    };

    useEffect(() => {
        const loadData = async () => {
            if (allocationIdParam) {
                await fetchAllocationDetails(allocationIdParam);
            } else {
                await fetchTeacherAllocations();
            }
        };
        loadData();
    }, [allocationIdParam]);

    const markAttendance = (
        studentId: number,
        status: 'Present' | 'Absent' | 'Late'
    ) => {
        setStudents(
            students.map((s) => (s.id === studentId ? { ...s, status } : s))
        );
    };

    const markAllPresent = () => {
        setStudents(
            students.map((s) => ({ ...s, status: 'Present' as const }))
        );
        addToast('Marked all students as present', 'success');
    };

    const saveAttendance = async () => {
        const unmarked = students.filter((s) => !s.status).length;
        if (unmarked > 0) {
            if (
                !confirm(
                    `Warning: ${unmarked} students are not marked. Save anyway?`
                )
            )
                return;
        }

        setSaving(true);
        try {
            const records = students
                .filter((s) => s.status)
                .map((s) => ({
                    studentId: s.id,
                    status: s.status?.toUpperCase(),
                }));

            const res = await fetch('/api/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    records,
                    allocationId: allocationIdParam,
                    date: selectedDate,
                }),
            });

            if (res.ok) {
                addToast('Attendance saved successfully!', 'success');
                router.push('/teacher/dashboard');
            } else {
                addToast('Failed to save attendance', 'error');
            }
        } catch (e) {
            addToast('An error occurred', 'error');
        }
        setSaving(false);
    };

    const handleAllocationSelect = (value: string) => {
        router.push(`/teacher/attendance?allocationId=${value}`);
    };

    if (loading)
        return (
            <div className="p-8">
                <Loader2 className="animate-spin" />
            </div>
        );

    if (!allocationIdParam) {
        return (
            <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">
                            Mark Attendance
                        </h2>
                        <p className="text-muted-foreground">
                            Select a class to proceed
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Select Class</CardTitle>
                        <CardDescription>
                            Choose one of your assigned classes
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {allocations.length > 0 ? (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {allocations.map((alloc) => (
                                    <div
                                        key={alloc.id}
                                        className="cursor-pointer border rounded-lg p-4 hover:bg-muted/50 transition-colors flex flex-col gap-2 ring-1 ring-border hover:ring-primary"
                                        onClick={() =>
                                            handleAllocationSelect(
                                                alloc.id.toString()
                                            )
                                        }
                                    >
                                        <div className="font-bold text-lg text-primary">
                                            {alloc.course.code}
                                        </div>
                                        <div className="text-sm font-medium">
                                            {alloc.course.name}
                                        </div>
                                        <div className="flex gap-2 mt-2">
                                            <Badge variant="secondary">
                                                {alloc.batch}
                                            </Badge>
                                            <Badge variant="outline">
                                                Sec {alloc.section}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <p>No classes assigned to you yet.</p>
                                {debugInfo &&
                                    process.env.NODE_ENV === 'development' && (
                                        <div className="mt-4 p-4 bg-muted rounded text-xs text-left font-mono whitespace-pre-wrap hidden">
                                            DEBUG INFO:
                                            <br />
                                            {debugInfo}
                                        </div>
                                    )}
                                <Link href="/teacher/dashboard">
                                    <Button className="mt-4" variant="outline">
                                        Back to Dashboard
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">
                        Mark Attendance
                    </h2>
                    <p className="text-muted-foreground">
                        {allocation
                            ? `${allocation.course.code} - ${allocation.batch} (${allocation.section})`
                            : 'Loading...'}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link href="/teacher/attendance">
                        <Button variant="outline" className="mr-2">
                            <ArrowLeft className="h-4 w-4 mr-2" /> Change Class
                        </Button>
                    </Link>
                </div>
            </div>

            <Card className="border-0 shadow-md bg-card/50 backdrop-blur">
                <CardContent className="p-6">
                    <div className="flex items-end gap-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Date</label>
                            <Input
                                suppressHydrationWarning
                                type="date"
                                className="w-auto"
                                value={selectedDate}
                                onChange={(e) =>
                                    setSelectedDate(e.target.value)
                                }
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-premium border-0">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Student List ({students.length})</CardTitle>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={markAllPresent}>
                            <CheckCircle className="h-4 w-4 mr-2" /> Mark All
                            Present
                        </Button>
                        <Button
                            onClick={saveAttendance}
                            disabled={saving}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            {saving ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4 mr-2" />
                            )}
                            Save Attendance
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Using Table to match Admin UI */}
                    <div className="rounded-md border">
                        <table className="w-full caption-bottom text-sm text-left">
                            <thead className="[&_tr]:border-b">
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">
                                        Student ID
                                    </th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">
                                        Name
                                    </th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {students.map((student) => (
                                    <tr
                                        key={student.id}
                                        className="border-b transition-colors hover:bg-muted/50"
                                    >
                                        <td className="p-4 align-middle font-mono">
                                            {student.studentId}
                                        </td>
                                        <td className="p-4 align-middle font-medium">
                                            {student.name}
                                        </td>
                                        <td className="p-4 align-middle">
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant={
                                                        student.status ===
                                                        'Present'
                                                            ? 'default'
                                                            : 'outline'
                                                    }
                                                    className={`w-24 ${
                                                        student.status ===
                                                        'Present'
                                                            ? 'bg-green-600 hover:bg-green-700'
                                                            : 'opacity-50 hover:opacity-100'
                                                    }`}
                                                    onClick={() =>
                                                        markAttendance(
                                                            student.id,
                                                            'Present'
                                                        )
                                                    }
                                                >
                                                    Present
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant={
                                                        student.status ===
                                                        'Absent'
                                                            ? 'destructive'
                                                            : 'outline'
                                                    }
                                                    className={`w-24 ${
                                                        student.status ===
                                                        'Absent'
                                                            ? ''
                                                            : 'opacity-50 hover:opacity-100'
                                                    }`}
                                                    onClick={() =>
                                                        markAttendance(
                                                            student.id,
                                                            'Absent'
                                                        )
                                                    }
                                                >
                                                    Absent
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant={
                                                        student.status ===
                                                        'Late'
                                                            ? 'secondary'
                                                            : 'outline'
                                                    }
                                                    className={`w-24 ${
                                                        student.status ===
                                                        'Late'
                                                            ? 'bg-yellow-500 text-white'
                                                            : 'opacity-50 hover:opacity-100'
                                                    }`}
                                                    onClick={() =>
                                                        markAttendance(
                                                            student.id,
                                                            'Late'
                                                        )
                                                    }
                                                >
                                                    Late
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function AttendancePageWrapper() {
    return (
        <Suspense
            fallback={
                <div className="p-8">
                    <Loader2 className="animate-spin" />
                </div>
            }
        >
            <AttendanceContent />
        </Suspense>
    );
}
