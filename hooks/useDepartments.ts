import { useEffect } from 'react';
import useSWR from 'swr';
import { Department } from '@/types';
import { DepartmentService } from '@/services';
import { useToast } from '@/components/ui/toast';

export function useDepartments() {
    const { addToast } = useToast();
    const {
        data: departments = [],
        error,
        isLoading,
        mutate,
    } = useSWR<Department[]>('/api/departments', DepartmentService.getAll, {
        revalidateOnFocus: false,
    });

    useEffect(() => {
        if (error) {
            console.error(error);
            addToast('Failed to load departments', 'error');
        }
    }, [error, addToast]);

    const addDepartment = async (dept: Omit<Department, 'id'>) => {
        try {
            const newDept = await DepartmentService.create(dept);
            mutate([...departments, newDept], false);
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
            mutate(
                departments.filter((dept) => dept.id !== id),
                false,
            );
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
            mutate(
                departments.map((d) => (d.id === id ? updated : d)),
                false,
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
        loading: isLoading,
        addDepartment,
        updateDepartment,
        deleteDepartment,
        refresh: () => mutate(),
    };
}
