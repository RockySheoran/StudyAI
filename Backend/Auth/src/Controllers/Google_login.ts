import { Request, Response } from "express";
import { generateToken } from "../Utils/generateToken";
import { UserModel } from "../Models/UserModel";


export const Google_Login = async (req: Request, res: Response): Promise<any> => {
    const { name, email, authId, profile } = req.body;

    // Input validation
    if (!name || !email) {
        return res.status(400).json({ message: "Name and email are required" });
    }

    try {
        const findUser = await UserModel.findOne({ email: email });
        
        if (!findUser) {
            // Create new user
            const user = await UserModel.create({
                name: name,
                email: email,
                profile: profile,
                provider: ["google"],
            });

            const token = generateToken({ email: email, id: user._id.toString() });
            const cookieOptions = {
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax' as const,
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
                path: '/',
            };

            res.cookie('token', token, {
                ...cookieOptions,
                httpOnly: true,
            });
         

            const userData = {
                id: user._id.toString(),
                email: user.email,
                name: user.name,
                accessToken: token,
                profile: user.profile,
            };

            console.log(`New Google user created: ${email}`);
            return res.status(200).json({ message: "Login successful", userData });
        }

        // Update existing user with Google provider info
        const updatedUser = await UserModel.findOneAndUpdate(
            { email: email },
            { 
                $addToSet: { provider: "google" },
                profile: profile, 
                name: name 
            },
            { new: true }
        );
        
        const token = generateToken({ email: email, id: findUser._id.toString() });
        const cookieOptions = {
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax' as const,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            path: '/',
        };

        res.cookie('token', token, {
            ...cookieOptions,
            httpOnly: true,
        });


    
        const userData = {
            id: updatedUser?._id.toString(),
            email: updatedUser?.email,
            name: updatedUser?.name,
            accessToken: token,
            profile: updatedUser?.profile,
        };

        console.log(`Google user logged in: ${email}`);
        return res.status(200).json({ message: "Login successful", userData });
    
    } catch (error) {
        console.error("Google login error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


    

