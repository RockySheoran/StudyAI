import { Request, Response } from "express";
import { supabase } from "../Config/supabaseClient";

export const Forget_Password = async (req: Request, res: Response): Promise<any> => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${process.env.CLIENT_URL}/reset-password`
        });

        if (error) {
            console.error("Password reset error:", error.message);
            return res.status(400).json({ message: error.message });
        }
        
        // Always return the same message regardless of whether email exists
        return res.status(200).json({ 
            message: "If an account exists with this email, you'll receive a password reset link" 
        });
    } catch (error) {
        console.error("Server error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}