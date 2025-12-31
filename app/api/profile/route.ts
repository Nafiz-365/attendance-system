import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession, hashPassword, verifyPassword } from '@/lib/auth';

export async function GET(request: Request) {
    const session = await getSession(request);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: parseInt(String(session.userId)) },
            select: {
                id: true,
                email: true,
                name: true,
                image: true,
                role: true
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('Profile Fetch Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    const session = await getSession(request);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { name, email, currentPassword, newPassword, image } = body;

        const user = await prisma.user.findUnique({
            where: { id: parseInt(String(session.userId)) }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const updates: any = {};

        if (name) updates.name = name;
        if (email) {
            // Check uniqueness if email is changing
            if (email !== user.email) {
                const existingInfo = await prisma.user.findUnique({ where: { email } });
                if (existingInfo) {
                    return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
                }
                updates.email = email;
            }
        }

        if (image !== undefined) {
            updates.image = image; // Allow setting to null or a URL
        }

        if (newPassword) {
            if (!currentPassword) {
                return NextResponse.json({ error: 'Current password is required to set new password' }, { status: 400 });
            }

            const isValid = await verifyPassword(currentPassword, user.password);
            if (!isValid) {
                return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
            }

            updates.password = await hashPassword(newPassword);
        }

        const updatedUser = await prisma.user.update({
            where: { id: parseInt(String(session.userId)) },
            data: updates,
            select: {
                id: true,
                email: true,
                name: true,
                image: true,
                role: true
            }
        });

        return NextResponse.json(updatedUser);

    } catch (error) {
        console.error('Profile Update Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
