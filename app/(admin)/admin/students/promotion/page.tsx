'use client';

import { useState, useEffect } from 'react';
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Loader2, ArrowRight, Filter } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { Badge } from '@/components/ui/badge';

interface Student {
    id: number;
    name: string;
    studentId: string;
    batch: string;
    section: string;
    semester?: string;
}

export default function PromotionPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const { addToast } = useToast();

    // Filters
    const [filterBatch, setFilterBatch] = useState('');
    const [filterSection, setFilterSection] = useState('');

    // Selection
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    // Promotion Target
    const [newSemester, setNewSemester] = useState('');
    const [newSection, setNewSection] = useState(''); // Optional

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/students');
            if (res.ok) {
                setStudents(await res.json());
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = students.filter((s) => {
        const matchesBatch = filterBatch ? s.batch.includes(filterBatch) : true;
        const matchesSection = filterSection
            ? s.section === filterSection
            : true;
        return matchesBatch && matchesSection;
    });

    const toggleSelection = (id: number) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredStudents.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredStudents.map((s) => s.id));
        }
    };

    const handlePromote = async () => {
        if (!newSemester) {
            addToast('Please enter a new semester', 'error');
            return;
        }
        if (selectedIds.length === 0) {
            addToast('No students selected', 'error');
            return;
        }

        if (
            !confirm(
                `Promote ${selectedIds.length} students to ${newSemester}?`
            )
        )
            return;

        setSubmitting(true);
        try {
            const res = await fetch('/api/students/promote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentIds: selectedIds,
                    newSemester,
                    newSection: newSection || undefined,
                }),
            });

            if (!res.ok) throw new Error('Promotion failed');

            const data = await res.json();
            addToast(
                `Successfully promoted ${data.count} students!`,
                'success'
            );

            // Refresh data
            fetchStudents();
            setSelectedIds([]);
        } catch (error: Error | unknown) {
            const message =
                error instanceof Error ? error.message : 'An error occurred';
            addToast(message, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h2 className="text-3xl font-bold tracking-tight gradient-text-university">
                    Student Promotion
                </h2>
                <p className="text-muted-foreground">
                    Bulk promote students to the next semester
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left: Filter & List */}
                <Card className="flex-1 shadow-premium border-0">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="w-5 h-5 text-blue-500" /> Filter
                            & Select
                        </CardTitle>
                        <div className="flex gap-2 pt-2">
                            <Input
                                placeholder="Filter Batch (e.g. 50)"
                                value={filterBatch}
                                onChange={(e) => setFilterBatch(e.target.value)}
                                className="h-8 text-xs"
                            />
                            <select
                                className="h-8 w-24 rounded-md border text-xs px-2"
                                value={filterSection}
                                onChange={(e) =>
                                    setFilterSection(e.target.value)
                                }
                            >
                                <option value="">All Sec</option>
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
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px]">
                                            <input
                                                type="checkbox"
                                                checked={
                                                    filteredStudents.length >
                                                        0 &&
                                                    selectedIds.length ===
                                                        filteredStudents.length
                                                }
                                                onChange={toggleSelectAll}
                                                className="translate-y-[2px]"
                                            />
                                        </TableHead>
                                        <TableHead>Student</TableHead>
                                        <TableHead>Batch/Sec</TableHead>
                                        <TableHead>Current Sem</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={4}
                                                className="text-center py-8"
                                            >
                                                <Loader2 className="animate-spin h-5 w-5 mx-auto" />
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredStudents.length > 0 ? (
                                        filteredStudents.map((s) => (
                                            <TableRow
                                                key={s.id}
                                                className="text-xs"
                                            >
                                                <TableCell>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.includes(
                                                            s.id
                                                        )}
                                                        onChange={() =>
                                                            toggleSelection(
                                                                s.id
                                                            )
                                                        }
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">
                                                        {s.name}
                                                    </div>
                                                    <div className="text-muted-foreground text-[10px]">
                                                        {s.studentId}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {s.batch}-{s.section}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {s.semester || 'N/A'}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={4}
                                                className="text-center py-8"
                                            >
                                                No students found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                            {selectedIds.length} students selected
                        </div>
                    </CardContent>
                </Card>

                {/* Right: Action Panel */}
                <Card className="w-full lg:w-1/3 shadow-premium border-0 h-fit">
                    <CardHeader className="bg-primary/5">
                        <CardTitle className="text-primary flex items-center gap-2">
                            Target Semester
                        </CardTitle>
                        <CardDescription>
                            Where should the selected students go?
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                New Semester
                            </label>
                            <Input
                                placeholder="e.g. 2nd Semester"
                                value={newSemester}
                                onChange={(e) => setNewSemester(e.target.value)}
                                className="bg-background"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Change Section (Optional)
                            </label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3"
                                value={newSection}
                                onChange={(e) => setNewSection(e.target.value)}
                            >
                                <option value="">Keep Current Section</option>
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
                                        Move to Section {s}
                                    </option>
                                ))}
                            </select>
                            <p className="text-[10px] text-muted-foreground">
                                Leave empty to keep their current section.
                            </p>
                        </div>

                        <div className="pt-4">
                            <Button
                                onClick={handlePromote}
                                disabled={
                                    submitting ||
                                    selectedIds.length === 0 ||
                                    !newSemester
                                }
                                className="w-full gradient-university text-white"
                            >
                                {submitting ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        Promote Students{' '}
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
