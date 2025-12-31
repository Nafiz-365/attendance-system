"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/cn"

export type ToastType = "success" | "error" | "info" | "warning"

export interface Toast {
    id: string
    type: ToastType
    message: string
    duration?: number
}

interface ToastContextType {
    toasts: Toast[]
    addToast: (message: string, type?: ToastType, duration?: number) => void
    removeToast: (id: string) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = React.useState<Toast[]>([])

    const addToast = React.useCallback((message: string, type: ToastType = "info", duration = 3000) => {
        const id = Math.random().toString(36).substr(2, 9)
        const toast: Toast = { id, type, message, duration }

        setToasts((prev) => [...prev, toast])

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id)
            }, duration)
        }
    }, [])

    const removeToast = React.useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, [])

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    )
}

export function useToast() {
    const context = React.useContext(ToastContext)
    if (!context) {
        throw new Error("useToast must be used within ToastProvider")
    }
    return context
}

function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
            ))}
        </div>
    )
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
    const typeStyles = {
        success: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200",
        error: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200",
        info: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200",
        warning: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200",
    }

    return (
        <div
            className={cn(
                "flex items-center gap-3 p-4 rounded-lg border shadow-lg animate-slide-up min-w-[300px]",
                typeStyles[toast.type]
            )}
        >
            <div className="flex-1 text-sm font-medium">{toast.message}</div>
            <button
                onClick={onClose}
                className="flex-shrink-0 hover:opacity-70 transition-opacity"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    )
}
