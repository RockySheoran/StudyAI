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

    const { code, error: oauthError, error_description } = req.query;
    
    

    if (oauthError) {
        console.error('OAuth callback error:', { oauthError, error_description });
        return res.redirect(`${process.env.CLIENT_URL}/login?error=${encodeURIComponent(error_description as string || 'OAuth failed')}`);
    }

    if (!code || typeof code !== 'string') {
        console.error('Invalid authorization code:', code);
        return res.redirect(`${process.env.CLIENT_URL}/login?error=invalid_auth_code`);
    }
    try {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
            console.error('OAuth callback error:', error);
            return res.redirect(`${process.env.CLIENT_URL}/login?error=${encodeURIComponent(error.message)}`);
        }

        const { data: userData, error: userError } = await supabase.auth.getUser(data.session.access_token);

        if (userError || !userData.user) {
            console.error('Failed to get user:', userError);
            return res.redirect(`${process.env.CLIENT_URL}/login?error=user_not_found`);
        }
        let user = userData.user;



        const token = generateToken({
            email: data.user.email || "", id: data.user.id

        });
        //  console.log(token)
        // Cookie configuration for cross-domain production deployment
        const cookieOptions = {
            httpOnly: true,
            secure: true, // Always secure for production
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            sameSite: 'none' as const, // Required for cross-domain cookies
            path: '/',
        };

        const publicCookieOptions = {
            secure: true, // Always secure for production
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: 'none' as const, // Required for cross-domain cookies
            path: '/',
        };

        res.cookie('token', token, cookieOptions);
        res.cookie('auth-token', token, publicCookieOptions);
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