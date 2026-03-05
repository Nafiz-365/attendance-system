'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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

const DAYS = [
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
    'SUNDAY',
];

interface Routine {
    id: number;
    allocationId: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    roomNo: string;
    allocation: {
        course: {
            code: string;
        };
        teacher: {
            name: string;
        };
    };
}

interface Session {
    id: number;
    name: string;
    isActive: boolean;
}

interface Allocation {
    id: string;
    batch: string;
    section: string;
    course: {
        code: string;
    };
    teacher: {
        name: string;
    };
}

export default function TimetablePage() {
    const [routines, setRoutines] = useState<Routine[]>([]);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [allocations, setAllocations] = useState<Allocation[]>([]);

    // Filters
    const [selectedSession, setSelectedSession] = useState('');
    const [batch, setBatch] = useState('');
    const [section, setSection] = useState('');

    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        allocationId: '',
        dayOfWeek: 'MONDAY',
        startTime: '',
        endTime: '',
        roomNo: '',
    });

    const { addToast } = useToast();

    // 1. Fetch Sessions on load
    useEffect(() => {
        fetch('/api/academic/sessions')
            .then((res) => res.json())
            .then((data: Session[]) => {
                setSessions(data);
                const active = data.find((s: Session) => s.isActive);
                if (active) setSelectedSession(active.id.toString());
                else if (data.length > 0)
                    setSelectedSession(data[0].id.toString());
            });
    }, []);

    // 2. Fetch Allocations (Subjects available for this batch)
    useEffect(() => {
        if (selectedSession && batch && section) {
            const fetchAllocations = async () => {
                try {
                    // We need a way to filter allocations by batch/section in the API
                    // Currently getting all for session, then filtering client side or adding API param
                    // Let's rely on basic list for now
                    const res = await fetch(
                        `/api/academic/allocations?sessionId=${selectedSession}`
                    );
                    if (res.ok) {
                        const all = await res.json();
                        // Client-side filter for now
                        const filtered = all.filter(
                            (a: Allocation) =>
                                a.batch === batch && a.section === section
                        );
                        setAllocations(filtered);
                    }
                } catch (error) {
                    console.error(error);
                }
            };

            const fetchRoutines = async () => {
                try {
                    const res = await fetch(
                        `/api/academic/routines?sessionId=${selectedSession}&batch=${batch}&section=${section}`
                    );
                    if (res.ok) {
                        setRoutines(await res.json());
                    }
                } catch (error) {
                    console.error(error);
                }
            };

            fetchAllocations();
            fetchRoutines();
        }
    }, [selectedSession, batch, section]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/academic/routines', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                addToast('Class scheduled successfully', 'success');
                setOpen(false);
                // Refetch routines
                const routinesRes = await fetch(
                    `/api/academic/routines?sessionId=${selectedSession}&batch=${batch}&section=${section}`
                );
                if (routinesRes.ok) {
                    setRoutines(await routinesRes.json());
                }
                setFormData({ ...formData, startTime: '', endTime: '' }); // keep day/room/subject for easy entry
            } else {
                addToast('Failed to schedule class', 'error');
            }
        } catch (err) {
            console.error(err);
            addToast('An error occurred', 'error');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure?')) return;
        try {
            await fetch(`/api/academic/routines?id=${id}`, {
                method: 'DELETE',
            });
            // Refetch routines
            const routinesRes = await fetch(
                `/api/academic/routines?sessionId=${selectedSession}&batch=${batch}&section=${section}`
            );
            if (routinesRes.ok) {
                setRoutines(await routinesRes.json());
            }
            addToast('Removed', 'success');
        } catch (err) {
            console.error(err);
            addToast('Failed', 'error');
        }
    };

    // Group routines by Day
    const groupedRoutines: Record<string, Routine[]> = {};
    DAYS.forEach((day) => (groupedRoutines[day] = []));
    routines.forEach((r) => {
        if (groupedRoutines[r.dayOfWeek]) groupedRoutines[r.dayOfWeek].push(r);
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">
                        Timetable Management
                    </h2>
                    <p className="text-muted-foreground">
                        Manage class routines for batches.
                    </p>
                </div>
            </div>

            {/* Filter Bar */}
            <Card>
                <CardContent className="pt-6 flex flex-wrap gap-4 items-end">
                    <div className="space-y-2 w-48">
                        <Label>Session</Label>
                        <Select
                            value={selectedSession}
                            onChange={(e) => setSelectedSession(e.target.value)}
                        >
                            {sessions.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                        </Select>
                    </div>
                    <div className="space-y-2 w-32">
                        <Label>Batch</Label>
                        <Input
                            placeholder="Batch 50"
                            value={batch}
                            onChange={(e) => setBatch(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2 w-24">
                        <Label>Section</Label>
                        <Input
                            placeholder="A"
                            value={section}
                            onChange={(e) => setSection(e.target.value)}
                        />
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => {
                            if (selectedSession && batch && section) {
                                fetch(
                                    `/api/academic/allocations?sessionId=${selectedSession}`
                                )
                                    .then((res) => res.json())
                                    .then((all) => {
                                        const filtered = all.filter(
                                            (a: Allocation) =>
                                                a.batch === batch &&
                                                a.section === section
                                        );
                                        setAllocations(filtered);
                                    });

                                fetch(
                                    `/api/academic/routines?sessionId=${selectedSession}&batch=${batch}&section=${section}`
                                )
                                    .then((res) => res.json())
                                    .then((data) => setRoutines(data));
                            }
                        }}
                    >
                        Load Timetable
                    </Button>
                </CardContent>
            </Card>

            {batch && section && (
                <div className="flex justify-end">
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button disabled={allocations.length === 0}>
                                <Plus className="mr-2 h-4 w-4" /> Add Class Slot
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Class Slot</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Subject (Allocation)</Label>
                                    <Select
                                        value={formData.allocationId}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                allocationId: e.target.value,
                                            })
                                        }
                                        required
                                    >
                                        <option value="" disabled>
                                            Select Subject
                                        </option>
                                        {allocations.map((a) => (
                                            <option key={a.id} value={a.id}>
                                                {a.course.code} (
                                                {a.teacher.name})
                                            </option>
                                        ))}
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Day</Label>
                                        <Select
                                            value={formData.dayOfWeek}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    dayOfWeek: e.target.value,
                                                })
                                            }
                                            required
                                        >
                                            {DAYS.map((d) => (
                                                <option key={d} value={d}>
                                                    {d}
                                                </option>
                                            ))}
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Room No</Label>
                                        <Input
                                            value={formData.roomNo}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    roomNo: e.target.value,
                                                })
                                            }
                                            placeholder="Room 101"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Start Time</Label>
                                        <Input
                                            type="time"
                                            value={formData.startTime}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    startTime: e.target.value,
                                                })
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>End Time</Label>
                                        <Input
                                            type="time"
                                            value={formData.endTime}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    endTime: e.target.value,
                                                })
                                            }
                                            required
                                        />
                                    </div>
                                </div>
                                <Button type="submit" className="w-full">
                                    Save Slot
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            )}

            {/* Timetable Grid */}
            <div className="grid gap-6">
                {DAYS.map((day) => (
                    <div key={day} className="border rounded-lg p-4 bg-card">
                        <h3 className="font-semibold mb-4 text-primary">
                            {day}
                        </h3>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {groupedRoutines[day]?.length === 0 && (
                                <div className="text-sm text-muted-foreground italic">
                                    No classes scheduled
                                </div>
                            )}
                            {groupedRoutines[day]?.map((routine) => (
                                <div
                                    key={routine.id}
                                    className="flex items-center justify-between p-3 border rounded-md bg-background shadow-sm hover:shadow-md transition-all"
                                >
                                    <div>
                                        <div className="font-medium text-lg">
                                            {routine.allocation.course.code}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {routine.allocation.teacher.name}
                                        </div>
                                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />{' '}
                                                {routine.startTime} -{' '}
                                                {routine.endTime}
                                            </div>
                                            {routine.roomNo && (
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" />{' '}
                                                    {routine.roomNo}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive"
                                        onClick={() => handleDelete(routine.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
