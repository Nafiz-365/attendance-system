import { hash, compare } from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const key = new TextEncoder().encode(SECRET_KEY);

export async function hashPassword(password: string) {
    return await hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
    return await compare(password, hash);
}

export async function signJWT(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(key);
}

export async function verifyJWT(token: string) {
    try {
        const { payload } = await jwtVerify(token, key);
        return payload;
    } catch (error) {
        return null;
    }
}

export async function getSession(request: Request) {
    const cookieHeader = request.headers.get('Cookie');
    if (!cookieHeader) return null;

    const token = cookieHeader.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1];
    if (!token) return null;

    return await verifyJWT(token);
}
