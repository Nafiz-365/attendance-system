"use client"
import * as React from "react"
import { cn } from "@/lib/cn"
import { X } from "lucide-react"

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    children: React.ReactNode
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="relative w-full max-w-md rounded-lg bg-background p-6 shadow-lg animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">{title}</h2>
                    <button onClick={onClose} className="rounded-full p-1 hover:bg-muted">
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <div>{children}</div>
            </div>
        </div>
    )
}
