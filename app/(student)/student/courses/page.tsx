'use client';

import { useEffect, useState } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, User } from 'lucide-react';

interface CourseAllocation {
    id: string;
    course: {
        code: string;
        name: string;
        credits: number;
    };
    teacher: {
        name: string;
        email: string;
    };
    _count?: {
        attendance: number;
    };
}

export default function StudentCoursesPage() {
    const [courses, setCourses] = useState<CourseAllocation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await fetch('/api/student/courses');
                if (res.ok) {
                    setCourses(await res.json());
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    if (loading)
        return (
            <div className="p-8">
                <Loader2 className="animate-spin" />
            </div>
        );

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">
                    My Courses
                </h2>
                <p className="text-muted-foreground">
                    Subjects enrolled for this session
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {courses.length > 0 ? (
                    courses.map((alloc) => (
                        <Card key={alloc.id} className="hover-lift glass">
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
                                        {alloc.course.credits} Credits
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <User className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="font-medium">
                                            {alloc.teacher.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {alloc.teacher.email}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center text-sm pt-2 border-t">
                                    <span className="text-muted-foreground flex items-center gap-1">
                                        <Calendar className="h-3 w-3" /> Classes
                                        Processed
                                    </span>
                                    <span className="font-bold">
                                        {alloc._count?.attendance || 0}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full text-center py-12 text-muted-foreground border rounded-lg border-dashed">
                        No courses found for your registered Batch/Section.
                    </div>
                )}
            </div>
        </div>
    );
}
