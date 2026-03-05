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
import { useCourses } from '@/hooks/useCourses';
import { useDepartments } from '@/hooks/useDepartments';
import { CourseImportModal } from '@/components/course-import-modal';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    BookOpen,
    Award,
    Users,
    GraduationCap,
    Loader2,
    FileSpreadsheet,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';

export default function CoursesPage() {
    const { courses, loading, addCourse, updateCourse, deleteCourse, refresh } =
        useCourses();
    const { departments } = useDepartments(); // For the dropdown
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [filterDepartment, setFilterDepartment] = useState('all');
    const [editingCourse, setEditingCourse] = useState<{
        id: number;
        name: string;
        code: string;
        credits: number;
        departmentId: number;
        instructor: string;
    } | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const { addToast } = useToast();

    // ... (filteredCourses remains same)

    // ... (handleSubmit remains same)

    const filteredCourses = courses.filter((course) => {
        const matchesSearch =
            course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDepartment =
            filterDepartment === 'all' ||
            course.departmentId.toString() === filterDepartment;
        return matchesSearch && matchesDepartment;
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);

        const data = {
            name: formData.get('name') as string,
            code: formData.get('code') as string,
            credits: parseInt(formData.get('credits') as string) || 3,
            departmentId: parseInt(formData.get('departmentId') as string),
            instructor: formData.get('instructor') as string,
        };

        try {
            if (editingCourse) {
                await updateCourse(editingCourse.id, data);
            } else {
                await addCourse(data);
            }
            setIsModalOpen(false);
            setEditingCourse(null);
            form.reset();
        } catch (err) {
            console.error(err);
            // Error handled by hook
        } finally {
            setSubmitting(false);
        }
    };

    const handleImport = async (
        data: Array<{
            name: string;
            code: string;
            credits: number;
            departmentId: string | number;
            instructor: string;
        }>,
    ) => {
        try {
            const coursesData = data.map((course) => ({
                ...course,
                departmentId:
                    typeof course.departmentId === 'string'
                        ? parseInt(course.departmentId)
                        : course.departmentId,
            }));

            const res = await fetch('/api/courses/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ courses: coursesData }),
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

            let msg = `Successfully imported ${result.count} courses`;
            if (result.duplicates > 0) {
                msg += ` (${result.duplicates} duplicates skipped)`;
            }
            addToast(msg, 'success');

            if (result.errors && result.errors.length > 0) {
                addToast(
                    `Warnings: ${result.errors.length} rows failed validation`,
                    'warning',
                );
            }
            if (refresh) await refresh();
            else window.location.reload();
        } catch (err: unknown) {
            console.error('Import error details:', err);
            throw err;
        }
    };

    const handleEditClick = (course: {
        id: number;
        name: string;
        code: string;
        credits: number;
        departmentId: number;
        instructor: string;
    }) => {
        setEditingCourse(course);
        setIsModalOpen(true);
    };

    const handleAddClick = () => {
        setEditingCourse(null);
        setIsModalOpen(true);
    };

    const totalCredits = courses.reduce(
        (sum, course) => sum + course.credits,
        0,
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight gradient-text-university">
                        Courses
                    </h2>
                    <p className="text-muted-foreground">
                        Manage course catalog and assignments
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
                        onClick={handleAddClick}
                        className="gradient-university text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Add Course
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 border-0 hover-lift">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                                    Total Courses
                                </p>
                                <p className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">
                                    {courses.length}
                                </p>
                            </div>
                            <BookOpen className="h-10 w-10 text-indigo-500 opacity-80" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border-0 hover-lift">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                    Total Credits
                                </p>
                                <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">
                                    {totalCredits}
                                </p>
                            </div>
                            <Award className="h-10 w-10 text-emerald-500 opacity-80" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-950 dark:to-violet-900 border-0 hover-lift">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-violet-600 dark:text-violet-400">
                                    Departments
                                </p>
                                <p className="text-3xl font-bold text-violet-700 dark:text-violet-300">
                                    {departments.length}
                                </p>
                            </div>
                            <Users className="h-10 w-10 text-violet-500 opacity-80" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border-0 hover-lift">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                                    Avg. Credits
                                </p>
                                <p className="text-3xl font-bold text-amber-700 dark:text-amber-300">
                                    {courses.length > 0
                                        ? (
                                              totalCredits / courses.length
                                          ).toFixed(1)
                                        : 0}
                                </p>
                            </div>
                            <GraduationCap className="h-10 w-10 text-amber-500 opacity-80" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="shadow-premium border-0">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex items-center gap-2 flex-1">
                            <Search className="h-5 w-5 text-muted-foreground" />
                            <Input
                                placeholder="Search courses by name, code, or instructor..."
                                className="border-2"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select
                            value={filterDepartment}
                            onChange={(e) =>
                                setFilterDepartment(e.target.value)
                            }
                            className="w-full sm:w-64 border-2"
                        >
                            <option value="all">All Departments</option>
                            {departments.map((dept) => (
                                <option
                                    key={dept.id}
                                    value={dept.id.toString()}
                                >
                                    {dept.code}
                                </option>
                            ))}
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Course Code</TableHead>
                                <TableHead>Course Name</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Instructor</TableHead>
                                <TableHead className="text-center">
                                    Credits
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
                                        colSpan={6}
                                        className="text-center py-8"
                                    >
                                        <div className="flex justify-center items-center gap-2 text-muted-foreground">
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Loading courses...
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredCourses.length > 0 ? (
                                filteredCourses.map((course) => {
                                    const department = departments.find(
                                        (d) => d.id === course.departmentId,
                                    );
                                    return (
                                        <TableRow
                                            key={course.id}
                                            className="hover:bg-muted/50 transition-colors"
                                        >
                                            <TableCell className="font-mono font-bold text-primary">
                                                {course.code}
                                            </TableCell>
                                            <TableCell className="font-semibold">
                                                {course.name}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">
                                                    {department?.code || 'N/A'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {course.instructor}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="default">
                                                    {course.credits} Credits
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="hover:bg-primary/10"
                                                        onClick={() =>
                                                            handleEditClick(
                                                                course,
                                                            )
                                                        }
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-destructive hover:bg-destructive/10"
                                                        onClick={() =>
                                                            deleteCourse(
                                                                course.id,
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
                                        colSpan={6}
                                        className="text-center py-8 text-muted-foreground"
                                    >
                                        <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-20" />
                                        No courses found matching your search.
                                        Add one to get started.
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
                title={editingCourse ? 'Edit Course' : 'Add New Course'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-2">
                        <label htmlFor="name" className="text-sm font-medium">
                            Course Name
                        </label>
                        <Input
                            id="name"
                            name="name"
                            defaultValue={editingCourse?.name}
                            required
                            placeholder="Data Structures"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <label
                                htmlFor="code"
                                className="text-sm font-medium"
                            >
                                Course Code
                            </label>
                            <Input
                                id="code"
                                name="code"
                                defaultValue={editingCourse?.code}
                                required
                                placeholder="CS101"
                            />
                        </div>
                        <div className="grid gap-2">
                            <label
                                htmlFor="credits"
                                className="text-sm font-medium"
                            >
                                Credits
                            </label>
                            <Input
                                id="credits"
                                name="credits"
                                type="number"
                                defaultValue={editingCourse?.credits}
                                required
                                placeholder="3"
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <label
                            htmlFor="departmentId"
                            className="text-sm font-medium"
                        >
                            Department
                        </label>
                        <select
                            name="departmentId"
                            defaultValue={
                                editingCourse
                                    ? editingCourse.departmentId.toString()
                                    : undefined
                            }
                            required
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
                        >
                            <option value="" disabled>
                                Select Department
                            </option>
                            {departments.map((dept) => (
                                <option key={dept.id} value={dept.id}>
                                    {dept.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid gap-2">
                        <label
                            htmlFor="instructor"
                            className="text-sm font-medium"
                        >
                            Instructor
                        </label>
                        <Input
                            id="instructor"
                            name="instructor"
                            defaultValue={editingCourse?.instructor}
                            required
                            placeholder="Dr. Jane Smith"
                        />
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
                            ) : editingCourse ? (
                                'Update'
                            ) : (
                                'Create'
                            )}
                        </Button>
                    </div>
                </form>
            </Modal>

            <CourseImportModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onImport={handleImport}
            />
        </div>
    );
}
