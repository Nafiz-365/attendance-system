"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Plus, Clock, CheckCircle, XCircle, Loader2, Calendar } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { format } from "date-fns";

export default function TeacherLeavesPage() {
    const [leaves, setLeaves] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'MY' | 'STUDENT'>('MY');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const { addToast } = useToast();

    useEffect(() => {
        fetchLeaves();
    }, []);

    const fetchLeaves = async () => {
        try {
            const res = await fetch('/api/leaves');
            if (res.ok) {
                const data = await res.json();
                setLeaves(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: number, status: "APPROVED" | "REJECTED") => {
        setUpdatingId(id);
        try {
            const res = await fetch(`/api/leaves/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status })
            });

            if (!res.ok) throw new Error("Failed to update status");

            addToast(`Leave ${status.toLowerCase()} successfully`, "success");
            fetchLeaves();
        } catch (error) {
            addToast("Something went wrong", "error");
        } finally {
            setUpdatingId(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);

        try {
            const res = await fetch('/api/leaves', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    startDate: formData.get('startDate'),
                    endDate: formData.get('endDate'),
                    reason: formData.get('reason'),
                })
            });

            if (!res.ok) throw new Error('Failed to apply');

            addToast("Leave request submitted", "success");
            fetchLeaves();
            setIsModalOpen(false);
        } catch (error) {
            addToast("Failed to submit request", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'APPROVED': return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>;
            case 'REJECTED': return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
            default: return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
        }
    };

    // Filter leaves
    const myLeaves = leaves.filter(l => l.teacherId); // Assuming current user is teacher
    // Actually, API returns *my* teacherId for my leaves. For students, teacherId is null.
    // Wait, if I am a teacher, my leaves have `teacherId`.
    // Student leaves have `studentId`. 
    // BUT caution: API returns `teacher` object relation.

    // Let's refine based on structure:
    const myRequests = leaves.filter(l => !!l.teacher);
    const studentRequests = leaves.filter(l => !!l.student);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight gradient-text-university">Leave Management</h2>
                    <p className="text-muted-foreground">Manage your leaves and student requests</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={activeTab === 'MY' ? 'default' : 'outline'}
                        onClick={() => setActiveTab('MY')}
                        className={activeTab === 'MY' ? 'gradient-university text-white' : ''}
                    >
                        My Leaves
                    </Button>
                    <Button
                        variant={activeTab === 'STUDENT' ? 'default' : 'outline'}
                        onClick={() => setActiveTab('STUDENT')}
                        className={activeTab === 'STUDENT' ? 'gradient-university text-white' : ''}
                    >
                        Student Requests
                        {studentRequests.filter(l => l.status === 'PENDING').length > 0 &&
                            <Badge variant="secondary" className="ml-2 bg-white/20">{studentRequests.filter(l => l.status === 'PENDING').length}</Badge>
                        }
                    </Button>
                </div>
            </div>

            {activeTab === 'MY' ? (
                <>
                    <div className="flex justify-end mb-4">
                        <Button onClick={() => setIsModalOpen(true)} className="gradient-university text-white">
                            <Plus className="mr-2 h-4 w-4" /> Apply for Leave
                        </Button>
                    </div>
                    <Card className="shadow-premium border-0">
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Applied On</TableHead>
                                        <TableHead>Duration</TableHead>
                                        <TableHead>Reason</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-8">
                                                <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                                            </TableCell>
                                        </TableRow>
                                    ) : myRequests.length > 0 ? (
                                        myRequests.map((leave) => (
                                            <TableRow key={leave.id}>
                                                <TableCell>{format(new Date(leave.createdAt), 'MMM d, yyyy')}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                                        {format(new Date(leave.startDate), 'MMM d')} - {format(new Date(leave.endDate), 'MMM d, yyyy')}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="max-w-md truncate" title={leave.reason}>{leave.reason}</TableCell>
                                                <TableCell>{getStatusBadge(leave.status)}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                                No leave requests found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </>
            ) : (
                // STUDENT REQUESTS TAB
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {studentRequests.length === 0 ? (
                        <Card className="col-span-full"><CardContent className="p-8 text-center text-muted-foreground">No student requests found.</CardContent></Card>
                    ) : (
                        studentRequests.map(leave => (
                            <Card key={leave.id} className="relative overflow-hidden border-orange-200 dark:border-orange-900/50">
                                <div className={`absolute top-0 left-0 w-1 h-full ${leave.status === 'APPROVED' ? 'bg-green-500' : leave.status === 'REJECTED' ? 'bg-red-500' : 'bg-orange-500'}`}></div>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base flex justify-between">
                                        <span>{leave.student?.name}</span>
                                        {getStatusBadge(leave.status)}
                                    </CardTitle>
                                    <div className="text-sm text-muted-foreground">
                                        {leave.student?.rollNo} • {leave.student?.batch}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="bg-muted p-2 rounded text-sm min-h-[60px]">
                                        <div className="font-medium text-xs text-muted-foreground mb-1">Reason:</div>
                                        {leave.reason}
                                    </div>
                                    <div className="text-sm flex justify-between items-center">
                                        <span className="font-semibold">{format(new Date(leave.startDate), "MMM d")} - {format(new Date(leave.endDate), "MMM d")}</span>
                                    </div>

                                    {leave.status === 'PENDING' && (
                                        <div className="flex gap-2 pt-2">
                                            <Button
                                                variant="outline"
                                                className="w-full border-green-200 hover:bg-green-50 hover:text-green-700"
                                                onClick={() => handleUpdateStatus(leave.id, "APPROVED")}
                                                disabled={updatingId === leave.id}
                                            >
                                                {updatingId === leave.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                                                Approve
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="w-full border-red-200 hover:bg-red-50 hover:text-red-700"
                                                onClick={() => handleUpdateStatus(leave.id, "REJECTED")}
                                                disabled={updatingId === leave.id}
                                            >
                                                {updatingId === leave.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />}
                                                Reject
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Apply for Leave"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Start Date</label>
                            <Input name="startDate" type="date" required />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">End Date</label>
                            <Input name="endDate" type="date" required />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Reason</label>
                        <Textarea name="reason" placeholder="Please enable describing why you need leave..." required />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={submitting} className="gradient-university text-white">
                            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Application"}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
