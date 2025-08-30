"use server"
import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

export const Token_get = async () => {
  try {
    // First try to get token from NextAuth session
    const session = await getServerSession(authOptions);
    
    if (session?.accessToken) {
      console.log('Token found in NextAuth session');
      return session.accessToken;
    }
    
    // Fallback to cookies for backward compatibility
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-token')?.value;
    const token = cookieStore.get('token')?.value;
    
    console.log('Server-side token check:', {
      hasSessionToken: !!session?.accessToken,
      hasAuthToken: !!authToken,
      hasToken: !!token,
      sessionUser: session?.user?.email || 'No user'
    });
    
    // Return NextAuth token, auth-token, or fallback token
    return session?.accessToken || authToken || token;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
}

export const User_get = async () => {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      console.log('No active session found');
      return null;
    }
    
    return {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      profile: session.user.profile,
      accessToken: session.accessToken
    };
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}