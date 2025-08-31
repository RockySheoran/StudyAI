'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useUserStore } from '@/lib/Store/userStore';

export default function SessionValidator() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { clearUser, clearToken } = useUserStore();

  useEffect(() => {
    // Check session status every 5 seconds
    const intervalId = setInterval(() => {
      // If session is loading, skip validation
      if (status === 'loading') return;

      // If no session exists but we're not on a public page, redirect to login
      if (status === 'unauthenticated' || !session) {
        const currentPath = window.location.pathname;
        const isPublicPath = ['/login', '/signup', '/', '/forgot-password', '/reset-password'].includes(currentPath);
        
        if (!isPublicPath) {
          console.log('Session invalid, redirecting to login');
          clearUser();
          clearToken();
          router.push('/login');
        }
      }

      // Additional validation: check if session has required properties
      if (session && (!session.accessToken || !session.user?.id || !session.user?.email)) {
        console.log('Session missing required properties, redirecting to login');
        clearUser();
        clearToken();
        router.push('/login');
      }
    }, 5000); // Check every 5 seconds

    // Also check immediately on mount
    if (status !== 'loading') {
      const currentPath = window.location.pathname;
      const isPublicPath = ['/login', '/signup', '/', '/forgot-password', '/reset-password'].includes(currentPath);
      
      if ((status === 'unauthenticated' || !session) && !isPublicPath) {
        clearUser();
        clearToken();
        router.push('/login');
      }
    }

    return () => clearInterval(intervalId);
  }, [session, status, router, clearUser, clearToken]);

  return null; // This component doesn't render anything
}
