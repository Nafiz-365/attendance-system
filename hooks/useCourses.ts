import { useEffect } from 'react';
import useSWR from 'swr';
import { Course } from '@/types';
import { CourseService } from '@/services';
import { useToast } from '@/components/ui/toast';

export function useCourses() {
    const { addToast } = useToast();
    const {
        data: courses = [],
        error,
        isLoading,
        mutate,
    } = useSWR<Course[]>('/api/courses', CourseService.getAll, {
        revalidateOnFocus: false,
    });

    useEffect(() => {
        if (error) {
            console.error(error);
            addToast('Failed to load courses', 'error');
        }
    }, [error, addToast]);

    const addCourse = async (course: Omit<Course, 'id'>) => {
        try {
            const newCourse = await CourseService.create(course);
            mutate([...courses, newCourse], false);
            addToast('Course added successfully', 'success');
            return newCourse;
        } catch (error: unknown) {
            addToast(
                error instanceof Error ? error.message : 'Failed to add course',
                'error',
            );
            throw error;
        }
    };

    const deleteCourse = async (id: number) => {
        if (!confirm('Are you sure you want to delete this course?')) return;
        try {
            await CourseService.delete(id);
            mutate(
                courses.filter((c) => c.id !== id),
                false,
            );
            addToast('Course deleted successfully', 'success');
        } catch (error: unknown) {
            addToast(
                error instanceof Error
                    ? error.message
                    : 'Failed to delete course',
                'error',
            );
        }
    };

    const updateCourse = async (id: number, data: Partial<Course>) => {
        try {
            const updated = await CourseService.update(id, data);
            mutate(
                courses.map((c) => (c.id === id ? updated : c)),
                false,
            );
            addToast('Course updated successfully', 'success');
            return updated;
        } catch (error: unknown) {
            addToast(
                error instanceof Error
                    ? error.message
                    : 'Failed to update course',
                'error',
            );
            throw error;
        }
    };

    return {
        courses,
        loading: isLoading,
        addCourse,
        updateCourse,
        deleteCourse,
        refresh: () => mutate(),
    };
}
