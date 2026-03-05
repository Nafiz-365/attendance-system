'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Modal } from '@/components/ui/modal';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Loader2,
    FileSpreadsheet,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { StudentImportModal } from '@/components/student-import-modal';

interface Student {
    id: number;
    name: string;
    email: string;
    studentId: string;
    batch: string;
    section: string;
    departmentId: number;
}

interface StudentData {
    name: string;
    email: string;
    studentId: string;
    batch: string;
    section: string;
    departmentId: string | number;
}

interface Department {
    id: number;
    name: string;
}

export default function StudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        const loadData = async () => {
            await fetchData();
        };
        loadData();
    }, []);

    const fetchData = async () => {
        try {
            const [studentsRes, deptsRes] = await Promise.all([
                fetch('/api/students'),
                fetch('/api/departments'),
            ]);

            if (studentsRes.ok) {
                const data = await studentsRes.json();
                setStudents(data);
            }
            if (deptsRes.ok) {
                const data = await deptsRes.json();
                setDepartments(data);
            }
        } catch (err) {
            console.error(err);
            addToast('Failed to fetch data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = students.filter(
        (student) =>
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.studentId
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (student.batch && student.batch.toString().includes(searchTerm)),
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);

        const payload = {
            name: formData.get('name'),
            email: formData.get('email'),
            studentId: formData.get('studentId'),
            batch: formData.get('batch'),
            section: formData.get('section'),
            departmentId: parseInt(formData.get('departmentId') as string),
        };

        try {
            const url = editingStudent
                ? `/api/students/${editingStudent.id}`
                : '/api/students';
            const method = editingStudent ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error('Operation failed');

            addToast(
                editingStudent ? 'Student updated' : 'Student added',
                'success',
            );
            fetchData();
            setIsModalOpen(false);
        } catch (err) {
            console.error(err);
            addToast('Failed to save student', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this student?')) return;

        try {
            console.log(`Attempting to delete student ${id}...`);
            const res = await fetch(`/api/students/${id}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                const errorData = await res.json();
                console.error('Delete failed response:', errorData);
                throw new Error(errorData.error || 'Delete failed');
            }

            console.log('Delete successful');
            setStudents(students.filter((s) => s.id !== id));
            addToast('Student deleted', 'success');
        } catch (error: unknown) {
            console.error('Delete error:', error);
            addToast(
                `Failed to delete: ${
                    error instanceof Error ? error.message : 'Unknown error'
                }`,
                'error',
            );
        }
    };

    const handleImport = async (data: StudentData[]) => {
        try {
            const normalizedData = data.map((student) => ({
                name: student.name,
                email: student.email,
                studentId: student.studentId,
                batch: student.batch,
                section: student.section,
                departmentId:
                    typeof student.departmentId === 'string'
                        ? parseInt(student.departmentId, 10)
                        : student.departmentId,
            }));

            const res = await fetch('/api/students/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ students: normalizedData }),
            });

            const result = await res.json();

            if (!res.ok) {
                // Construct a detailed error message
                let errorMessage = result.error || 'Import failed';
                if (result.details && Array.isArray(result.details)) {
                    errorMessage +=
                        ': ' + result.details.slice(0, 3).join(', ');
                    if (result.details.length > 3)
                        errorMessage += ` ...and ${
                            result.details.length - 3
                        } more errors`;
                }
                throw new Error(errorMessage);
            }

            let msg = `Successfully imported ${result.count} students`;
            if (result.duplicates > 0) {
                msg += ` (${result.duplicates} duplicates skipped)`;
            }
            addToast(msg, 'success');

            if (result.errors && result.errors.length > 0) {
                // Warning toast for partial success if any (though we usually fail on validation)
                addToast(
                    `Warnings: ${result.errors.length} rows failed validation`,
                    'warning',
                );
            }
            fetchData();
        } catch (error) {
            throw error; // Let modal handle error display
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight gradient-text-university">
                        Students
                    </h2>
                    <p className="text-muted-foreground">
                        Manage student records and details
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setIsImportModalOpen(true)}
                    >
                        <FileSpreadsheet className="mr-2 h-4 w-4" /> Import
                        Excel
                    </Button>
                    <Button
                        onClick={() => {
                            setEditingStudent(null);
                            setIsModalOpen(true);
                        }}
                        className="gradient-university text-white"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Add Student
                    </Button>
                </div>
            </div>

            <Card className="shadow-premium border-0">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Search className="h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, roll no, or batch..."
                            className="max-w-md border-2"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Batch</TableHead>
                                <TableHead>Section</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="text-center py-8"
                                    >
                                        <div className="flex justify-center items-center gap-2 text-muted-foreground">
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Loading students...
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredStudents.length > 0 ? (
                                filteredStudents.map((student) => (
                                    <TableRow
                                        key={student.id}
                                        className="hover:bg-muted/50"
                                    >
                                        <TableCell className="font-mono text-xs text-muted-foreground">
                                            {student.studentId}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {student.name}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {student.batch}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">
                                                {student.section}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{student.email}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        setEditingStudent(
                                                            student,
                                                        );
                                                        setIsModalOpen(true);
                                                    }}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive"
                                                    onClick={() =>
                                                        handleDelete(student.id)
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="text-center py-8 text-muted-foreground"
                                    >
                                        No students found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingStudent ? 'Edit Student' : 'Add Student'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Name</label>
                            <Input
                                name="name"
                                defaultValue={editingStudent?.name}
                                required
                                placeholder="Full Name"
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">
                                Student ID
                            </label>
                            <Input
                                name="studentId"
                                defaultValue={editingStudent?.studentId}
                                required
                                placeholder="S12345"
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-medium">
                            Department
                        </label>
                        <select
                            name="departmentId"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3"
                            defaultValue={editingStudent?.departmentId}
                        >
                            {departments.map((d) => (
                                <option key={d.id} value={d.id}>
                                    {d.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Batch</label>
                            <Input
                                name="batch"
                                defaultValue={editingStudent?.batch || '50'}
                                required
                                placeholder="50"
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">
                                Section
                            </label>
                            <select
                                name="section"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3"
                                defaultValue={editingStudent?.section || 'A'}
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
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Email</label>
                        <Input
                            name="email"
                            type="email"
                            defaultValue={editingStudent?.email}
                            required
                            placeholder="Email"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={submitting}
                            className="gradient-university text-white"
                        >
                            {submitting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : editingStudent ? (
                                'Update'
                            ) : (
                                'Save'
                            )}
                        </Button>
                    </div>
                </form>
            </Modal>

            <StudentImportModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onImport={handleImport}
            />
        </div>
    );
}
