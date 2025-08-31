import { Request, Response } from "express";
import { UserModel } from "../Models/UserModel";
import { generateResetToken, hashResetToken } from "../Utils/resetTokenUtils";
import emailjs from "@emailjs/nodejs";

export const Forgot_Password = async (req: Request, res: Response): Promise<any> => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    try {
        // Find user by email
        const user = await UserModel.findOne({ email: email });
        
        if (!user) {
            // For security, don't reveal if email exists or not
            return res.status(200).json({ 
                message: "If an account with that email exists, a password reset link has been sent" 
            });
        }

        // Only allow password reset for email provider users
        if (!user.provider.includes("email")) {
            return res.status(400).json({ 
                message: "Password reset is only available for email accounts. Please use your social login provider." 
            });
        }

        // Generate reset token
        const resetToken = generateResetToken();
        const hashedToken = hashResetToken(resetToken);
        const resetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        // Save reset token to user
        await UserModel.findByIdAndUpdate(user._id, {
            resetPasswordToken: hashedToken,
            resetPasswordExpires: resetExpires
        });

        // Create reset URL
        const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

        // Configure EmailJS template parameters
        const templateParams = {
            email: email,
            link: resetUrl,
            company_name: process.env.APP_NAME || 'StudyAI',
            website_link: process.env.CLIENT_URL || 'http://localhost:3000'
        };

        // Send email using EmailJS
        await emailjs.send(
            process.env.EMAILJS_SERVICE_ID!,
            process.env.EMAILJS_TEMPLATE_ID!,
            templateParams,
            {
                publicKey: process.env.EMAILJS_PUBLIC_KEY!,
                privateKey: process.env.EMAILJS_PRIVATE_KEY!
            }
        );

        console.log(`Password reset email sent to: ${email}`);
        
        return res.status(200).json({ 
            message: "If an account with that email exists, a password reset link has been sent" 
        });
    } catch (error) {
        console.error("Server error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}