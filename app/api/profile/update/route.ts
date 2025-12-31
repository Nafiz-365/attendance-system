import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { id, image } = body;

        if (!id) {
            return NextResponse.json({ error: 'Missing id' }, { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { id: Number(id) },
            data: {
                image: image as string
            } as any,
        });

        // Strip password
        const { password, ...userWithoutPassword } = updatedUser;

        return NextResponse.json(userWithoutPassword);
    } catch (error) {
        console.error("Profile update error:", error);
        return NextResponse.json({ error: 'Internal Server Error', details: String(error) }, { status: 500 });
    }
}
