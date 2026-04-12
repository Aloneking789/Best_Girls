import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get token from cookies or headers
  const token = request.cookies.get('kvgittoken')?.value;

  // List of public routes (routes that don't require authentication)
  const publicRoutes = ['/login'];
  const pathname = request.nextUrl.pathname;

  // Check if current route is public
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // If user is on login page and has token, redirect to home
  if (isPublicRoute && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If user is not on login page and doesn't have token, redirect to login
  if (!isPublicRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
