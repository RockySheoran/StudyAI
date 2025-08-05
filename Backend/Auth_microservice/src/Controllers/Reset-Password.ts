import { Request, Response } from "express";
import { supabase } from "../Config/supabaseClient";

export const Reset_Password = async (req: Request, res: Response): Promise<any> => {
    const { password, code } = req.body;
    console.log("code",code)
    console.log("password",password)
    
    if (!password || !code) {
        return res.status(400).json({ message: "Password and code are required" });
    }

    try {
        // First set the session with the access token
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        console.log("sessionData",data)
        console.log("sessionError",error)
        if (!error) {
            console.error("Code verification error:", error?.message);
            return res.status(400).json({ 
                message: "Invalid or expired reset code. Please request a new password reset link." 
            });
        }

        // Now update the password
        const { data: updateData, error: updateError } = await supabase.auth.updateUser({
            password
        });

        if (updateError) {
            return res.status(400).json({ 
                message: updateError.message || "Failed to update password" 
            });
        }

        return res.status(200).json({ 
            message: "Password reset successfully",
            
        });
    } catch (error) {
        console.error("Reset password error:", error);
        return res.status(400).json({ 
            message: "Failed to reset password. The link may have expired or is invalid." 
        });
    }
}