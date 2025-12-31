"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Trash2, Plus, BookOpen } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";

interface AllocationsModalProps {
    isOpen: boolean;
    onClose: () => void;
    teacher: { id: number; name: string; departmentId: number } | null;
}

export function AllocationsModal({ isOpen, onClose, teacher }: AllocationsModalProps) {
    const [courses, setCourses] = useState<any[]>([]);
    const [sessions, setSessions] = useState<any[]>([]);
    const [allocations, setAllocations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const { addToast } = useToast();

    // Form State
    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedSession, setSelectedSession] = useState("");
    const [batch, setBatch] = useState("50");
    const [section, setSection] = useState("A");

    useEffect(() => {
        if (isOpen && teacher) {
            fetchData();
        }
    }, [isOpen, teacher]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [coursesRes, sessionsRes, allocationsRes] = await Promise.all([
                fetch('/api/courses'),
                fetch('/api/academic/sessions?active=true'),
                fetch('/api/academic/allocations') // Optimization: Filter by teacherId in API if possible, for now filtering client side or fetch all is ok for small scale
            ]);

            if (coursesRes.ok) setCourses(await coursesRes.json());
            if (sessionsRes.ok) {
                const sessionsData = await sessionsRes.json();
                setSessions(sessionsData);
                // Auto select active session
                const active = sessionsData.find((s: any) => s.isActive);
                if (active) setSelectedSession(active.id.toString());
            }

            if (allocationsRes.ok) {
                const allAllocations = await allocationsRes.json();
                // Filter for this teacher
                setAllocations(allAllocations.filter((a: any) => a.teacherId === teacher?.id));
            }

        } catch (error) {
            console.error(error);
            addToast("Failed to load data", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleAllocate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!teacher || !selectedCourse || !selectedSession) return;

        setSubmitting(true);
        try {
            const res = await fetch('/api/academic/allocations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    teacherId: teacher.id,
                    courseId: selectedCourse,
                    sessionId: selectedSession,
                    batch,
                    section
                })
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Failed to allocate");
            }

            const newAllocation = await res.json();
            setAllocations([newAllocation, ...allocations]);
            addToast("Course assigned successfully", "success");

            // Reset form partly
            // batch and section might remain same for convenience
        } catch (error: any) {
            addToast(error.message, "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Remove this course assignment?")) return;

        // Note: DELETE API might not exist yet based on my checks, assuming it does or I'll need to create it.
        // Wait, I didn't check for DELETE in allocations route. Let's assume standard REST, if fails I'll fix.
        // Actually, previous view of allocations route showed ONLY GET and POST.
        // So DELETE will fail. I will hide the delete button for now or implement it next. 
        // For now, I will NOT render the delete button to avoid broken UI.
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Assign Courses - ${teacher?.name}`}>
            <div className="space-y-6">
                {/* Allocation Form */}
                <form onSubmit={handleAllocate} className="bg-muted/30 p-4 rounded-lg space-y-4 border">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-medium">Session</label>
                            <select
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                                value={selectedSession}
                                onChange={(e) => setSelectedSession(e.target.value)}
                                required
                            >
                                <option value="">Select Session</option>
                                {sessions.map(s => (
                                    <option key={s.id} value={s.id}>{s.name} {s.isActive && '(Active)'}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium">Course</label>
                            <select
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                                value={selectedCourse}
                                onChange={(e) => setSelectedCourse(e.target.value)}
                                required
                            >
                                <option value="">Select Course</option>
                                {courses.map(c => (
                                    <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-medium">Batch</label>
                            <Input
                                value={batch}
                                onChange={(e) => setBatch(e.target.value)}
                                placeholder="50"
                                className="h-9"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium">Section</label>
                            <select
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                                value={section}
                                onChange={(e) => setSection(e.target.value)}
                            >
                                {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <Button type="submit" disabled={submitting} className="w-full h-9 gradient-university text-white">
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                        Assign Course
                    </Button>
                </form>

                {/* Existing Allocations List */}
                <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Current Assignments</h3>
                    <div className="max-h-[200px] overflow-y-auto space-y-2 border rounded-md p-2">
                        {loading ? (
                            <div className="flex justify-center p-4"><Loader2 className="animate-spin text-muted-foreground" /></div>
                        ) : allocations.length > 0 ? (
                            allocations.map((alloc) => (
                                <div key={alloc.id} className="flex items-center justify-between p-2 bg-card border rounded shadow-sm text-sm">
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="w-4 h-4 text-blue-500" />
                                        <div>
                                            <p className="font-medium">{alloc.course.code}</p>
                                            <p className="text-xs text-muted-foreground">Batch {alloc.batch}-{alloc.section} • {alloc.session.name}</p>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="text-[10px]">{alloc.course.credits} Cr</Badge>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-xs text-muted-foreground py-4">No courses assigned yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
}
