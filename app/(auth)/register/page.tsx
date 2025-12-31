"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { PasswordStrength } from "@/components/ui/password-strength"
import { useToast } from "@/components/ui/toast"
import { validateEmail, validatePhone, validateStudentId } from "@/lib/validation"
import { GraduationCap, Eye, EyeOff, Loader2, User, Mail, Phone, Building, Briefcase, Lock, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

export default function RegisterPage() {
    const router = useRouter()
    const { addToast } = useToast()
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [acceptedTerms, setAcceptedTerms] = useState(false)

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        studentId: "",
        department: "",
        role: "",
        password: "",
        confirmPassword: "",
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const validateForm = () => {
        if (!formData.name.trim()) {
            addToast("Please enter your name", "error")
            return false
        }

        if (!validateEmail(formData.email)) {
            addToast("Please enter a valid email", "error")
            return false
        }

        if (formData.phone && !validatePhone(formData.phone)) {
            addToast("Please enter a valid phone number", "error")
            return false
        }

        if (formData.role === "student" && !validateStudentId(formData.studentId)) {
            addToast("Please enter a valid student ID", "error")
            return false
        }

        if (!formData.department) {
            addToast("Please select a department", "error")
            return false
        }

        if (!formData.role) {
            addToast("Please select a role", "error")
            return false
        }

        if (formData.password.length < 8) {
            addToast("Password must be at least 8 characters", "error")
            return false
        }

        if (formData.password !== formData.confirmPassword) {
            addToast("Passwords do not match", "error")
            return false
        }

        if (!acceptedTerms) {
            addToast("Please accept the Terms & Conditions", "error")
            return false
        }

        return true
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) return

        setLoading(true)

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            addToast("Account created successfully! Please login.", "success")
            router.push("/login")

        } catch (error: any) {
            addToast(error.message, "error")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="w-full max-w-2xl border-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

            <CardHeader className="space-y-2 pb-4 text-center relative z-10">
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="mx-auto w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform duration-500"
                >
                    <GraduationCap className="text-white w-7 h-7" />
                </motion.div>
                <div>
                    <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                        Create Account
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">
                        Join Varsity Portal today
                    </CardDescription>
                </div>
            </CardHeader>

            <CardContent className="relative z-10 p-5 pt-0">
                <form onSubmit={handleSubmit} className="space-y-3">
                    {/* Row 1: Name and Phone */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-xs font-medium ml-1">Full Name *</label>
                            <div className="relative group/input">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
                                <Input
                                    name="name"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="pl-9 h-9 bg-white/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-primary/20 transition-all duration-300 text-sm"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium ml-1">Phone</label>
                            <div className="relative group/input">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
                                <Input
                                    name="phone"
                                    type="tel"
                                    placeholder="01712345678"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="pl-9 h-9 bg-white/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-primary/20 transition-all duration-300 text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Row 2: Email */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium ml-1">Email *</label>
                        <div className="relative group/input">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
                            <Input
                                name="email"
                                type="email"
                                placeholder="john@university.edu"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="pl-9 h-9 bg-white/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-primary/20 transition-all duration-300 text-sm"
                            />
                        </div>
                    </div>

                    {/* Row 3: Role and Department */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-xs font-medium ml-1">Role *</label>
                            <div className="relative group/input">
                                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within/input:text-primary transition-colors z-10" />
                                <Select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleSelectChange}
                                    required
                                    className="pl-9 h-9 bg-white/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-primary/20 transition-all duration-300 text-sm"
                                >
                                    <option value="">Select role</option>
                                    <option value="STUDENT">Student</option>
                                    <option value="TEACHER">Teacher</option>
                                    <option value="ADMIN">Administrator</option>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium ml-1">Department *</label>
                            <div className="relative group/input">
                                <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within/input:text-primary transition-colors z-10" />
                                <Select
                                    name="department"
                                    value={formData.department}
                                    onChange={handleSelectChange}
                                    required
                                    className="pl-9 h-9 bg-white/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-primary/20 transition-all duration-300 text-sm"
                                >
                                    <option value="">Select department</option>
                                    <option value="cse">Computer Science & Engineering</option>
                                    <option value="eee">Electrical & Electronic Engineering</option>
                                    <option value="bba">Bachelor of Business Administration</option>
                                    <option value="ce">Civil Engineering</option>
                                    <option value="me">Mechanical Engineering</option>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Student ID (conditional) - Optimized */}
                    {formData.role === "STUDENT" && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            className="space-y-1 overflow-hidden"
                        >
                            <label className="text-xs font-medium ml-1">Student ID *</label>
                            <div className="relative group/input">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
                                <Input
                                    name="studentId"
                                    placeholder="CSE2021001"
                                    value={formData.studentId}
                                    onChange={handleChange}
                                    required
                                    className="pl-9 h-9 bg-white/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-primary/20 transition-all duration-300 text-sm"
                                />
                            </div>
                            <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md">
                                <p className="text-[10px] text-blue-700 dark:text-blue-300">
                                    ℹ️ Your Student ID and Email must be registered by your institution before you can create an account.
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* Row 4: Password and Confirm (Grid) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-xs font-medium ml-1">Password *</label>
                            <div className="relative group/input">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
                                <Input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="pl-9 pr-8 h-9 bg-white/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-primary/20 transition-all duration-300 text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium ml-1">Confirm *</label>
                            <div className="relative group/input">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
                                <Input
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    className="pl-9 pr-8 h-9 bg-white/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-primary/20 transition-all duration-300 text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* Password Strentgh and Error - Compact */}
                    <div className="space-y-1">
                        <PasswordStrength password={formData.password} />
                        {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                            <p className="text-[10px] text-red-500 ml-1">Passwords do not match</p>
                        )}
                    </div>

                    {/* Terms */}
                    <div className="flex items-start space-x-2 pt-1 ml-1">
                        <input
                            type="checkbox"
                            id="terms"
                            checked={acceptedTerms}
                            onChange={(e) => setAcceptedTerms(e.target.checked)}
                            className="h-3.5 w-3.5 rounded border-gray-300 text-primary focus:ring-primary mt-0.5"
                        />
                        <label htmlFor="terms" className="text-xs cursor-pointer select-none text-muted-foreground hover:text-foreground transition-colors">
                            I agree to the Terms & Conditions and Privacy Policy
                        </label>
                    </div>

                    {/* Submit */}
                    <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-10 text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-blue-500/30 mt-2"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Creating Account...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                Create Account <ArrowRight className="h-4 w-4" />
                            </span>
                        )}
                    </Button>

                    {/* Login Link */}
                    <div className="text-center text-xs pt-3">
                        <span className="text-muted-foreground">Already have an account? </span>
                        <Link href="/login" className="text-primary font-semibold hover:underline">
                            Sign In
                        </Link>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
