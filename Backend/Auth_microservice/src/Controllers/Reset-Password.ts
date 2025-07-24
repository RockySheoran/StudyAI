import { Request, Response } from "express";
import { supabase } from "../Config/supabaseClient";

export const Reset_Password = async (req: Request, res: Response): Promise<any> => {
    const { password, access_token } = req.body;
    
    if (!password || !access_token) {
        return res.status(400).json({ message: "Password and access token are required" });
    }

    try {
        // First set the session with the access token
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token,
            refresh_token: "" // Refresh token might not be available
        });

        if (sessionError) throw sessionError;

        // Then update the password
        const { data, error } = await supabase.auth.updateUser({
            password
        });

        if (error) throw error;

        return res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        console.error("Reset password error:", error);
        return res.status(400).json({ 
            message: "Failed to reset password. The link may have expired or is invalid." 
        });
    }
}