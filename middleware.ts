import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protected routes
  const isStudentRoute = pathname.startsWith('/student');
  const isTeacherRoute = pathname.startsWith('/teacher');
  const isAdminRoute = pathname.startsWith('/admin');
  const isProtectedRoute = isStudentRoute || isTeacherRoute || isAdminRoute;

  if (isProtectedRoute) {
    // Get token from cookies
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Verify token
    const payload = await verifyJWT(token);

    if (!payload) {
      // Token is invalid
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Check role-based access
    const userRole = payload.role as string;

    // Student trying to access non-student routes
    if (userRole === 'STUDENT' && !isStudentRoute) {
      return NextResponse.redirect(new URL('/student/dashboard', request.url));
    }

    // Teacher trying to access non-teacher routes
    if (userRole === 'TEACHER' && !isTeacherRoute) {
      return NextResponse.redirect(new URL('/teacher/dashboard', request.url));
    }

    // Admin trying to access non-admin routes
    if (userRole === 'ADMIN' && !isAdminRoute) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }

    // Valid token and correct role, proceed
    return NextResponse.next();
  }

  // Allow other routes (login, register, etc.)
  return NextResponse.next();
}

export const config = {
  matcher: ['/student/:path*', '/teacher/:path*', '/admin/:path*'],
};
