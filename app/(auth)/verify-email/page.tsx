'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { generateOTP } from '@/lib/security';
import { Mail, Clock } from 'lucide-react';

interface User {
    email: string;
    verified: boolean;
    [key: string]: string | boolean | number;
}

export default function VerifyEmailPage() {
    const router = useRouter();
    const { addToast } = useToast();
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(60);
    const canResend = resendTimer === 0;
    const [storedOTP] = useState(() => {
        const otp = generateOTP();
        console.log('Verification code (in real app, sent via email):', otp);
        return otp;
    });

    useEffect(() => {
        // Notify user about OTP on mount
        addToast(`Verification code sent! (Demo: ${storedOTP})`, 'info');
    }, [storedOTP, addToast]);

    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(
                () => setResendTimer(resendTimer - 1),
                1000
            );
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        setTimeout(() => {
            if (code === storedOTP) {
                // Mark user as verified
                const users = JSON.parse(
                    localStorage.getItem('registered_users') || '[]'
                );
                const email = localStorage.getItem(
                    'pending_verification_email'
                );

                const userIndex = users.findIndex(
                    (u: User) => u.email === email
                );
                if (userIndex !== -1) {
                    users[userIndex].verified = true;
                    localStorage.setItem(
                        'registered_users',
                        JSON.stringify(users)
                    );
                    localStorage.removeItem('pending_verification_email');
                }

                addToast('Email verified successfully!', 'success');
                setTimeout(() => router.push('/login'), 1500);
            } else {
                addToast(
                    'Invalid verification code. Please try again.',
                    'error'
                );
            }
            setLoading(false);
        }, 1000);
    };

    const handleResend = () => {
        // Note: In a real app, you would generate a new OTP and send it via email
        // For now, this is a demo that just resets the timer
        const newOTP = generateOTP();
        console.log('New verification code:', newOTP);
        addToast(`New code sent! (Demo: ${newOTP})`, 'info');
        setResendTimer(60);
    };

    return (
        <div className="min-h-screen flex items-center justify-center gradient-university-radial p-4">
            <Card className="w-full max-w-md shadow-premium-lg">
                <CardHeader className="text-center">
                    <div className="mx-auto w-16 h-16 gradient-university rounded-full flex items-center justify-center mb-4">
                        <Mail className="text-white h-8 w-8" />
                    </div>
                    <CardTitle className="text-2xl">
                        Verify Your Email
                    </CardTitle>
                    <CardDescription>
                        We&apos;ve sent a 6-digit code to your email address
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleVerify} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Verification Code
                            </label>
                            <Input
                                type="text"
                                placeholder="000000"
                                value={code}
                                onChange={(e) =>
                                    setCode(
                                        e.target.value
                                            .replace(/\D/g, '')
                                            .slice(0, 6)
                                    )
                                }
                                maxLength={6}
                                className="text-center text-2xl tracking-widest font-mono"
                                required
                            />
                            <p className="text-xs text-muted-foreground text-center">
                                Enter the 6-digit code sent to your email
                            </p>
                        </div>

                        <Button
                            type="submit"
                            className="w-full gradient-university text-white"
                            disabled={loading || code.length !== 6}
                        >
                            {loading ? 'Verifying...' : 'Verify Email'}
                        </Button>

                        <div className="text-center space-y-2">
                            <p className="text-sm text-muted-foreground">
                                Didn&apos;t receive the code?
                            </p>
                            {canResend ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleResend}
                                    className="w-full"
                                >
                                    Resend Code
                                </Button>
                            ) : (
                                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    <span>Resend in {resendTimer}s</span>
                                </div>
                            )}
                        </div>

                        <div className="text-center">
                            <Link
                                href="/login"
                                className="text-sm text-primary hover:underline"
                            >
                                Back to Login
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
