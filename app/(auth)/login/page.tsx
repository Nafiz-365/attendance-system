"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { Eye, EyeOff, Loader2, GraduationCap, ArrowRight, Lock, Mail, User } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
    const router = useRouter();
    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!formData.email || !formData.password) {
            addToast("Please fill in all fields", "error");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Login failed");
            }

            localStorage.setItem("user", JSON.stringify(data.user));
            addToast(`Welcome back, ${data.user.name}!`, "success");

            switch (data.user.role) {
                case 'STUDENT':
                    router.push("/student/dashboard");
                    break;
                case 'TEACHER':
                    router.push("/teacher/dashboard");
                    break;
                case 'ADMIN':
                    router.push("/admin/dashboard");
                    break;
                default:
                    router.push("/dashboard");
            }

            router.refresh();
        } catch (error: any) {
            addToast(error.message, "error");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <Card className="w-full max-w-sm border-0 glass-card relative overflow-hidden group">
            {/* Decorative top gradient line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

            <CardHeader className="space-y-1 pb-3 text-center relative z-10 pt-5">
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="mx-auto w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform duration-500"
                >
                    <GraduationCap className="text-white w-5 h-5" />
                </motion.div>
                <div>
                    <CardTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                        Welcome Back
                    </CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                        Sign in to your Varsity Portal
                    </CardDescription>
                </div>
            </CardHeader>

            <CardContent className="relative z-10 p-5 pt-0">
                <form onSubmit={handleLogin} className="space-y-3">
                    <div className="space-y-1">
                        <label className="text-[11px] font-medium ml-1 text-muted-foreground uppercase tracking-wider">Email Address</label>
                        <div className="relative group/input">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
                            <Input
                                name="email"
                                type="email"
                                placeholder="name@university.edu"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                                disabled={loading}
                                className="pl-8 h-9 text-sm bg-white/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[11px] font-medium ml-1 text-muted-foreground uppercase tracking-wider">Password</label>
                        <div className="relative group/input">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
                            <Input
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleInputChange}
                                required
                                disabled={loading}
                                className="pl-8 pr-8 h-9 text-sm bg-white/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                disabled={loading}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-3.5 w-3.5" />
                                ) : (
                                    <Eye className="h-3.5 w-3.5" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Login As section removed as role is auto-detected */}

                    <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="rememberMe"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="h-3.5 w-3.5 rounded border-gray-300 text-primary focus:ring-primary"
                                disabled={loading}
                            />
                            <label
                                htmlFor="rememberMe"
                                className="text-xs cursor-pointer select-none text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Remember me
                            </label>
                        </div>
                        <Link
                            href="/forgot-password"
                            className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                        >
                            Forgot password?
                        </Link>
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-9 text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-blue-500/30 mt-1"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                Signing in...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                Sign In <ArrowRight className="h-3.5 w-3.5" />
                            </span>
                        )}
                    </Button>

                    <div className="relative my-3">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-200 dark:border-gray-800" />
                        </div>
                        <div className="relative flex justify-center text-[10px] uppercase">
                            <span className="bg-white dark:bg-gray-950 px-2 text-muted-foreground">
                                New to Varsity?
                            </span>
                        </div>
                    </div>

                    <Link href="/register" className="block">
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full h-8 text-xs font-semibold border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all duration-300"
                        >
                            Create Account
                        </Button>
                    </Link>
                </form>
            </CardContent>
        </Card>
    );
}
