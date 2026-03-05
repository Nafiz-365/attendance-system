import {
    Student,
    Department,
    Course,
    AttendanceData,
    RecentActivity,
} from '@/types';

// Mock data used by other services (placeholder)
export const DEPARTMENTS: Department[] = [
    {
        id: 1,
        name: 'Computer Science & Engineering',
        code: 'CSE',
        hod: 'Dr. Sarah Williams',
        totalStudents: 450,
        activeStudents: 420,
    },
    // ... rest can stay or be empty, handled by backend eventually
];

export const COURSES: Course[] = [];
export const ATTENDANCE_DATA: AttendanceData[] = [];
export const RECENT_ACTIVITY: RecentActivity[] = [];
export const STUDENTS: Student[] = []; // Deprecated, use API

// Service functions to call APIs
export class StudentService {
    static async getAll(): Promise<Student[]> {
        const res = await fetch('/api/students');
        if (!res.ok) throw new Error('Failed to fetch students');
        return res.json();
    }
    // ... rest of StudentService (kept for reference, already updated)
    static async getById(id: number): Promise<Student | undefined> {
        return undefined;
    }
    static async create(student: Omit<Student, 'id'>): Promise<Student> {
        const res = await fetch('/api/students', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(student),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Failed to create student');
        }
        return res.json();
    }
    static async update(id: number, data: Partial<Student>): Promise<Student> {
        const res = await fetch(`/api/students/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to update student');
        return res.json();
    }

    static async delete(id: number): Promise<boolean> {
        const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
        return res.ok;
    }
}

export class DepartmentService {
    static async getAll(): Promise<Department[]> {
        const res = await fetch('/api/departments');
        if (!res.ok) throw new Error('Failed to fetch departments');
        return res.json();
    }

    static async create(dept: Omit<Department, 'id'>): Promise<Department> {
        const res = await fetch('/api/departments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dept),
        });
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Failed to create department');
        }
        return res.json();
    }

    // Still mock for now as getById isn't strictly needed for list views yet
    static getById(id: number): Department | undefined {
        return undefined;
    }

    static async update(
        id: number,
        dept: Partial<Department>,
    ): Promise<Department> {
        const res = await fetch(`/api/departments/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dept),
        });
        if (!res.ok) throw new Error('Failed to update department');
        return res.json();
    }

    static async delete(id: number): Promise<boolean> {
        const res = await fetch(`/api/departments/${id}`, { method: 'DELETE' });
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Failed to delete department');
        }
        return res.ok;
    }
}

export class CourseService {
    static async getAll(): Promise<Course[]> {
        const res = await fetch('/api/courses');
        if (!res.ok) throw new Error('Failed to fetch courses');
        return res.json();
    }

    static async create(course: Omit<Course, 'id'>): Promise<Course> {
        const res = await fetch('/api/courses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(course),
        });
        if (!res.ok) throw new Error('Failed to create course');
        return res.json();
    }

    static getById(id: number): Course | undefined {
        return undefined;
    }
    static getByDepartment(deptId: number): Course[] {
        return [];
    }

    static async update(id: number, course: Partial<Course>): Promise<Course> {
        const res = await fetch(`/api/courses/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(course),
        });
        if (!res.ok) throw new Error('Failed to update course');
        return res.json();
    }

    static async delete(id: number): Promise<boolean> {
        const res = await fetch(`/api/courses/${id}`, { method: 'DELETE' });
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Failed to delete course');
        }
        return res.ok;
    }
}

// Attendance Service with real API
export class AttendanceService {
    static async markAttendance(data: {
        studentId: number;
        status: string;
        date?: string;
    }): Promise<AttendanceData> {
        const res = await fetch('/api/attendance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to mark attendance');
        return res.json();
    }

    static async getRecords(
        studentId?: number,
        date?: string,
    ): Promise<AttendanceData[]> {
        const params = new URLSearchParams();
        if (studentId) params.append('studentId', studentId.toString());
        if (date) params.append('date', date);

        const res = await fetch(`/api/attendance?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch attendance');
        return res.json();
    }

    static getData(): AttendanceData[] {
        return ATTENDANCE_DATA;
    }
    static getRecentActivity(): RecentActivity[] {
        return RECENT_ACTIVITY;
    }
}
