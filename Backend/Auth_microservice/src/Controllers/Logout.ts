import { Request, Response } from "express";
import { supabase } from "../Config/supabaseClient";
export interface AuthRequest extends Request {
    user?: {
        id: string,
        email: string,
    }
}
export const Logout = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) {
            return res.status(400).json({ message: "Failed to sign out" });
        }
        console.log("User signed out successfully");
        res.clearCookie('token');
        res.clearCookie('auth-token');
        return res.status(200).json({ message: "User signed out successfully" });
    } catch (error:any) {
        console.log("Error signing out:", error);
        return res.status(500).json({ message: "Internal server error", error });
    }
}