import { useState, useEffect } from 'react';
import { Student } from '@/types';
import { StudentService } from '@/services';
import { useToast } from '@/components/ui/toast';

export function useStudents() {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const data = await StudentService.getAll();
            setStudents(data);
        } catch (error) {
            console.error(error);
            addToast('Failed to load students', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const addStudent = async (student: Omit<Student, 'id'>) => {
        try {
            const newStudent = await StudentService.create(student);
            setStudents((prev) => [newStudent, ...prev]); // Add to top
            addToast('Student added successfully', 'success');
            return newStudent;
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Failed to add student';
            addToast(message, 'error');
            throw error;
        }
    };

    const updateStudent = async (id: number, data: Partial<Student>) => {
        try {
            const updated = await StudentService.update(id, data);
            setStudents((prev) => prev.map((s) => (s.id === id ? updated : s)));
            addToast('Student updated successfully', 'success');
            return updated;
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Failed to update student';
            addToast(message, 'error');
            throw error;
        }
    };

    const deleteStudent = async (id: number) => {
        try {
            const success = await StudentService.delete(id);
            if (success) {
                setStudents((prev) => prev.filter((s) => s.id !== id));
                addToast('Student deleted successfully', 'success');
            }
            return success;
        } catch (error) {
            addToast('Failed to delete student', 'error');
        }
    };

    const importStudents = async (students: Omit<Student, 'id'>[]) => {
        try {
            const res = await fetch('/api/students/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ students }),
            });
            if (!res.ok) throw new Error('Import failed');
            const result = await res.json();
            addToast(
                `Successfully imported ${result.count} students`,
                'success',
            );
            fetchStudents(); // Refresh list
            return result;
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Failed to import students';
            addToast(message, 'error');
            throw error;
        }
    };

    return {
        students,
        loading,
        addStudent,
        updateStudent,
        deleteStudent,
        importStudents,
        refresh: fetchStudents,
    };
}
