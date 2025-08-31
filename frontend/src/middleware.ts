import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublicPath = path === '/login' || path === '/signup' || path==='/' || path === '/resetpassword' || path === '/forgot-password';

  // Get NextAuth token
  const nextAuthToken = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });

  // Enhanced token validation
  const hasValidToken = Boolean(
    nextAuthToken && 
    nextAuthToken.accessToken && 
    nextAuthToken.email && 
    nextAuthToken.id &&
    typeof nextAuthToken.exp === 'number' && 
    nextAuthToken.exp > Date.now() / 1000
  );

  // Check for NextAuth session cookie
  const sessionToken = request.cookies.get('next-auth.session-token') || 
                       request.cookies.get('__Secure-next-auth.session-token');
  
  const hasSessionCookie = Boolean(sessionToken?.value);
  
  // Check for CSRF token (additional security)
  const csrfToken = request.cookies.get('next-auth.csrf-token') || 
                    request.cookies.get('__Host-next-auth.csrf-token');
  
  // Final validation: require both valid JWT and session cookie
  // If cookies are manually deleted, hasSessionCookie will be false
  const hasToken = hasValidToken && hasSessionCookie;

  // Debug logging (remove in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('Middleware Debug:', {
      path,
      hasValidToken,
      hasSessionCookie,
      hasToken,
      tokenExists: !!nextAuthToken,
      tokenExp: nextAuthToken?.exp,
      currentTime: Date.now() / 1000
    });
  }

  // Handle auth-related API routes
  if (path.startsWith('/api/auth/')) {
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