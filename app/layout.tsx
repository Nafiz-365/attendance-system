import type { Metadata } from 'next';
import { ReactNode } from 'react';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { ToastProvider } from '@/components/ui/toast';
import NextTopLoader from 'nextjs-toploader';

export const metadata: Metadata = {
    title: 'Varsity Portal - Student Attendance Management',
    description: 'University student attendance management system',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className="bg-grid-pattern" suppressHydrationWarning>
                <NextTopLoader color="#2563EB" showSpinner={false} />
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <ToastProvider>{children}</ToastProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
