import { Request, Response } from "express";
import { supabase } from "../Config/supabaseClient";
import { generateToken } from "../Utils/generateToken";
import { Domain } from "domain";

export const Google_Github_login = async (req: Request, res: Response): Promise<any> => {

    const { provider } = req.params;

    if (!['google', 'github'].includes(provider)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid provider',
        });
    }
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: provider as 'google' | 'github',
            options: {
                redirectTo: `${process.env.CLIENT_URL}/auth/callback`,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
                skipBrowserRedirect: false,
            },
        })

        if (error || !data.url) {
            console.error('Provider login error:', error);
            return res.status(400).json({
                success: false,
                message: error?.message || 'Failed to initiate OAuth login',
            });
        }

        // res.redirect(data.url);
        return res.status(200).json({
            success: true,
            url: data.url,
        });


    } catch (error) {
        console.error('Provider login error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }

}


export const Login_callback = async (req: Request, res: Response): Promise<any> => {
    console.log('OAuth callback received:', {
        query: req.query,
        headers: req.headers,
        url: req.url,
        method: req.method
    });

    const { code, access_token, refresh_token, error: oauthError, error_description } = req.query;
    
    console.log('Extracted parameters:', {
        code: code ? 'present' : 'missing',
        access_token: access_token ? 'present' : 'missing',
        refresh_token: refresh_token ? 'present' : 'missing',
        oauthError,
        error_description
    });

    if (oauthError) {
        console.error('OAuth callback error:', { oauthError, error_description });
        return res.redirect(`${process.env.CLIENT_URL}/login?error=${encodeURIComponent(error_description as string || 'OAuth failed')}`);
    }

    // Handle both code flow and implicit flow
    if (!code && !access_token) {
        console.error('No authorization code or access token received');
        return res.redirect(`${process.env.CLIENT_URL}/login?error=invalid_auth_response`);
    }

    try {
        let sessionData;
        let userData;

        console.log('Processing authentication flow...');

        if (code && typeof code === 'string') {
            console.log('Using PKCE flow with authorization code');
            // PKCE flow - exchange code for session
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);
            if (error) {
                console.error('OAuth callback error:', error);
                return res.redirect(`${process.env.CLIENT_URL}/login?error=${encodeURIComponent(error.message)}`);
            }
            sessionData = data;
            userData = data.user;
            console.log('PKCE flow successful, user data:', { id: userData?.id, email: userData?.email });
        } else if (access_token && typeof access_token === 'string') {
            console.log('Using implicit flow with access token');
            // Implicit flow - get user from access token
            const { data: userResponse, error: userError } = await supabase.auth.getUser(access_token);
            if (userError || !userResponse.user) {
                console.error('Failed to get user from access token:', userError);
                return res.redirect(`${process.env.CLIENT_URL}/login?error=user_not_found`);
            }
            userData = userResponse.user;
            sessionData = { user: userData };
            console.log('Implicit flow successful, user data:', { id: userData?.id, email: userData?.email });
        }

        if (!userData) {
            console.error('No user data available after authentication');
            return res.redirect(`${process.env.CLIENT_URL}/login?error=user_not_found`);
        }

        console.log('Generating JWT token for user:', userData.id);
        const token = generateToken({
            email: userData.email || "", 
            id: userData.id
        });
        console.log('JWT token generated successfully');
        //  console.log(token)
        // Try multiple cookie strategies for cross-domain compatibility
        const cookieOptions = {
            secure: true,
            Domain:process.env.CLIENT_URL ,
            sameSite: 'none' as const,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            path: '/',
        };

        console.log('Setting cookies with options:', cookieOptions);

        // Set httpOnly cookie for server-side access
        res.cookie('token', token, {
            ...cookieOptions,
            httpOnly: true,
        });

        // Set non-httpOnly cookie for client-side access
        res.cookie('auth-token', token, cookieOptions);

        // Also try setting with explicit domain
        const frontendDomain = process.env.CLIENT_URL?.replace(/https?:\/\//, '').replace(/:\d+$/, '');
        if (frontendDomain) {
            res.cookie('auth-token-domain', token, {
                ...cookieOptions,
                domain: `.${frontendDomain}`,
            });
        }

        // Set a simple test cookie to verify cookie setting works
        res.cookie('test-cookie', 'working', {
            secure: true,
            sameSite: 'none' as const,
            maxAge: 60000, // 1 minute
            path: '/',
        });

        console.log('Cookies set successfully, redirecting to dashboard');
        
        // Fallback: Pass token in URL if cookies fail
        const redirectUrl = `${process.env.CLIENT_URL}/dashboard?token=${encodeURIComponent(token)}&auth=success`;
        console.log('Redirect URL:', redirectUrl);

        // Set additional headers for better redirect handling
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        return res.redirect(302, redirectUrl);
    } catch (error: any) {
        console.error('OAuth callback error:', error);
        console.error('Error stack:', error.stack);
        return res.redirect(`${process.env.CLIENT_URL}/login?error=${encodeURIComponent(error.message)}`);
    }
}