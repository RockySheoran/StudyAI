import { Request, Response } from "express";
import { UserModel } from "../Models/UserModel";
import bcrypt from "bcrypt";
import { generateToken } from "../Utils/generateToken";

export const Login = async (req: Request, res: Response): Promise<any> => {
    const { email, password } = req.body;
    console.log(email, password)
    try {
        const findUser = await UserModel.findOne({ email: email })
        
        if (!findUser) {
            return res.status(400).json({ message: "User not found" });
        }

        if(!findUser?.password){
            return res.status(400).json({ message: "Invalid credentials" });
        }
        if(findUser.isEmailVerified == false){
            return res.status(400).json({ message: "User email is not verified please SignUp" });
        }
        
        const isPasswordValid = await bcrypt.compare(password, findUser?.password);
        
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Check if email is verified for email provider users
        if (findUser.provider.includes("email") && !findUser.isEmailVerified) {
            return res.status(400).json({ 
                message: "Please verify your email address before logging in. Check your inbox for the verification link.",
                requiresVerification: true 
            });
        }
        const token = generateToken({ email: email, id: findUser._id.toString() });
        const cookieOptions = {
            secure: true, // Always true for production HTTPS
            sameSite: 'none' as const, // Required for cross-domain
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            path: '/',
        };

        res.cookie('token', token, {
            ...cookieOptions,
            httpOnly: true,
        });
    
        const userData = {
            id: findUser._id.toString(),
            email: findUser.email,
            name: findUser.name,
            accessToken: token
        }
        return res.status(200).json({ message: "Login successful", userData });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error });
    }
}