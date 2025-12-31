"use client";

import { motion } from "framer-motion";
import { ModeToggle } from "@/components/layout/theme-toggle";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
            {/* Theme Toggle */}
            <div className="absolute top-4 right-4 z-50">
                <ModeToggle />
            </div>

            {/* Animated Background Elements */}
            <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-purple-300/30 dark:bg-purple-900/20 blur-3xl mix-blend-multiply dark:mix-blend-screen"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        x: [0, 50, 0],
                        y: [0, 30, 0],
                        opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-blue-300/30 dark:bg-blue-900/20 blur-3xl mix-blend-multiply dark:mix-blend-screen"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        x: [0, -30, 0],
                        y: [0, -50, 0],
                        opacity: [0.3, 0.4, 0.3],
                    }}
                    transition={{
                        duration: 18,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] rounded-full bg-indigo-300/30 dark:bg-indigo-900/20 blur-3xl mix-blend-multiply dark:mix-blend-screen"
                />
            </div>

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-grid-slate-200/50 dark:bg-grid-slate-800/20 [mask-image:radial-gradient(ellipse_at_center,white,transparent)] pointer-events-none" />

            {/* Content Container */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative z-10 w-full max-w-5xl flex items-center justify-center"
            >
                {children}
            </motion.div>
        </div>
    );
}
