import { Request, Response } from "express";
import { UserModel } from "../Models/UserModel";
import { hashResetToken, isTokenExpired } from "../Utils/resetTokenUtils";
import bcrypt from "bcrypt";

export const Reset_Password = async (req: Request, res: Response): Promise<any> => {
    const { password, token, email } = req.body;
    
    // Validate required fields
    if (!password || !token || !email) {
        return res.status(400).json({ 
            message: "Password, token, and email are required" 
        });
    }

    // Validate password strength
    if (password.length < 8) {
        return res.status(400).json({ 
            message: "Password must be at least 8 characters long" 
        });
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
        return res.status(400).json({ 
            message: "Password must contain at least one uppercase letter, one lowercase letter, and one number" 
        });
    }

    try {
        // Hash the provided token to compare with stored hash
        const hashedToken = hashResetToken(token);
        
        // Find user with matching email and reset token
        const user = await UserModel.findOne({
            email: email.toLowerCase(),
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: new Date() } // Token not expired
        });

        if (!user) {
            return res.status(400).json({ 
                message: "Invalid or expired reset token. Please request a new password reset link." 
            });
        }

        // Check if token has expired (additional check)
        if (user.resetPasswordExpires && isTokenExpired(user.resetPasswordExpires)) {
            await UserModel.findByIdAndUpdate(user._id, {
                resetPasswordToken: undefined,
                resetPasswordExpires: undefined
            });
            return res.status(400).json({ 
                message: "Reset token has expired. Please request a new password reset link." 
            });
        }

        // Only allow password reset for email provider users
        if (!user.provider.includes("email")) {
            return res.status(400).json({ 
                message: "Password reset is only available for email accounts." 
            });
        }

        // Hash the new password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Update user password and clear reset token fields
        await UserModel.findByIdAndUpdate(user._id, {
            password: hashedPassword,
            resetPasswordToken: undefined,
            resetPasswordExpires: undefined
        });

        console.log(`Password successfully reset for user: ${email}`);

        return res.status(200).json({ 
            message: "Password reset successfully. You can now login with your new password.",
            success: true
        });

    } catch (error) {
        console.error("Reset password error:", error);
        return res.status(500).json({ 
            message: "Internal server error. Please try again later." 
        });
    }
};