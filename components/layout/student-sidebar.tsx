"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/cn"
import { LayoutDashboard, CalendarCheck, FileCheck, User, LogOut, GraduationCap, BookOpen } from "lucide-react"

const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/student/dashboard" },
    { icon: CalendarCheck, label: "Attendance", href: "/student/attendance" },
    { icon: FileCheck, label: "Leave Requests", href: "/student/leaves" },
    { icon: BookOpen, label: "Courses", href: "/student/courses" },
    { icon: User, label: "Profile", href: "/student/profile" },
]

export function StudentSidebar() {
    const pathname = usePathname()
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        const loadUser = () => {
            const userStr = localStorage.getItem("user")
            if (userStr) {
                setUser(JSON.parse(userStr))
            }
        }

        loadUser()
        window.addEventListener("storage", loadUser)
        return () => window.removeEventListener("storage", loadUser)
    }, [])

    const userName = user?.name || "Student"
    const userInitial = (userName || "S").charAt(0).toUpperCase()

    return (
        <aside className="w-64 border-r bg-card/60 backdrop-blur-xl h-screen flex flex-col fixed left-0 top-0 shadow-premium-lg z-50">
            <div className="p-6 border-b flex items-center gap-3">
                <div className="h-10 w-10 gradient-university rounded-xl flex items-center justify-center shadow-md">
                    <GraduationCap className="text-white h-6 w-6" />
                </div>
                <div className="flex flex-col">
                    <span className="font-bold text-lg gradient-text-university">Student Portal</span>
                    <span className="text-xs text-muted-foreground">Attendance System</span>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {sidebarItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all",
                                isActive
                                    ? "gradient-university text-white shadow-md"
                                    : "hover:bg-muted text-muted-foreground hover:text-foreground hover-lift"
                            )}
                        >
                            <Icon className="h-5 w-5 flex-shrink-0" />
                            {item.label}
                        </Link>
                    )
                })}
            </nav>

            {/* Profile Section */}
            <Link href="/student/profile" className="p-4 m-4 bg-muted/40 rounded-xl border border-border/40 hover:bg-muted/60 transition-colors cursor-pointer group">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {user?.image ? (
                            <img
                                src={user.image}
                                alt={userName}
                                className="h-8 w-8 rounded-full object-cover border border-primary/20"
                            />
                        ) : (
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                                <span className="font-bold text-xs text-primary">{userInitial}</span>
                            </div>
                        )}
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-foreground">{userName}</span>
                            <span className="text-[9px] text-muted-foreground">Online</span>
                        </div>
                    </div>
                    <LogOut className="h-4 w-4 text-muted-foreground group-hover:text-destructive transition-colors" onClick={(e) => {
                        e.preventDefault()
                        window.location.href = "/login"
                    }} />
                </div>
            </Link>
        </aside>
    )
}
