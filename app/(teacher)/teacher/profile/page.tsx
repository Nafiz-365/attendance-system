'use client';

import { useEffect, useState, useRef } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Loader2,
    Mail,
    Briefcase,
    Calendar,
    User,
    GraduationCap,
    Building2,
    Camera,
    Trash2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ImageCropper } from '@/components/image-cropper';
import { useToast } from '@/components/ui/toast';

interface TeacherUser {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    department?: { name: string };
    role: string;
}

export default function TeacherProfilePage() {
    const [user, setUser] = useState<TeacherUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [isCropperOpen, setIsCropperOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { addToast } = useToast();

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            setUser(JSON.parse(userStr));
        }
        setLoading(false);
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setImageSrc(reader.result?.toString() || null);
                setIsCropperOpen(true);
            });
            reader.readAsDataURL(file);
        }
    };

    const handleCropComplete = async (croppedBlob: Blob) => {
        try {
            if (!user) throw new Error('User not found');

            const formData = new FormData();
            formData.append('file', croppedBlob, 'profile-pic.jpg');

            const uploadRes = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            if (!uploadRes.ok) throw new Error('Upload failed');
            const { imageUrl } = await uploadRes.json();

            const updateRes = await fetch('/api/profile/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: user.id, image: imageUrl }),
            });

            if (!updateRes.ok) {
                const err = await updateRes.json();
                throw new Error(err.details || err.error || 'Update failed');
            }

            const updatedUser = { ...user, image: imageUrl };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));

            setIsCropperOpen(false);
            setImageSrc(null);

            addToast('Profile picture updated.', 'success');
            window.dispatchEvent(new Event('storage'));
        } catch (error: Error | unknown) {
            console.error('Profile Update Error:', error);
            const errorMessage =
                error instanceof Error ? error.message : 'Unknown error';
            addToast(`Failed: ${errorMessage}`, 'error');
        }
    };

    if (loading)
        return (
            <div className="p-8 flex justify-center">
                <Loader2 className="animate-spin h-8 w-8 text-primary" />
            </div>
        );

    if (!user) return <div className="p-8">User not found.</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            <div>
                <h2 className="text-3xl font-bold tracking-tight vibe-text-silver">
                    Teacher Profile
                </h2>
                <p className="text-muted-foreground">
                    Manage your faculty account details
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
                {/* Profile Card */}
                <Card className="glass-card border-slate-300/30 shadow-slate-500/10">
                    <CardHeader className="text-center relative">
                        <div className="relative mx-auto w-32 h-32 mb-4 group">
                            {user.image ? (
                                <img
                                    src={user.image}
                                    alt="Profile"
                                    className="w-full h-full rounded-full object-cover ring-4 ring-slate-300/30 shadow-xl shadow-slate-500/20"
                                />
                            ) : (
                                <div className="w-full h-full rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center ring-4 ring-slate-300/30 shadow-xl shadow-slate-500/20">
                                    <span className="text-5xl font-bold text-slate-600 dark:text-slate-300">
                                        {user.name?.charAt(0) || 'T'}
                                    </span>
                                </div>
                            )}

                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-0 right-0 p-2 bg-slate-500 text-white rounded-full hover:bg-slate-600 transition-colors shadow-lg opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 duration-200"
                            >
                                <Camera className="w-4 h-4" />
                            </button>

                            {user.image && (
                                <button
                                    onClick={async () => {
                                        if (
                                            !confirm(
                                                'Are you sure you want to remove your profile picture?'
                                            )
                                        )
                                            return;

                                        try {
                                            const res = await fetch(
                                                '/api/profile/update',
                                                {
                                                    method: 'PUT',
                                                    headers: {
                                                        'Content-Type':
                                                            'application/json',
                                                    },
                                                    body: JSON.stringify({
                                                        id: user.id,
                                                        image: null,
                                                    }),
                                                }
                                            );

                                            if (res.ok) {
                                                const newUser = {
                                                    ...user,
                                                    image: null,
                                                };
                                                setUser(newUser);
                                                localStorage.setItem(
                                                    'user',
                                                    JSON.stringify(newUser)
                                                );
                                                addToast(
                                                    'Profile picture removed successfully',
                                                    'success'
                                                );
                                                window.dispatchEvent(
                                                    new Event('storage')
                                                );
                                            } else {
                                                throw new Error(
                                                    'Failed to update'
                                                );
                                            }
                                        } catch (error) {
                                            console.error(
                                                'Delete error:',
                                                error
                                            );
                                            addToast(
                                                'Failed to remove picture',
                                                'error'
                                            );
                                        }
                                    }}
                                    className="absolute top-0 right-0 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all shadow-lg opacity-0 group-hover:opacity-100 transform -translate-y-1 translate-x-1 group-hover:translate-y-0 group-hover:translate-x-0 duration-200 hover:scale-110"
                                    title="Remove Photo"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileSelect}
                            />
                        </div>

                        <CardTitle className="vibe-text-silver text-xl">
                            {user.name || 'Teacher'}
                        </CardTitle>
                        <CardDescription>Faculty Member</CardDescription>
                        <div className="flex justify-center mt-2">
                            <Badge
                                variant="secondary"
                                className="bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                            >
                                <GraduationCap className="w-3 h-3 mr-1" />{' '}
                                Faculty
                            </Badge>
                        </div>
                    </CardHeader>
                </Card>

                {/* Details Card */}
                <Card className="glass-card border-slate-300/30 shadow-slate-500/10">
                    <CardHeader>
                        <CardTitle>Account Information</CardTitle>
                        <CardDescription>
                            Your personal and academic details.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label>Full Name</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    value={user.name || ''}
                                    disabled
                                    className="pl-9 bg-muted/50"
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    value={user.email || ''}
                                    disabled
                                    className="pl-9 bg-muted/50"
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>Department</Label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    value={
                                        user.department?.name ||
                                        'Computer Science'
                                    }
                                    disabled
                                    className="pl-9 bg-muted/50"
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>Role</Label>
                            <div className="relative">
                                <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    value={user.role || 'TEACHER'}
                                    disabled
                                    className="pl-9 bg-muted/50"
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>Account Status</Label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    value="Active"
                                    disabled
                                    className="pl-9 bg-muted/50 text-green-600 font-medium"
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t">
                            <p className="text-xs text-muted-foreground text-center">
                                To update personal details, please contact the
                                Administration department.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <ImageCropper
                open={isCropperOpen}
                imageSrc={imageSrc}
                onCancel={() => setIsCropperOpen(false)}
                onCropComplete={handleCropComplete}
            />
        </div>
    );
}
