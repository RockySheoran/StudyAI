import { Request, Response } from "express";
import { supabase } from "../Config/supabaseClient";
import { generateToken } from "../Utils/generateToken";

export const Login = async (req: Request, res: Response): Promise<any> => {
    const { email, password } = req.body;
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        })
        if (error) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const token = generateToken({ email: email, id: data.user.id });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 * 7, // 7 days
            sameSite: 'lax',
        });


        return res.status(200).json({ message: "Login successful", data });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error });
    }
}