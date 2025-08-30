import { Request, Response } from "express";
import { supabase } from "../Config/supabaseClient";
import { generateToken } from "../Utils/generateToken";

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
        url: req.url
    });

    const { code, access_token, refresh_token, error: oauthError, error_description } = req.query;
    
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

        if (code && typeof code === 'string') {
            // PKCE flow - exchange code for session
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);
            if (error) {
                console.error('OAuth callback error:', error);
                return res.redirect(`${process.env.CLIENT_URL}/login?error=${encodeURIComponent(error.message)}`);
            }
            sessionData = data;
            userData = data.user;
        } else if (access_token && typeof access_token === 'string') {
            // Implicit flow - get user from access token
            const { data: userResponse, error: userError } = await supabase.auth.getUser(access_token);
            if (userError || !userResponse.user) {
                console.error('Failed to get user from access token:', userError);
                return res.redirect(`${process.env.CLIENT_URL}/login?error=user_not_found`);
            }
            userData = userResponse.user;
            sessionData = { user: userData };
        }

        if (!userData) {
            console.error('No user data available');
            return res.redirect(`${process.env.CLIENT_URL}/login?error=user_not_found`);
        }



        const token = generateToken({
            email: userData.email || "", id: userData.id
        });
        //  console.log(token)
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            path: '/',
        });
        res.cookie('auth-token', token, {
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            path: '/',
        });
        // let user_Login_Data = {
        //     id: data.user.id,
        //     email: data.user.email,
        //     name: data.user.user_metadata.name,
        //     accessToken: token
        // }

        return res.redirect(`${process.env.CLIENT_URL}/dashboard`);
        // return res.status(200).json({ message: "Login successful", user_Login_Data });
    } catch (error: any) {
        console.error('OAuth callback error:', error);
        return res.redirect(`${process.env.CLIENT_URL}/login?error=${encodeURIComponent(error.message)}`);
    }
}