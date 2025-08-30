'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthCallback() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const handleCallback = async () => {
            // Get all query parameters
            const code = searchParams.get('code');
            const error = searchParams.get('error');
            const errorDescription = searchParams.get('error_description');

            if (error) {
                console.error('OAuth error:', { error, errorDescription });
                router.push(`/login?error=${encodeURIComponent(errorDescription || 'OAuth failed')}`);
                return;
            }

            if (!code) {
                console.error('No authorization code received');
                router.push('/login?error=invalid_auth_code');
                return;
            }

            try {
                // Forward the callback to your backend
                const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
                const callbackUrl = `${backendUrl}/api/auth/callback?code=${code}`;
                
                console.log('Forwarding to backend callback:', callbackUrl);
                
                // Use window.location to ensure cookies are set properly
                window.location.href = callbackUrl;
                
            } catch (error) {
                console.error('Callback forwarding error:', error);
                router.push('/login?error=callback_failed');
            }
        };

        handleCallback();
    }, [router, searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                    Completing authentication...
                </p>
            </div>
        </div>
    );
}
