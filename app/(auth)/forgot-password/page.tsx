"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { Mail, ArrowLeft, Send } from "lucide-react"

export default function ForgotPasswordPage() {
    const router = useRouter()
    const { addToast } = useToast()
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [emailSent, setEmailSent] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        // Simulate sending reset email
        setTimeout(() => {
            setEmailSent(true)
            addToast("Password reset link sent to your email!", "success")
            setLoading(false)
        }, 1500)
    }

    if (emailSent) {
        return (
            <div className="min-h-screen flex items-center justify-center gradient-university-radial p-4">
                <Card className="w-full max-w-md shadow-premium-lg">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
                            <Send className="text-green-600 dark:text-green-400 h-8 w-8" />
                        </div>
                        <CardTitle className="text-2xl">Check Your Email</CardTitle>
                        <CardDescription>
                            We've sent a password reset link to <strong>{email}</strong>
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
                            <p>📧 Check your inbox for the reset link</p>
                            <p>⏰ The link will expire in 1 hour</p>
                            <p>📁 Check spam folder if not found</p>
                        </div>

                        <Button
                            onClick={() => setEmailSent(false)}
                            variant="outline"
                            className="w-full"
                        >
                            Try Different Email
                        </Button>

                        <div className="text-center">
                            <Link href="/login" className="text-sm text-primary hover:underline">
                                Back to Login
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center gradient-university-radial p-4">
            <Card className="w-full max-w-md shadow-premium-lg">
                <CardHeader className="text-center">
                    <div className="mx-auto w-16 h-16 gradient-university rounded-full flex items-center justify-center mb-4">
                        <Mail className="text-white h-8 w-8" />
                    </div>
                    <CardTitle className="text-2xl">Forgot Password?</CardTitle>
                    <CardDescription>
                        No worries! Enter your email and we'll send you a reset link
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email Address</label>
                            <Input
                                type="email"
                                placeholder="your.email@university.edu"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full gradient-university text-white"
                            disabled={loading}
                        >
                            {loading ? "Sending..." : "Send Reset Link"}
                        </Button>

                        <div className="text-center">
                            <Link href="/login" className="text-sm text-primary hover:underline flex items-center justify-center gap-1">
                                <ArrowLeft className="h-4 w-4" />
                                Back to Login
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
