import { Request, Response } from "express";
import { supabase } from "../Config/supabaseClient";
import { generateToken } from "../Utils/generateToken";

export const Google_Github_login = async (req: Request, res: Response): Promise<any> => {

    const { provider } = req.params;
    console.log(provider)
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
                redirectTo: `${process.env.BACKEND_URL}/api/auth/callback`,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
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
    const { code, error: oauthError, error_description } = req.query;
    // console.log(code, oauthError, error_description);
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

        // if (!user) {
        //     // Create new user directly in Auth system
        //     const { data: createdUser, error: createError } = await supabase.auth.admin.createUser({
        //         id: userData.user.id,
        //         email: userData.user.email || `${userData.user.id}@${userData.user.app_metadata?.provider || 'oauth'}.com`,
        //         user_metadata: {
        //             name: userData.user.user_metadata?.name ||
        //                 userData.user.user_metadata?.full_name ||
        //                 userData.user.email?.split('@')[0] ||
        //                 'User',
        //             avatar_url: userData.user.user_metadata?.avatar_url ||
        //                 userData.user.user_metadata?.picture ||
        //                 null
        //         },
        //         app_metadata: {
        //             provider: userData.user.app_metadata?.provider || 'oauth'
        //         },
        //         email_confirm: true // Mark email as confirmed if coming from OAuth
        //     });

        //     if (createError || !createdUser) {
        //         console.error('Failed to create user in Auth system:', createError);
        //         return res.redirect(`${process.env.CLIENT_URL}/login?error=user_creation_failed`);
        //     }

        //     // user = createdUser.user;
        //     console.log(createdUser)
        // }

        const token = generateToken({ email: data.user.email || "", id: data.user.id });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 * 7, // 7 days
            sameSite: 'lax',
        });

        return res.redirect(`${process.env.CLIENT_URL}/dashboard`);
    } catch (error: any) {
        console.error('OAuth callback error:', error);
        return res.redirect(`${process.env.CLIENT_URL}/login?error=${encodeURIComponent(error.message)}`);
    }
}