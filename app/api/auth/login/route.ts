import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, signJWT } from '@/lib/auth';


export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Verify password
        const isValid = await verifyPassword(password, user.password);
        if (!isValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Generate Token with role
        const token = await signJWT({
            userId: user.id,
            email: user.email,
            role: user.role
        });

        // Set Cookie
        const response = NextResponse.json({
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                image: user.image
            },
        });

        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 86400, // 1 day
            path: '/',
        });

        return response;

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
