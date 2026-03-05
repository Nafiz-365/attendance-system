'use client';

import { useState } from 'react';
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
import { useDepartments } from '@/hooks/useDepartments';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Users,
    TrendingUp,
    Building2,
    UserCheck,
    Loader2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';

export default function DepartmentsPage() {
    const {
        departments,
        loading,
        addDepartment,
        updateDepartment,
        deleteDepartment,
    } = useDepartments();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDept, setEditingDept] = useState<{
        id: string;
        name: string;
        code: string;
        hod: string;
        totalStudents?: number;
        activeStudents?: number;
    } | null>(null); // Track editing state
    const [submitting, setSubmitting] = useState(false);

    const filteredDepartments = departments.filter(
        (dept) =>
            dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            dept.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            dept.hod.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);

        try {
            if (editingDept) {
                await updateDepartment(Number(editingDept.id), {
                    name: formData.get('name') as string,
                    code: formData.get('code') as string,
                    hod: formData.get('hod') as string,
                });
            } else {
                await addDepartment({
                    name: formData.get('name') as string,
                    code: formData.get('code') as string,
                    hod: formData.get('hod') as string,
                    totalStudents: 0,
                    activeStudents: 0,
                });
            }
            setIsModalOpen(false);
            form.reset();
        } catch (err) {
            console.error(err);
            // Toast handled in hook
        } finally {
            setSubmitting(false);
        }
    };

    const totalStudents = departments.reduce(
        (sum, dept) => sum + (dept.totalStudents || 0),
        0
    );
    const activeStudents = departments.reduce(
        (sum, dept) => sum + (dept.activeStudents || 0),
        0
    );
    const attendanceRate =
        totalStudents > 0
            ? Math.round((activeStudents / totalStudents) * 100)
            : 0;

    const handleEditClick = (dept: {
        id: string;
        name: string;
        code: string;
        hod: string;
        totalStudents?: number;
        activeStudents?: number;
    }) => {
        setEditingDept(dept);
        setIsModalOpen(true);
    };

    const handleAddClick = () => {
        setEditingDept(null);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight gradient-text-university">
                        Departments
                    </h2>
                    <p className="text-muted-foreground">
                        Manage university departments and their details
                    </p>
                </div>
                <Button
                    onClick={handleAddClick}
                    className="gradient-university text-white shadow-lg hover:opacity-90"
                >
                    <Plus className="mr-2 h-4 w-4" /> Add Department
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-0 hover-lift">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                    Total Departments
                                </p>
                                <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                                    {departments.length}
                                </p>
                            </div>
                            <Building2 className="h-10 w-10 text-blue-500 opacity-80" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-0 hover-lift">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-600 dark:text-green-400">
                                    Total Students
                                </p>
                                <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                                    {totalStudents}
                                </p>
                            </div>
                            <Users className="h-10 w-10 text-green-500 opacity-80" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-0 hover-lift">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                                    Active Students
                                </p>
                                <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                                    {activeStudents}
                                </p>
                            </div>
                            <UserCheck className="h-10 w-10 text-purple-500 opacity-80" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-0 hover-lift">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                                    Avg. Attendance
                                </p>
                                <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">
                                    {attendanceRate}%
                                </p>
                            </div>
                            <TrendingUp className="h-10 w-10 text-orange-500 opacity-80" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="shadow-premium border-0">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Search className="h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Search departments by name, code, or HOD..."
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
                                <TableHead>Code</TableHead>
                                <TableHead>Department Name</TableHead>
                                <TableHead>Head of Department</TableHead>
                                <TableHead className="text-center">
                                    Total Students
                                </TableHead>
                                <TableHead className="text-center">
                                    Active Students
                                </TableHead>
                                <TableHead className="text-center">
                                    Status
                                </TableHead>
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="text-center py-8"
                                    >
                                        <div className="flex justify-center items-center gap-2 text-muted-foreground">
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Loading departments...
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredDepartments.length > 0 ? (
                                filteredDepartments.map((dept) => {
                                    const deptAttendance =
                                        (dept.totalStudents || 0) > 0
                                            ? Math.round(
                                                  ((dept.activeStudents || 0) /
                                                      dept.totalStudents) *
                                                      100
                                              )
                                            : 0;
                                    return (
                                        <TableRow
                                            key={dept.id}
                                            className="hover:bg-muted/50 transition-colors"
                                        >
                                            <TableCell className="font-mono font-bold text-primary">
                                                {dept.code}
                                            </TableCell>
                                            <TableCell className="font-semibold">
                                                {dept.name}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {dept.hod}
                                            </TableCell>
                                            <TableCell className="text-center font-medium">
                                                {dept.totalStudents || 0}
                                            </TableCell>
                                            <TableCell className="text-center font-medium text-green-600">
                                                {dept.activeStudents || 0}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge
                                                    variant={
                                                        deptAttendance >= 80
                                                            ? 'default'
                                                            : deptAttendance >=
                                                              60
                                                            ? 'secondary'
                                                            : 'destructive'
                                                    }
                                                >
                                                    {deptAttendance}% Active
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="hover:bg-primary/10"
                                                        onClick={() =>
                                                            handleEditClick({
                                                                ...dept,
                                                                id: dept.id.toString(),
                                                            })
                                                        }
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-destructive hover:bg-destructive/10"
                                                        onClick={() =>
                                                            deleteDepartment(
                                                                dept.id
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="text-center py-8 text-muted-foreground"
                                    >
                                        <Building2 className="h-12 w-12 mx-auto mb-2 opacity-20" />
                                        No departments found. Add one to get
                                        started.
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
                title={editingDept ? 'Edit Department' : 'Add New Department'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-2">
                        <label htmlFor="name" className="text-sm font-medium">
                            Department Name
                        </label>
                        <Input
                            id="name"
                            name="name"
                            defaultValue={editingDept?.name}
                            required
                            placeholder="Computer Science & Engineering"
                            className="focus-visible:ring-indigo-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <label
                                htmlFor="code"
                                className="text-sm font-medium"
                            >
                                Department Code
                            </label>
                            <Input
                                id="code"
                                name="code"
                                defaultValue={editingDept?.code}
                                required
                                placeholder="CSE"
                            />
                        </div>
                        <div className="grid gap-2">
                            <label
                                htmlFor="hod"
                                className="text-sm font-medium"
                            >
                                Head of Department
                            </label>
                            <Input
                                id="hod"
                                name="hod"
                                defaultValue={editingDept?.hod}
                                required
                                placeholder="Dr. Sarah Williams"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsModalOpen(false)}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={submitting}
                            className="gradient-university text-white min-w-[100px]"
                        >
                            {submitting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : editingDept ? (
                                'Update'
                            ) : (
                                'Create'
                            )}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
