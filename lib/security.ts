// Security utilities for frontend authentication
// These will be replaced with actual API calls when backend is ready

export function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

export function generateToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export function generateBackupCodes(count: number = 8): string[] {
    const codes: string[] = []
    for (let i = 0; i < count; i++) {
        const code = Math.random().toString(36).substring(2, 10).toUpperCase()
        codes.push(code)
    }
    return codes
}

export function validateOTP(input: string, expected: string): boolean {
    return input === expected
}

export function hashPassword(password: string): string {
    // Simple client-side hashing for demo
    // In production, this would be done server-side
    return btoa(password)
}

export function checkPasswordStrength(password: string): {
    score: number
    feedback: string[]
} {
    const feedback: string[] = []
    let score = 0

    if (password.length >= 8) score++
    else feedback.push("Use at least 8 characters")

    if (/[A-Z]/.test(password)) score++
    else feedback.push("Add uppercase letters")

    if (/[a-z]/.test(password)) score++
    else feedback.push("Add lowercase letters")

    if (/\d/.test(password)) score++
    else feedback.push("Add numbers")

    if (/[^A-Za-z0-9]/.test(password)) score++
    else feedback.push("Add special characters")

    return { score, feedback }
}

export interface Session {
    id: string
    device: string
    browser: string
    location: string
    lastActive: Date
    current: boolean
}

export function getActiveSessions(): Session[] {
    const stored = localStorage.getItem('active_sessions')
    if (stored) {
        return JSON.parse(stored)
    }
    return []
}

export function addSession(session: Omit<Session, 'id'>): void {
    const sessions = getActiveSessions()
    const newSession: Session = {
        ...session,
        id: generateToken()
    }
    sessions.push(newSession)
    localStorage.setItem('active_sessions', JSON.stringify(sessions))
}

export function removeSession(sessionId: string): void {
    const sessions = getActiveSessions().filter(s => s.id !== sessionId)
    localStorage.setItem('active_sessions', JSON.stringify(sessions))
}

export interface LoginAttempt {
    timestamp: Date
    success: boolean
    ip: string
    device: string
}

export function recordLoginAttempt(success: boolean): void {
    const attempts = getLoginAttempts()
    attempts.push({
        timestamp: new Date(),
        success,
        ip: '127.0.0.1', // Simulated
        device: navigator.userAgent
    })
    localStorage.setItem('login_attempts', JSON.stringify(attempts))
}

export function getLoginAttempts(): LoginAttempt[] {
    const stored = localStorage.getItem('login_attempts')
    if (stored) {
        const attempts = JSON.parse(stored)
        return attempts.map((a: any) => ({
            ...a,
            timestamp: new Date(a.timestamp)
        }))
    }
    return []
}

export function getFailedLoginCount(minutes: number = 15): number {
    const attempts = getLoginAttempts()
    const cutoff = new Date(Date.now() - minutes * 60 * 1000)
    return attempts.filter(a => !a.success && a.timestamp > cutoff).length
}

export function isAccountLocked(): boolean {
    return getFailedLoginCount() >= 5
}

export function unlockAccount(): void {
    localStorage.removeItem('login_attempts')
}

// Session timeout management
let inactivityTimer: NodeJS.Timeout | null = null
let warningTimer: NodeJS.Timeout | null = null

export function startSessionTimeout(
    onWarning: () => void,
    onTimeout: () => void,
    warningTime: number = 14 * 60 * 1000, // 14 minutes
    timeoutTime: number = 15 * 60 * 1000  // 15 minutes
): void {
    resetSessionTimeout(onWarning, onTimeout, warningTime, timeoutTime)

    // Reset on user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
    events.forEach(event => {
        document.addEventListener(event, () => {
            resetSessionTimeout(onWarning, onTimeout, warningTime, timeoutTime)
        })
    })
}

function resetSessionTimeout(
    onWarning: () => void,
    onTimeout: () => void,
    warningTime: number,
    timeoutTime: number
): void {
    if (inactivityTimer) clearTimeout(inactivityTimer)
    if (warningTimer) clearTimeout(warningTimer)

    warningTimer = setTimeout(onWarning, warningTime)
    inactivityTimer = setTimeout(onTimeout, timeoutTime)
}

export function stopSessionTimeout(): void {
    if (inactivityTimer) clearTimeout(inactivityTimer)
    if (warningTimer) clearTimeout(warningTimer)
}
