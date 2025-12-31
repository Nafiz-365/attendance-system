"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Calendar, Clock } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { format } from "date-fns";

interface LeaveRequest {
    id: number;
    startDate: string;
    endDate: string;
    reason: string;
    status: string;
    createdAt: string;
}

export default function StudentLeavesPage() {
    const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const { addToast } = useToast();

    // Form state
    const [formData, setFormData] = useState({
        startDate: "",
        endDate: "",
        reason: ""
    });

    useEffect(() => {
        fetchLeaves();
    }, []);

    const fetchLeaves = async () => {
        try {
            const res = await fetch("/api/leaves");
            if (res.ok) {
                const data = await res.json();
                setLeaves(data);
            }
        } catch (error) {
            console.error("Failed to fetch leaves", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const res = await fetch("/api/leaves", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to submit request");
            }

            addToast("Leave request submitted successfully", "success");
            setOpen(false);
            setFormData({ startDate: "", endDate: "", reason: "" });
            fetchLeaves();
        } catch (error: any) {
            addToast(error.message, "error");
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "APPROVED":
                return <Badge className="bg-green-500">Approved</Badge>;
            case "REJECTED":
                return <Badge variant="destructive">Rejected</Badge>;
            default:
                return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Pending</Badge>;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">My Leaves</h2>
                    <p className="text-muted-foreground">Manage your leave applications</p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Apply for Leave
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Apply for Leave</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Start Date</Label>
                                    <Input
                                        type="date"
                                        required
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>End Date</Label>
                                    <Input
                                        type="date"
                                        required
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Reason</Label>
                                <Textarea
                                    required
                                    placeholder="Please allow me leave because..."
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={submitting}>
                                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Submit Application
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {leaves.length === 0 ? (
                    <Card className="col-span-full">
                        <CardContent className="p-8 text-center text-muted-foreground">
                            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No leave requests found</p>
                        </CardContent>
                    </Card>
                ) : (
                    leaves.map((leave) => (
                        <Card key={leave.id}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <div className="font-medium text-sm text-muted-foreground">
                                    Applied on {format(new Date(leave.createdAt), "MMM d, yyyy")}
                                </div>
                                {getStatusBadge(leave.status)}
                            </CardHeader>
                            <CardContent className="mt-4 space-y-4">
                                <div>
                                    <div className="text-sm font-medium mb-1">Duration</div>
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <Clock className="mr-2 h-4 w-4" />
                                        {format(new Date(leave.startDate), "MMM d")} - {format(new Date(leave.endDate), "MMM d, yyyy")}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium mb-1">Reason</div>
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {leave.reason}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
