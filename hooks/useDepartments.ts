import { useState, useEffect } from 'react'
import { Department } from '@/types'
import { DepartmentService } from '@/services'
import { useToast } from "@/components/ui/toast"

export function useDepartments() {
    const [departments, setDepartments] = useState<Department[]>([])
    const [loading, setLoading] = useState(true)
    const { addToast } = useToast()

    const fetchDepartments = async () => {
        try {
            setLoading(true)
            const data = await DepartmentService.getAll()
            setDepartments(data)
        } catch (error) {
            console.error(error)
            addToast("Failed to load departments", "error")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDepartments()
    }, [])

    const addDepartment = async (dept: any) => {
        try {
            const newDept = await DepartmentService.create(dept)
            setDepartments(prev => [...prev, newDept])
            addToast("Department added successfully", "success")
            return newDept
        } catch (error: any) {
            addToast(error.message || "Failed to add department", "error")
            throw error
        }
    }

    const deleteDepartment = async (id: number) => {
        if (!confirm("Are you sure you want to delete this department?")) return;
        try {
            await DepartmentService.delete(id);
            setDepartments(prev => prev.filter(dept => dept.id !== id));
            addToast("Department deleted successfully", "success");
        } catch (error: any) {
            addToast(error.message || "Failed to delete department", "error");
        }
    }

    const updateDepartment = async (id: number, data: Partial<Department>) => {
        try {
            const updated = await DepartmentService.update(id, data);
            setDepartments(prev => prev.map(d => d.id === id ? updated : d));
            addToast("Department updated successfully", "success");
            return updated;
        } catch (error: any) {
            addToast(error.message || "Failed to update department", "error");
            throw error;
        }
    }

    return {
        departments,
        loading,
        addDepartment,
        updateDepartment,
        deleteDepartment,
        refresh: fetchDepartments
    }
}
