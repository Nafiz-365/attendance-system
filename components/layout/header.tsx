'use client';

import { useEffect, useState } from 'react';
import { ModeToggle } from './theme-toggle';
import { Button } from '@/components/ui/button';
import { Bell, LogOut, User } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Notification {
    id: number;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: Date;
    userId: number;
}

interface User {
    name: string;
    email: string;
    image?: string;
}

export function Header() {
    const pathname = usePathname();
    const [user, setUser] = useState<User | null>(null);

    const isAdmin = pathname?.includes('/admin');
    const isTeacher = pathname?.includes('/teacher');
    const isStudent = pathname?.includes('/student');

    const roleLabel = isAdmin
        ? 'Administrator'
        : isTeacher
          ? 'Teacher'
          : isStudent
            ? 'Student'
            : 'User';
    const profileHref = isAdmin
        ? '/admin/profile'
        : isTeacher
          ? '/teacher/profile'
          : isStudent
            ? '/student/profile'
            : '/profile';

    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        // Load user from localStorage
        const loadUser = () => {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                setUser(JSON.parse(userStr));
            }
        };

        const fetchNotifications = async () => {
            try {
                const res = await fetch('/api/notifications');
                if (res.ok) {
                    const data = await res.json();
                    setNotifications(data);
                }
            } catch (error) {
                console.error('Failed to fetch notifications', error);
            }
        };

        loadUser();
        fetchNotifications();

        // Listen for storage changes (when profile pic is updated)
        window.addEventListener('storage', loadUser);

        // Poll for notifications every minute
        const interval = setInterval(fetchNotifications, 60000);

        return () => {
            window.removeEventListener('storage', loadUser);
            clearInterval(interval);
        };
    }, []);

    const markAsRead = async (id: number) => {
        try {
            await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });
            setNotifications((prev: Notification[]) =>
                prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
            );
        } catch (error) {
            console.error(error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ all: true }),
            });
            setNotifications((prev: Notification[]) =>
                prev.map((n) => ({ ...n, isRead: true })),
            );
        } catch (error) {
            console.error(error);
        }
    };

    const userName = user?.name || roleLabel;
    const userEmail =
        user?.email || (isAdmin ? 'admin@system.com' : 'user@school.edu');
    const userInitial = (userName || 'U').charAt(0).toUpperCase();

    return (
        <header className="h-16 border-b glass-card flex items-center justify-between px-6 sticky top-0 z-40 transition-all duration-300">
            <div className="flex flex-col">
                <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                    {roleLabel} Portal
                </h2>
            </div>

            <div className="flex items-center gap-4">
                <ModeToggle />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative hover:bg-muted/50 transition-colors"
                        >
                            <Bell className="h-5 w-5 text-muted-foreground" />
                            {notifications.filter((n) => !n.isRead).length >
                                0 && (
                                <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full animate-pulse ring-2 ring-background"></span>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                        <DropdownMenuLabel className="flex items-center justify-between">
                            <span>Notifications</span>
                            {notifications.filter((n) => !n.isRead).length >
                                0 && (
                                <span
                                    className="text-xs text-blue-500 cursor-pointer hover:underline"
                                    onClick={markAllAsRead}
                                >
                                    Mark all as read
                                </span>
                            )}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <div className="max-h-[300px] overflow-y-auto">
                            {notifications.length > 0 ? (
                                notifications.map(
                                    (notification: Notification) => (
                                        <DropdownMenuItem
                                            key={notification.id}
                                            className="cursor-pointer"
                                            onClick={() =>
                                                markAsRead(notification.id)
                                            }
                                        >
                                            <div
                                                className={`flex flex-col gap-1 ${!notification.isRead ? 'font-semibold' : 'text-muted-foreground'}`}
                                            >
                                                <span className="text-sm">
                                                    {notification.title}
                                                </span>
                                                <span className="text-xs">
                                                    {notification.message}
                                                </span>
                                                <span className="text-[10px] opacity-70">
                                                    {new Date(
                                                        notification.createdAt,
                                                    ).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </DropdownMenuItem>
                                    ),
                                )
                            ) : (
                                <div className="p-4 text-center text-sm text-muted-foreground">
                                    No notifications
                                </div>
                            )}
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="relative h-9 w-9 rounded-full ring-2 ring-primary/10 hover:ring-primary/30 transition-all p-0 overflow-hidden"
                        >
                            {user?.image ? (
                                <img
                                    src={user.image}
                                    alt={userName}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="h-full w-full bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center text-primary font-bold">
                                    {userInitial}
                                </div>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-56"
                        align="end"
                        forceMount
                    >
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">
                                    {userName}
                                </p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {userEmail}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href={profileHref} className="cursor-pointer">
                                <User className="mr-2 h-4 w-4" />
                                <span>Profile</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link
                                href="/login"
                                className="cursor-pointer text-destructive focus:text-destructive"
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Log out</span>
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
