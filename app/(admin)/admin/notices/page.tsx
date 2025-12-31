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
import { Textarea } from '@/components/ui/textarea'; // Assuming text area exists or use Input for now
import { Loader2, Send, History, Bell, Megaphone } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface Notice {
    id: string;
    title: string;
    content: string;
    audience: string;
    createdAt: string;
}

export default function NoticesPage() {
    const [notices, setNotices] = useState<Notice[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const { addToast } = useToast();

    // Form
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [audience, setAudience] = useState('ALL');

    useEffect(() => {
        fetchNotices();
    }, []);

    const fetchNotices = async () => {
        try {
            const res = await fetch('/api/notices');
            if (res.ok) {
                setNotices(await res.json());
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch('/api/notices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content, audience }),
            });

            if (!res.ok) throw new Error('Failed to send notice');

            addToast('Notice sent successfully', 'success');
            setTitle('');
            setContent('');
            fetchNotices();
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Failed to send notice';
            addToast(message, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h2 className="text-3xl font-bold tracking-tight gradient-text-university">
                    Broadcast Notices
                </h2>
                <p className="text-muted-foreground">
                    Send announcements to teachers and students
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Send Notice Form */}
                <Card className="shadow-premium border-0 h-fit">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Send className="w-5 h-5 text-primary" /> Send New
                            Notice
                        </CardTitle>
                        <CardDescription>
                            Compose a message to broadcast
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSend} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Title
                                </label>
                                <Input
                                    placeholder="e.g. Exam Schedule Released"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Audience
                                </label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3"
                                    value={audience}
                                    onChange={(e) =>
                                        setAudience(e.target.value)
                                    }
                                >
                                    <option value="ALL">
                                        Everyone (Teachers & Students)
                                    </option>
                                    <option value="TEACHERS">
                                        Teachers Only
                                    </option>
                                    <option value="STUDENTS">
                                        Students Only
                                    </option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Message Content
                                </label>
                                <textarea
                                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Write your announcement here..."
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    required
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={submitting}
                                className="w-full gradient-university text-white"
                            >
                                {submitting ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        <Megaphone className="w-4 h-4 mr-2" />{' '}
                                        Broadcast Now
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* History */}
                <Card className="shadow-premium border-0">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <History className="w-5 h-5 text-blue-500" /> Recent
                            Notices
                        </CardTitle>
                        <CardDescription>
                            History of sent announcements
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="animate-spin text-muted-foreground" />
                                </div>
                            ) : notices.length > 0 ? (
                                notices.map((notice) => (
                                    <div
                                        key={notice.id}
                                        className="p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors space-y-2"
                                    >
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-semibold text-sm">
                                                {notice.title}
                                            </h4>
                                            <Badge
                                                variant="secondary"
                                                className="text-[10px]"
                                            >
                                                {notice.audience}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                            {notice.content}
                                        </p>
                                        <div className="flex items-center justify-end text-[10px] text-muted-foreground gap-1">
                                            <Bell className="w-3 h-3" />{' '}
                                            {format(
                                                new Date(notice.createdAt),
                                                'MMM d, h:mm a'
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-muted-foreground py-8">
                                    No notices sent yet.
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
