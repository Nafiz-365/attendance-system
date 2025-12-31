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
import {
    Loader2,
    Plus,
    Calendar,
    Trash2,
    CheckCircle,
    XCircle,
} from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface Session {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
}

export default function SettingsPage() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const { addToast } = useToast();

    // Form State
    const [name, setName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const res = await fetch('/api/academic/sessions');
            if (res.ok) {
                setSessions(await res.json());
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch('/api/academic/sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    startDate,
                    endDate,
                    isActive: false,
                }),
            });

            if (!res.ok) throw new Error('Failed to create session');

            addToast('Session created successfully', 'success');
            setName('');
            setStartDate('');
            setEndDate('');
            fetchSessions();
        } catch (error: unknown) {
            const message =
                error instanceof Error ? error.message : 'An error occurred';
            addToast(message, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const toggleActive = async (id: number, currentState: boolean) => {
        if (currentState) return; // Already active, cannot toggle off without activating another (or implement logic)

        try {
            const res = await fetch('/api/academic/sessions', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, isActive: true }),
            });

            if (!res.ok) throw new Error('Failed to activate session');

            addToast('Session activated (others deactivated)', 'success');
            fetchSessions();
        } catch (error: unknown) {
            const message =
                error instanceof Error ? error.message : 'An error occurred';
            addToast(message, 'error');
        }
    };

    const handleDelete = async (id: number) => {
        if (
            !confirm(
                'Delete this session? This will affect all associated allocations.'
            )
        )
            return;

        try {
            const res = await fetch(`/api/academic/sessions?id=${id}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Failed to delete');

            setSessions(sessions.filter((s) => s.id !== id));
            addToast('Session deleted', 'success');
        } catch (error: unknown) {
            const message =
                error instanceof Error ? error.message : 'An error occurred';
            addToast(message, 'error');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h2 className="text-3xl font-bold tracking-tight gradient-text-university">
                    System Settings
                </h2>
                <p className="text-muted-foreground">
                    Manage academic sessions and global configurations
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Create Session Card */}
                <Card className="shadow-premium border-0 h-fit">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Plus className="w-5 h-5 text-primary" /> Create New
                            Session
                        </CardTitle>
                        <CardDescription>
                            Add a new academic period (e.g. Spring 2024)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Session Name
                                </label>
                                <Input
                                    placeholder="e.g. Fall 2025"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Start Date
                                    </label>
                                    <Input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) =>
                                            setStartDate(e.target.value)
                                        }
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        End Date
                                    </label>
                                    <Input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) =>
                                            setEndDate(e.target.value)
                                        }
                                        required
                                    />
                                </div>
                            </div>
                            <Button
                                type="submit"
                                disabled={submitting}
                                className="w-full gradient-university text-white"
                            >
                                {submitting ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    'Create Session'
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Session List Card */}
                <Card className="shadow-premium border-0">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-blue-500" />{' '}
                            Academic Sessions
                        </CardTitle>
                        <CardDescription>
                            Manage active and past sessions
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="animate-spin text-muted-foreground" />
                                </div>
                            ) : sessions.length > 0 ? (
                                sessions.map((session) => (
                                    <div
                                        key={session.id}
                                        className={`flex items-center justify-between p-3 rounded-lg border ${
                                            session.isActive
                                                ? 'bg-primary/5 border-primary/20'
                                                : 'bg-card'
                                        }`}
                                    >
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold">
                                                    {session.name}
                                                </span>
                                                {session.isActive && (
                                                    <Badge className="bg-green-500 text-white text-[10px]">
                                                        Active
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {format(
                                                    new Date(session.startDate),
                                                    'MMM d, yyyy'
                                                )}{' '}
                                                -{' '}
                                                {format(
                                                    new Date(session.endDate),
                                                    'MMM d, yyyy'
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {!session.isActive && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 text-xs"
                                                    onClick={() =>
                                                        toggleActive(
                                                            session.id,
                                                            false
                                                        )
                                                    }
                                                >
                                                    Activate
                                                </Button>
                                            )}
                                            {session.isActive && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 text-xs text-green-600 cursor-default hover:bg-transparent"
                                                    disabled
                                                >
                                                    <CheckCircle className="w-4 h-4 mr-1" />{' '}
                                                    Selected
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive"
                                                onClick={() =>
                                                    handleDelete(session.id)
                                                }
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-muted-foreground py-8">
                                    No sessions found.
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
