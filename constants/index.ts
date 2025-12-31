export const ROUTES = {
    // Auth routes
    LOGIN: '/login',

    // Dashboard routes
    DASHBOARD: '/dashboard',
    STUDENTS: '/students',
    DEPARTMENTS: '/departments',
    COURSES: '/courses',
    ATTENDANCE: '/attendance',
    REPORTS: '/reports',
} as const

export const APP_NAME = 'Varsity Portal'
export const APP_DESCRIPTION = 'Student Attendance Management System'

export const THEME = {
    DEFAULT: 'system',
    LIGHT: 'light',
    DARK: 'dark',
} as const
