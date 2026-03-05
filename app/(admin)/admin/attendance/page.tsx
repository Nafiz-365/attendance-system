'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Loader2, Save, Filter } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

interface Student {
    id: number;
    studentId: string;
    name: string;
}

interface Department {
    id: string;
    name: string;
}

export default function AttendancePage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const { addToast } = useToast();
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedDept, setSelectedDept] = useState('');
    const [batch, setBatch] = useState('50');
    const [section, setSection] = useState('A');

    // Attendance State
    const [attendance, setAttendance] = useState<Record<number, string>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const res = await fetch('/api/departments');
            if (res.ok) {
                const data = await res.json();
                console.log('Departments fetched:', data);
                setDepartments(data);
                if (data.length > 0) {
                    console.log('Setting default department:', data[0].id);
                    setSelectedDept(data[0].id);
                } else {
                    console.warn('No departments found.');
                }
            } else {
                console.error(
                    'Failed to fetch departments:',
                    res.status,
                    res.statusText
                );
            }
        } catch (err) {
            console.error('Error fetching departments:', err);
        }
    };

    const fetchStudentsAndAttendance = async () => {
        console.log('Fetch requested with:', { selectedDept, batch, section });

        if (!selectedDept || !batch || !section) {
            console.warn('Missing filter criteria, aborting fetch.');
            addToast('Please select Department, Batch and Section', 'warning');
            return;
        }

        setLoading(true);
        try {
            console.log(
                `Fetching students: /api/students?departmentId=${selectedDept}&batch=${batch}&section=${section}`
            );
            const studentsRes = await fetch(
                `/api/students?departmentId=${selectedDept}&batch=${batch}&section=${section}`
            );

            if (!studentsRes.ok) {
                throw new Error(`Students API failed: ${studentsRes.status}`);
            }

            const studentsData = await studentsRes.json();
            console.log('Students loaded:', studentsData);

            console.log(
                `Fetching attendance: /api/attendance?date=${date}&batch=${batch}&section=${section}`
            );
            const attendanceRes = await fetch(
                `/api/attendance?date=${date}&batch=${batch}&section=${section}`
            );

            if (!attendanceRes.ok) {
                throw new Error(
                    `Attendance API failed: ${attendanceRes.status}`
                );
            }

            const attendanceData = await attendanceRes.json();
            console.log('Attendance loaded:', attendanceData);

            setStudents(studentsData);

            const attMap: Record<number, string> = {};
            studentsData.forEach((s: Student) => (attMap[s.id] = 'Present'));

            if (Array.isArray(attendanceData)) {
                attendanceData.forEach(
                    (a: { studentId: number; status: string }) => {
                        attMap[a.studentId] = a.status;
                    }
                );
            }

            setAttendance(attMap);
        } catch (error: Error | unknown) {
            console.error('Fetch error:', error);
            const errorMessage =
                error instanceof Error ? error.message : 'Unknown error';
            addToast(`Failed to fetch data: ${errorMessage}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (studentId: number, status: string) => {
        setAttendance((prev) => ({ ...prev, [studentId]: status }));
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const records = Object.entries(attendance).map(
                ([studentId, status]) => ({
                    studentId: parseInt(studentId),
                    status,
                })
            );

            const res = await fetch('/api/attendance/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    date: new Date(date).toISOString(),
                    records,
                }),
            });

            if (!res.ok) throw new Error('Failed to save');

            addToast('Attendance saved successfully', 'success');
        } catch (err) {
            console.error(err);
            addToast('Failed to save attendance', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight gradient-text-university">
                        Attendance
                    </h2>
                    <p className="text-muted-foreground">
                        Mark daily attendance for students
                    </p>
                </div>
            </div>

            <Card className="border-0 shadow-md bg-card/50 backdrop-blur">
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Date</label>
                            <Input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">
                                Department
                            </label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3"
                                value={selectedDept}
                                onChange={(e) =>
                                    setSelectedDept(e.target.value)
                                }
                            >
                                {departments.map((d) => (
                                    <option key={d.id} value={d.id}>
                                        {d.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Batch</label>
                            <Input
                                value={batch}
                                onChange={(e) => setBatch(e.target.value)}
                                placeholder="50"
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">
                                Section
                            </label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3"
                                value={section}
                                onChange={(e) => setSection(e.target.value)}
                            >
                                {[
                                    'A',
                                    'B',
                                    'C',
                                    'D',
                                    'E',
                                    'F',
                                    'G',
                                    'H',
                                    'I',
                                    'J',
                                ].map((s) => (
                                    <option key={s} value={s}>
                                        {s}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <Button
                            onClick={fetchStudentsAndAttendance}
                            className="gradient-university text-white"
                        >
                            <Filter className="mr-2 h-4 w-4" /> Load Students
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {students.length > 0 && (
                <Card className="shadow-premium border-0">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Student List ({students.length})</CardTitle>
                        <Button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            {submitting ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <Save className="h-4 w-4 mr-2" />
                            )}
                            Save Attendance
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student ID</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.map((student) => (
                                    <TableRow key={student.id}>
                                        <TableCell className="font-mono">
                                            {student.studentId}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {student.name}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                {[
                                                    'Present',
                                                    'Absent',
                                                    'Late',
                                                ].map((status) => (
                                                    <Button
                                                        key={status}
                                                        size="sm"
                                                        variant={
                                                            attendance[
                                                                student.id
                                                            ] === status
                                                                ? status ===
                                                                  'Present'
                                                                    ? 'default'
                                                                    : status ===
                                                                      'Absent'
                                                                    ? 'destructive'
                                                                    : 'secondary'
                                                                : 'outline'
                                                        }
                                                        onClick={() =>
                                                            handleStatusChange(
                                                                student.id,
                                                                status
                                                            )
                                                        }
                                                        className={`w-24 ${
                                                            attendance[
                                                                student.id
                                                            ] === status
                                                                ? ''
                                                                : 'opacity-50 hover:opacity-100'
                                                        }`}
                                                    >
                                                        {status}
                                                    </Button>
                                                ))}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
