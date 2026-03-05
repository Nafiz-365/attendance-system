import { useState, useEffect, useCallback } from 'react';
import { Department } from '@/types';
import { DepartmentService } from '@/services';
import { useToast } from '@/components/ui/toast';

export function useDepartments() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();

    const fetchDepartments = useCallback(async () => {
        try {
            setLoading(true);
            const data = await DepartmentService.getAll();
            setDepartments(data);
        } catch (error) {
            console.error(error);
            addToast('Failed to load departments', 'error');
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        fetchDepartments();
    }, [fetchDepartments]);

    const addDepartment = async (dept: Omit<Department, 'id'>) => {
        try {
            const newDept = await DepartmentService.create(dept);
            setDepartments((prev) => [...prev, newDept]);
            addToast('Department added successfully', 'success');
            return newDept;
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Failed to add department';
            addToast(message, 'error');
            throw error;
        }
    };

    const deleteDepartment = async (id: number) => {
        if (!confirm('Are you sure you want to delete this department?'))
            return;
        try {
            await DepartmentService.delete(id);
            setDepartments((prev) => prev.filter((dept) => dept.id !== id));
            addToast('Department deleted successfully', 'success');
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Failed to delete department';
            addToast(message, 'error');
        }
    };

    const updateDepartment = async (id: number, data: Partial<Department>) => {
        try {
            const updated = await DepartmentService.update(id, data);
            setDepartments((prev) =>
                prev.map((d) => (d.id === id ? updated : d)),
            );
            addToast('Department updated successfully', 'success');
            return updated;
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Failed to update department';
            addToast(message, 'error');
            throw error;
        }
    };

    return {
        departments,
        loading,
        addDepartment,
        updateDepartment,
        deleteDepartment,
        refresh: fetchDepartments,
    };
}
