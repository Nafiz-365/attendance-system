'use client';

import { useState, useEffect } from 'react';
import { AllocationsModal } from '@/components/allocations-modal';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Loader2,
    Mail,
    Phone,
    Hash,
    BookOpen,
    FileSpreadsheet,
} from 'lucide-react';
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
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';

import { TeacherImportModal } from '@/components/teacher-import-modal';

interface Teacher {
    id: number;
    name: string;
    employeeId: string;
    email: string;
    phone?: string;
    departmentId: number;
    department?: {
        code: string;
        name: string;
    };
}

interface Department {
    id: number;
    name: string;
    code: string;
}

export default function TeachersPage() {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
    const [allocatingTeacher, setAllocatingTeacher] = useState<Teacher | null>(
        null
    );
    const [submitting, setSubmitting] = useState(false);
    const { addToast } = useToast();

    // ... (fetchData and filters remain same)

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [teachersRes, deptsRes] = await Promise.all([
                fetch('/api/teachers'),
                fetch('/api/departments'),
            ]);

            if (teachersRes.ok) {
                const data = await teachersRes.json();
                setTeachers(data);
            }
            if (deptsRes.ok) {
                const data = await deptsRes.json();
                setDepartments(data);
            }
        } catch (error) {
            console.error(error);
            addToast('Failed to fetch data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const filteredTeachers = teachers.filter(
        (teacher) =>
            teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            teacher.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);

        const payload = {
            name: formData.get('name'),
            employeeId: formData.get('employeeId'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            departmentId: parseInt(formData.get('departmentId') as string),
            password: formData.get('password')
                ? formData.get('password')
                : undefined, // Send if provided
        };

        try {
            const url = editingTeacher
                ? `/api/teachers/${editingTeacher.id}`
                : '/api/teachers';
            const method = editingTeacher ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Operation failed');
            }

            addToast(
                editingTeacher ? 'Teacher updated' : 'Teacher added',
                'success'
            );
            fetchData();
            setIsModalOpen(false);
        } catch (error: unknown) {
            const message =
                error instanceof Error ? error.message : 'An error occurred';
            addToast(message, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleImport = async (data: any[]) => {
        try {
            const res = await fetch('/api/teachers/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ teachers: data }),
            });

            const result = await res.json();

            if (!res.ok) {
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

            let msg = `Successfully imported ${result.count} teachers`;
            if (result.duplicates > 0) {
                msg += ` (${result.duplicates} duplicates skipped)`;
            }
            addToast(msg, 'success');

            if (result.errors && result.errors.length > 0) {
                addToast(
                    `Warnings: ${result.errors.length} rows failed validation`,
                    'warning'
                );
            }
            fetchData();
        } catch (error: unknown) {
            const message =
                error instanceof Error ? error.message : 'Import error';
            console.error('Import error details:', message);
            throw error;
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this teacher?')) return;
        try {
            const res = await fetch(`/api/teachers/${id}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Delete failed');
            setTeachers(teachers.filter((t) => t.id !== id));
            addToast('Teacher deleted', 'success');
        } catch (error: unknown) {
            const message =
                error instanceof Error ? error.message : 'An error occurred';
            addToast(message, 'error');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header and Search ... */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight gradient-text-university">
                        Teachers
                    </h2>
                    <p className="text-muted-foreground">
                        Manage faculty members and staff
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
                            setEditingTeacher(null);
                            setIsModalOpen(true);
                        }}
                        className="gradient-university text-white"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Add Teacher
                    </Button>
                </div>
            </div>

            <Card className="shadow-premium border-0">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Search className="h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, email, or ID..."
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
                                <TableHead>Department</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Phone</TableHead>
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
                                        <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                                    </TableCell>
                                </TableRow>
                            ) : filteredTeachers.length > 0 ? (
                                filteredTeachers.map((teacher) => (
                                    <TableRow
                                        key={teacher.id}
                                        className="hover:bg-muted/50"
                                    >
                                        <TableCell className="font-mono text-xs text-muted-foreground">
                                            {teacher.employeeId}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {teacher.name}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {teacher.department?.code}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{teacher.email}</TableCell>
                                        <TableCell>
                                            {teacher.phone || '-'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    className="h-8 gap-1"
                                                    onClick={() =>
                                                        setAllocatingTeacher(
                                                            teacher
                                                        )
                                                    }
                                                >
                                                    <BookOpen className="h-3 w-3" />{' '}
                                                    Assign
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        setEditingTeacher(
                                                            teacher
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
                                                        handleDelete(teacher.id)
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
                                        No teachers found.
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
                title={editingTeacher ? 'Edit Teacher' : 'Add Teacher'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Name</label>
                            <Input
                                name="name"
                                defaultValue={editingTeacher?.name}
                                required
                                placeholder="Full Name"
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">
                                Employee ID
                            </label>
                            <Input
                                name="employeeId"
                                defaultValue={editingTeacher?.employeeId}
                                required
                                placeholder="T-101"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Email</label>
                            <Input
                                name="email"
                                type="email"
                                defaultValue={editingTeacher?.email}
                                required
                                placeholder="Email Address"
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Phone</label>
                            <Input
                                name="phone"
                                defaultValue={editingTeacher?.phone}
                                placeholder="Phone Number"
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
                            defaultValue={editingTeacher?.departmentId}
                        >
                            {departments.map((d) => (
                                <option key={d.id} value={d.id}>
                                    {d.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-medium">
                            Password{' '}
                            {editingTeacher && '(Leave blank to keep current)'}
                        </label>
                        <Input
                            name="password"
                            type="password"
                            placeholder={
                                editingTeacher
                                    ? 'New password (optional)'
                                    : 'Set login password'
                            }
                            required={!editingTeacher}
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
                            ) : editingTeacher ? (
                                'Update'
                            ) : (
                                'Save Teacher'
                            )}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Allocations Modal */}
            <AllocationsModal
                isOpen={!!allocatingTeacher}
                onClose={() => setAllocatingTeacher(null)}
                teacher={allocatingTeacher}
            />

            <TeacherImportModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onImport={handleImport}
            />
        </div>
    );
}
