"use server"
import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

/**
 * Server-side function to retrieve authentication token from NextAuth session or cookies
 * @returns Promise containing the authentication token or null if not found
 */
export const Token_get = async () => {
  try {
    // First try to get token from NextAuth session
    const session = await getServerSession(authOptions);
    
    if (session?.accessToken) {
      return session.accessToken;
    }
    
    // Fallback to cookies for backward compatibility
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-token')?.value;
    const token = cookieStore.get('token')?.value;
    
    // Return NextAuth token, auth-token, or fallback token
    return session?.accessToken || authToken || token;
  } catch (error) {
    return null;
  }
}

/**
 * Server-side function to retrieve current user data from NextAuth session
 * @returns Promise containing user data object or null if no session exists
 */
export const User_get = async () => {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
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
    return null;
  }
}