import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function POST(request: NextRequest) {
  try {
    // Get the current token
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });

    // Create response
    const response = NextResponse.json({ 
      success: true, 
      message: 'Logged out successfully' 
    });

    // Clear all NextAuth cookies
    const cookiesToClear = [
      'next-auth.session-token',
      '__Secure-next-auth.session-token',
      'next-auth.csrf-token',
      '__Host-next-auth.csrf-token',
      'next-auth.callback-url',
      '__Secure-next-auth.callback-url'
    ];

    cookiesToClear.forEach(cookieName => {
      response.cookies.set(cookieName, '', {
        expires: new Date(0),
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, message: 'Logout failed' },
      { status: 500 }
    );
  }
}
