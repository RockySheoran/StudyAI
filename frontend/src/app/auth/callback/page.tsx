'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthCallback() {
    const router = useRouter();

    useEffect(() => {
        const handleCallback = async () => {
            // Get code from URL (either as query param or hash)
            const urlParams = new URLSearchParams(window.location.search);
            const hashParams = new URLSearchParams(window.location.hash.substring(1));
            
            const code = urlParams.get('code') || hashParams.get('code');
            const error = urlParams.get('error') || hashParams.get('error');
            const errorDescription = urlParams.get('error_description') || hashParams.get('error_description');

            console.log('Frontend callback received:', { 
                code: code ? 'present' : 'missing', 
                error, 
                errorDescription,
                fullUrl: window.location.href 
            });

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
                const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://study-ai-mpot.vercel.app';
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
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                    Completing authentication...
                </p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
                    Redirecting to secure login...
                </p>
            </div>
        </div>
    );
}
