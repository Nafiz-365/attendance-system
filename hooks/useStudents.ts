import useSWR from 'swr';
import { Student } from '@/types';
import { StudentService } from '@/services';
import { useToast } from '@/components/ui/toast';

const fetcher = async () => {
    const res = await fetch('/api/students');
    if (!res.ok) throw new Error('Failed to fetch students');
    return res.json();
};

export function useStudents() {
    const {
        data: students = [],
        error,
        isLoading,
        mutate,
    } = useSWR<Student[]>('/api/students', fetcher);
    const { addToast } = useToast();

    const addStudent = async (student: Omit<Student, 'id'>) => {
        try {
            const newStudent = await StudentService.create(student);
            mutate((prev = []) => [newStudent, ...prev], false); // Optimistic update
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
            mutate(
                (prev = []) => prev.map((s) => (s.id === id ? updated : s)),
                false,
            );
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
                mutate((prev = []) => prev.filter((s) => s.id !== id), false);
                addToast('Student deleted successfully', 'success');
            }
            return success;
        } catch (error) {
            addToast('Failed to delete student', 'error');
        }
    };

    const importStudents = async (studentsList: Omit<Student, 'id'>[]) => {
        try {
            const res = await fetch('/api/students/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ students: studentsList }),
            });
            if (!res.ok) throw new Error('Import failed');
            const result = await res.json();
            addToast(
                `Successfully imported ${result.count} students`,
                'success',
            );
            mutate(); // Refresh list
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
        loading: isLoading,
        error,
        addStudent,
        updateStudent,
        deleteStudent,
        importStudents,
        refresh: mutate,
    };
}
