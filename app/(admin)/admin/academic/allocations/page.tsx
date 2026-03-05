'use client';

import { useEffect, useState } from 'react';
import { Plus, User, Calendar, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/toast';
import { Badge } from '@/components/ui/badge';

interface Allocation {
    id: number;
    course: {
        code: string;
        name: string;
    };
    teacher: {
        name: string;
    };
    batch: string;
    section: string;
    session: {
        name: string;
    };
}

interface Session {
    id: number;
    name: string;
    isActive?: boolean;
}

interface Teacher {
    id: number;
    name: string;
    employeeId: string;
}

interface Course {
    id: number;
    code: string;
    name: string;
}

interface AllocationForm {
    teacherId: string;
    courseId: string;
    batch: string;
    sessionId?: string;
}

export default function SubjectAllocationsPage() {
    const [allocations, setAllocations] = useState<Allocation[]>([]);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);

    // Enhanced States
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSession, setSelectedSession] = useState('');

    // Form Data

    const [formData, setFormData] = useState<AllocationForm>({
        teacherId: '',
        courseId: '',
        batch: '',
        sessionId: '',
    });
    const [selectedSections, setSelectedSections] = useState<string[]>([]);

    const [creating, setCreating] = useState(false);

    const { addToast } = useToast();

    // Fetch Initial Data
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [sessionsRes, teachersRes, coursesRes] =
                    await Promise.all([
                        fetch('/api/academic/sessions'),
                        fetch('/api/teachers'),
                        fetch('/api/courses'),
                    ]);

                if (sessionsRes.ok) setSessions(await sessionsRes.json());
                if (teachersRes.ok) setTeachers(await teachersRes.json());
                if (coursesRes.ok) setCourses(await coursesRes.json());
            } catch (error) {
                console.error(error);
                addToast('Failed to fetch form data', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [addToast]);

    // Fetch Allocations when session changes
    useEffect(() => {
        if (!selectedSession && sessions.length > 0) {
            const active = sessions.find((s) => s.isActive);
            if (active) setSelectedSession(active.id.toString());
            else setSelectedSession(sessions[0].id.toString());
        }

        if (selectedSession) {
            fetchAllocations(selectedSession);
            setFormData((prev) => ({ ...prev, sessionId: selectedSession }));
        }
    }, [selectedSession, sessions]);

    const fetchAllocations = async (sessionId: string) => {
        try {
            const res = await fetch(
                `/api/academic/allocations?sessionId=${sessionId}`
            );
            if (res.ok) {
                setAllocations(await res.json());
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleSectionToggle = (section: string) => {
        setSelectedSections((prev) =>
            prev.includes(section)
                ? prev.filter((s) => s !== section)
                : [...prev, section]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedSections.length === 0) {
            addToast('Please select at least one section', 'error');
            return;
        }

        setCreating(true);
        try {
            let successCount = 0;
            const errors = [];

            // Loop through selected sections and create allocation for each
            for (const section of selectedSections) {
                const payload = {
                    ...formData,
                    section,
                    sessionId: selectedSession,
                };

                const res = await fetch('/api/academic/allocations', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });

                if (res.ok) {
                    successCount++;
                } else {
                    const err = await res.json();
                    errors.push(`${section}: ${err.error}`);
                }
            }

            if (successCount > 0) {
                addToast(
                    `Allocated ${successCount} sections successfully`,
                    'success'
                );
                setOpen(false);
                fetchAllocations(selectedSession);
                // Reset form
                setFormData({
                    ...formData,
                    teacherId: '',
                    courseId: '',
                    batch: '',
                });
                setSelectedSections([]);
            }

            if (errors.length > 0) {
                addToast(errors[0], 'error'); // Show first error
            }
        } catch (err) {
            console.error(err);
            addToast('An error occurred', 'error');
        }
        setCreating(false);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this allocation?'))
            return;

        try {
            const res = await fetch(`/api/academic/allocations?id=${id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                addToast('Allocation deleted', 'success');
                fetchAllocations(selectedSession);
                // Optimistic update
                setAllocations((prev) => prev.filter((a) => a.id !== id));
            } else {
                addToast('Failed to delete', 'error');
            }
        } catch (err) {
            console.error(err);
            addToast('Error deleting', 'error');
        }
    };

    const filteredAllocations = allocations.filter(
        (a) =>
            a.teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.course.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">
                        Subject Allocations
                    </h2>
                    <p className="text-muted-foreground">
                        Assign teachers to courses for specific batches.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Select
                        value={selectedSession}
                        onChange={(e) => setSelectedSession(e.target.value)}
                        className="w-[180px]"
                    >
                        <option value="" disabled>
                            Select Session
                        </option>
                        {sessions.map((s) => (
                            <option key={s.id} value={s.id.toString()}>
                                {s.name}
                            </option>
                        ))}
                    </Select>

                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> Allocate
                                Subject
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-xl">
                            <DialogHeader>
                                <DialogTitle>Allocate Subject</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Teacher</Label>
                                        <Select
                                            value={formData.teacherId}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    teacherId: e.target.value,
                                                })
                                            }
                                            required
                                        >
                                            <option value="" disabled>
                                                Select Teacher
                                            </option>
                                            {teachers.map((t) => (
                                                <option
                                                    key={t.id}
                                                    value={t.id.toString()}
                                                >
                                                    {t.name} ({t.employeeId})
                                                </option>
                                            ))}
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Course</Label>
                                        <Select
                                            value={formData.courseId}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    courseId: e.target.value,
                                                })
                                            }
                                            required
                                        >
                                            <option value="" disabled>
                                                Select Course
                                            </option>
                                            {courses.map((c) => (
                                                <option
                                                    key={c.id}
                                                    value={c.id.toString()}
                                                >
                                                    {c.code} - {c.name}
                                                </option>
                                            ))}
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Batch</Label>
                                    <Select
                                        value={formData.batch}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                batch: e.target.value,
                                            })
                                        }
                                        required
                                    >
                                        <option value="" disabled>
                                            Select Batch
                                        </option>
                                        {Array.from(
                                            { length: 11 },
                                            (_, i) => 50 + i
                                        ).map((batch) => (
                                            <option
                                                key={batch}
                                                value={`Batch ${batch}`}
                                            >
                                                Batch {batch}
                                            </option>
                                        ))}
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Sections (Select Multiple)</Label>
                                    <div className="flex flex-wrap gap-2">
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
                                        ].map((section) => (
                                            <div
                                                key={section}
                                                className={`
                                                    w-10 h-10 flex items-center justify-center rounded-md border cursor-pointer transition-colors font-medium
                                                    ${
                                                        selectedSections.includes(
                                                            section
                                                        )
                                                            ? 'bg-primary text-primary-foreground border-primary'
                                                            : 'hover:bg-muted'
                                                    }
                                                `}
                                                onClick={() =>
                                                    handleSectionToggle(section)
                                                }
                                            >
                                                {section}
                                            </div>
                                        ))}
                                    </div>
                                    {selectedSections.length === 0 && (
                                        <p className="text-xs text-destructive">
                                            At least one section required
                                        </p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={creating}
                                >
                                    {creating
                                        ? 'Allocating...'
                                        : `Allocate to ${selectedSections.length} Sections`}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by teacher or course..."
                    className="pl-9 w-full md:w-[300px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredAllocations.map((alloc) => (
                    <Card
                        key={alloc.id}
                        className="hover-lift glass group relative"
                    >
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleDelete(alloc.id)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-lg">
                                        {alloc.course.code}
                                    </CardTitle>
                                    <CardDescription>
                                        {alloc.course.name}
                                    </CardDescription>
                                </div>
                                <Badge variant="outline">
                                    {alloc.batch} - {alloc.section}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                                <User className="h-4 w-4 text-primary" />
                                <span className="font-medium">
                                    {alloc.teacher.name}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>{alloc.session.name}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {filteredAllocations.length === 0 && (
                    <div className="col-span-full text-center p-8 text-muted-foreground border rounded-lg border-dashed">
                        {allocations.length === 0
                            ? 'No subjects allocated for this session yet.'
                            : 'No matches found.'}
                    </div>
                )}
            </div>
        </div>
    );
}
