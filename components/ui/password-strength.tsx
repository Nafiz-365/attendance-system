"use client"

import { cn } from "@/lib/cn"
import { Check, X } from "lucide-react"

interface PasswordStrengthProps {
    password: string
}

interface Requirement {
    label: string
    met: boolean
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
    const requirements: Requirement[] = [
        { label: "At least 8 characters", met: password.length >= 8 },
        { label: "One uppercase letter", met: /[A-Z]/.test(password) },
        { label: "One lowercase letter", met: /[a-z]/.test(password) },
        { label: "One number", met: /\d/.test(password) },
        { label: "One special character", met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
    ]

    const metCount = requirements.filter(r => r.met).length
    const strength = metCount === 0 ? 0 : (metCount / requirements.length) * 100

    const getStrengthColor = () => {
        if (strength < 40) return "bg-red-500"
        if (strength < 80) return "bg-yellow-500"
        return "bg-green-500"
    }

    const getStrengthText = () => {
        if (strength < 40) return "Weak"
        if (strength < 80) return "Medium"
        return "Strong"
    }

    if (!password) return null

    return (
        <div className="space-y-2 mt-2">
            <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                        className={cn("h-full transition-all duration-300", getStrengthColor())}
                        style={{ width: `${strength}%` }}
                    />
                </div>
                <span className={cn("text-sm font-medium",
                    strength < 40 ? "text-red-500" : strength < 80 ? "text-yellow-500" : "text-green-500"
                )}>
                    {getStrengthText()}
                </span>
            </div>

            <div className="space-y-1">
                {requirements.map((req, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                        {req.met ? (
                            <Check className="h-3 w-3 text-green-500" />
                        ) : (
                            <X className="h-3 w-3 text-muted-foreground" />
                        )}
                        <span className={cn(req.met ? "text-green-600 dark:text-green-400" : "text-muted-foreground")}>
                            {req.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}
