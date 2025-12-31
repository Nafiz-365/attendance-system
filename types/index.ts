// Student related types
export interface Student {
    id: number
    name: string
    rollNo: string
    studentId: string
    class: string
    department: string
    departmentId: number
    semester: string
    email: string
    phone: string
    address: string
    courses: string[]
}

export interface Department {
    id: number
    name: string
    code: string
    hod: string
    totalStudents: number
    activeStudents: number
}

export interface Course {
    id: number
    name: string
    code: string
    departmentId: number
    instructor: string
    credits: number
}

export interface AttendanceRecord {
    studentId: number
    status: "Present" | "Absent" | "Late"
    time?: string
}

export interface AttendanceData {
    date: string
    present: number
    absent: number
    late: number
}

export interface RecentActivity {
    id: number
    student: string
    status: string
    time: string
    department: string
}
