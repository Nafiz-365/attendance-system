export function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

export function validateRequired(value: string): boolean {
    return value.trim().length > 0
}

export function validateNumber(value: string, min?: number, max?: number): boolean {
    const num = parseFloat(value)
    if (isNaN(num)) return false
    if (min !== undefined && num < min) return false
    if (max !== undefined && num > max) return false
    return true
}

export function validatePhone(phone: string): boolean {
    // Accepts various phone formats
    const phoneRegex = /^[\d\s+()-]{10,}$/
    return phoneRegex.test(phone)
}

export function validateStudentId(studentId: string): boolean {
    // Format: DEPT-YEAR-NUMBER (e.g., CSE2021001)
    return studentId.length >= 6
}

export interface ValidationResult {
    isValid: boolean
    errors: Record<string, string>
}

export function validateStudentForm(data: {
    name?: string
    rollNo?: string
    studentId?: string
    email?: string
    phone?: string
    department?: string
    semester?: string
}): ValidationResult {
    const errors: Record<string, string> = {}

    if (data.name !== undefined && !validateRequired(data.name)) {
        errors.name = "Name is required"
    }

    if (data.rollNo !== undefined && !validateRequired(data.rollNo)) {
        errors.rollNo = "Roll number is required"
    }

    if (data.studentId !== undefined && !validateStudentId(data.studentId)) {
        errors.studentId = "Invalid student ID format"
    }

    if (data.email !== undefined && data.email && !validateEmail(data.email)) {
        errors.email = "Invalid email address"
    }

    if (data.phone !== undefined && data.phone && !validatePhone(data.phone)) {
        errors.phone = "Invalid phone number"
    }

    if (data.department !== undefined && !validateRequired(data.department)) {
        errors.department = "Department is required"
    }

    if (data.semester !== undefined && !validateRequired(data.semester)) {
        errors.semester = "Semester is required"
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    }
}
