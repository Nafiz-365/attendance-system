import { useState, useEffect } from 'react'
import { Course } from '@/types'
import { CourseService } from '@/services'
import { useToast } from "@/components/ui/toast"

export function useCourses() {
    const [courses, setCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState(true)
    const { addToast } = useToast()

    const fetchCourses = async () => {
        try {
            setLoading(true)
            const data = await CourseService.getAll()
            setCourses(data)
        } catch (error) {
            console.error(error)
            addToast("Failed to load courses", "error")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCourses()
    }, [])

    const addCourse = async (course: any) => {
        try {
            const newCourse = await CourseService.create(course)
            setCourses(prev => [...prev, newCourse])
            addToast("Course added successfully", "success")
            return newCourse
        } catch (error: any) {
            addToast(error.message || "Failed to add course", "error")
            throw error
        }
    }

    const deleteCourse = async (id: number) => {
        if (!confirm("Are you sure you want to delete this course?")) return;
        try {
            await CourseService.delete(id);
            setCourses(prev => prev.filter(c => c.id !== id));
            addToast("Course deleted successfully", "success");
        } catch (error: any) {
            addToast(error.message || "Failed to delete course", "error");
        }
    }

    const updateCourse = async (id: number, data: Partial<Course>) => {
        try {
            const updated = await CourseService.update(id, data);
            setCourses(prev => prev.map(c => c.id === id ? updated : c));
            addToast("Course updated successfully", "success");
            return updated;
        } catch (error: any) {
            addToast(error.message || "Failed to update course", "error");
            throw error;
        }
    }

    return {
        courses,
        loading,
        addCourse,
        updateCourse,
        deleteCourse,
        refresh: fetchCourses
    }
}
