import { NextResponse, NextRequest } from "next/server";
import {  getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublicPath = path === '/login' || path === '/signup' || path==='/' || path === '/resetpassword' || path === '/forgot-password';

 
 

  // Also check for NextAuth token
  const nextAuthToken = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });



  const hasToken = nextAuthToken?.accessToken;


  // Handle Google auth callback
  if (path.startsWith('/api/auth/callback')) {
    return NextResponse.next();
  }

  // Redirect logic
  if (isPublicPath && hasToken) {
    return NextResponse.redirect(new URL('/dashboard', request.nextUrl));
  }

  if (!isPublicPath && !hasToken && path !== '/') {
    return NextResponse.redirect(new URL('/login', request.nextUrl));
  }

  if (!isPublicPath && !hasToken) {
    return NextResponse.redirect(new URL('/', request.nextUrl));
  }

}

export const config = {
  matcher: [
    '/',
    '/login',
    '/signup',
    '/resetpassword',
    '/forgot-password',
    '/dashboard',
    '/api/auth/callback', 
    '/interviews/:path*',
    '/current-affairs/:path*',
    '/topics/:path*',
    '/quiz_qna/:path*',
    '/summary/:path*',
  ]
}