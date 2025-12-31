"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Loader2, Plus, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";

interface AcademicSession {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
    _count?: {
        allocations: number;
    };
}

export default function AcademicSessionsPage() {
    const [sessions, setSessions] = useState<AcademicSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        startDate: "",
        endDate: "",
        isActive: false
    });
    const { addToast } = useToast();

    const fetchSessions = async () => {
        try {
            const res = await fetch("/api/academic/sessions");
            if (res.ok) {
                const data = await res.json();
                setSessions(data);
            }
        } catch (error) {
            console.error(error);
            addToast("Failed to fetch sessions", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/academic/sessions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                addToast("Session created successfully", "success");
                setOpen(false);
                fetchSessions();
                setFormData({ name: "", startDate: "", endDate: "", isActive: false });
            } else {
                addToast("Failed to create session", "error");
            }
        } catch (error) {
            addToast("An error occurred", "error");
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Academic Sessions</h2>
                    <p className="text-muted-foreground">Manage academic years and terms.</p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> New Session
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Academic Session</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Session Name</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g. Spring 2024"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="startDate">Start Date</Label>
                                    <Input
                                        id="startDate"
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="endDate">End Date</Label>
                                    <Input
                                        id="endDate"
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="w-full">Create Session</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {sessions.map((session) => (
                    <Card key={session.id} className="hover-lift glass">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <CardTitle>{session.name}</CardTitle>
                                {session.isActive && <Badge>Active</Badge>}
                            </div>
                            <CardDescription>
                                {format(new Date(session.startDate), "MMM yyyy")} - {format(new Date(session.endDate), "MMM yyyy")}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    <span>{session._count?.allocations || 0} allocations</span>
                                </div>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={async () => {
                                        if (confirm("Are you sure? This will delete all allocations checking this session!")) {
                                            try {
                                                const res = await fetch(`/api/academic/sessions?id=${session.id}`, { method: 'DELETE' });
                                                if (res.ok) {
                                                    addToast("Session deleted", "success");
                                                    fetchSessions();
                                                } else {
                                                    addToast("Failed to delete", "error");
                                                }
                                            } catch (e) {
                                                addToast("Error deleting session", "error");
                                            }
                                        }
                                    }}
                                >
                                    Delete
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
