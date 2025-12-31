"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, Calendar, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TeacherClassesPage() {
    const [classes, setClasses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                // 1. Get User
                const userStr = localStorage.getItem("user");
                if (!userStr) return;
                const user = JSON.parse(userStr);

                // 2. Fetch Allocations (My Classes)
                // Just fetch all allocations and filter by Teacher (via email/user relation implicitly or explicitly)
                // NOTE: Since we don't have "getMyAllocations", we filter the list.
                const res = await fetch("/api/academic/allocations");
                if (res.ok) {
                    const allAllocations = await res.json();
                    // Filter: allocation.teacher.user.email === user.email
                    // Filter: allocation.teacher.user.email === user.email
                    // Use optional chaining to avoid crashes if generated with incomplete data
                    const myClasses = allAllocations.filter((a: any) =>
                        a.teacher?.user?.email === user.email
                    );
                    setClasses(myClasses);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchClasses();
    }, []);

    if (loading) return <div className="p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">My Classes</h2>
                <p className="text-muted-foreground">View and manage your assigned classes</p>
            </div>

            {classes.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="p-8 text-center text-muted-foreground">
                        <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium mb-2">No Classes Assigned</p>
                        <p className="text-sm">Please contact the administrator to assign subjects to you.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {classes.map((alloc) => (
                        <Card key={alloc.id} className="hover-lift glass group">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                                            {alloc.course.code}
                                        </CardTitle>
                                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                                            {alloc.course.name}
                                        </p>
                                    </div>
                                    <Badge variant="secondary">
                                        {alloc.batch}-{alloc.section}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                                    <Calendar className="h-4 w-4" />
                                    <span>{alloc.session.name}</span>
                                </div>
                                <div className="flex justify-end">
                                    <Link href={`/teacher/attendance?allocationId=${alloc.id}`}>
                                        <Button size="sm" className="w-full">
                                            Take Attendance <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
