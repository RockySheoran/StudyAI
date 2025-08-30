"use server"
import { cookies } from 'next/headers';

export const Token_get = async () => {
  try {
    const cookieStore = await cookies();
    
    // Check for our custom auth tokens first
    const authToken = cookieStore.get('auth-token')?.value;
    const token = cookieStore.get('token')?.value;
    
    console.log('Server-side token check:', {
      hasAuthToken: !!authToken,
      hasToken: !!token,
      allCookies: cookieStore.getAll().map(c => ({ name: c.name, hasValue: !!c.value }))
    });
    
    // Return the auth-token (non-httpOnly) or token (httpOnly)
    return authToken || token;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
}