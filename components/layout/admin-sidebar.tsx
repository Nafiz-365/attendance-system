'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import {
    LayoutDashboard,
    Users,
    CalendarCheck,
    FileText,
    LogOut,
    Building2,
    BookOpen,
    GraduationCap,
    FileCheck,
    CalendarRange,
    Share2,
    Settings,
    Megaphone,
    ArrowUpCircle,
    Calendar,
    ChevronRight,
} from 'lucide-react';

interface User {
    name?: string;
    image?: string;
}

// Grouped Sidebar Items
const sidebarGroups = [
    {
        label: 'Overview',
        items: [
            {
                icon: LayoutDashboard,
                label: 'Dashboard',
                href: '/admin/dashboard',
            },
        ],
    },
    {
        label: 'Management',
        items: [
            { icon: GraduationCap, label: 'Teachers', href: '/admin/teachers' },
            { icon: Users, label: 'Students', href: '/admin/students' },
            { icon: BookOpen, label: 'Courses', href: '/admin/courses' },
            {
                icon: Building2,
                label: 'Departments',
                href: '/admin/departments',
            },
        ],
    },
    {
        label: 'Academic',
        items: [
            {
                icon: Calendar,
                label: 'Timetable',
                href: '/admin/academic/timetable',
            },
            {
                icon: ArrowUpCircle,
                label: 'Promotions',
                href: '/admin/students/promotion',
            },
        ],
    },
    {
        label: 'Daily Operations',
        items: [
            {
                icon: CalendarCheck,
                label: 'Attendance',
                href: '/admin/attendance',
            },
            { icon: FileCheck, label: 'Leaves', href: '/admin/leaves' },
            { icon: Megaphone, label: 'Notices', href: '/admin/notices' },
            { icon: FileText, label: 'Reports', href: '/admin/reports' },
        ],
    },
    {
        label: 'Configuration',
        items: [
            {
                icon: Settings,
                label: 'System Settings',
                href: '/admin/settings',
            },
        ],
    },
];

export function Sidebar() {
    const pathname = usePathname();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const loadUser = () => {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                setUser(JSON.parse(userStr));
            }
        };

        loadUser();
        window.addEventListener('storage', loadUser);
        return () => window.removeEventListener('storage', loadUser);
    }, []);

    const userName = user?.name || 'Admin User';
    const userInitial = (userName || 'A').charAt(0).toUpperCase();

    return (
        <aside className="w-64 border-r bg-card/60 backdrop-blur-xl h-screen flex flex-col fixed left-0 top-0 shadow-premium-lg z-50 transition-all duration-300">
            {/* Header */}
            <div className="p-6 pb-2">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 gradient-university rounded-xl flex items-center justify-center shadow-lg transform hover:rotate-6 transition-transform">
                        <GraduationCap className="text-white h-6 w-6" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-xl tracking-tight text-foreground">
                            Admin<span className="text-primary">Portal</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-6 overflow-y-auto py-2">
                {sidebarGroups.map((group, groupIndex) => (
                    <div key={groupIndex} className="space-y-1">
                        <h4 className="px-3 text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest mb-2 font-mono">
                            {group.label}
                        </h4>
                        <div className="space-y-1">
                            {group.items.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            'flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative',
                                            isActive
                                                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 translate-x-1'
                                                : 'text-muted-foreground hover:bg-muted hover:text-foreground hover:translate-x-1',
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon
                                                className={cn(
                                                    'h-[18px] w-[18px] transition-colors',
                                                    isActive
                                                        ? 'text-primary-foreground'
                                                        : 'text-muted-foreground group-hover:text-foreground',
                                                )}
                                            />
                                            <span>{item.label}</span>
                                        </div>

                                        {isActive && (
                                            <ChevronRight className="h-3 w-3 opacity-50" />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Footer Profile */}
            <Link
                href="/admin/profile"
                className="p-4 m-4 bg-muted/40 rounded-xl border border-border/40 hover:bg-muted/60 transition-colors cursor-pointer group"
            >
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
                                <span className="font-bold text-xs text-primary">
                                    {userInitial}
                                </span>
                            </div>
                        )}
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-foreground">
                                {userName}
                            </span>
                            <span className="text-[9px] text-muted-foreground">
                                Online
                            </span>
                        </div>
                    </div>
                    <LogOut
                        className="h-4 w-4 text-muted-foreground group-hover:text-destructive transition-colors"
                        onClick={(e) => {
                            e.preventDefault();
                            window.location.href = '/login';
                        }}
                    />
                </div>
            </Link>
        </aside>
    );
}
