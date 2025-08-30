import { Request, Response } from "express";
import { UserModel } from "../Models/UserModel";
import { generateResetToken, hashResetToken } from "../Utils/resetTokenUtils";
import nodemailer from "nodemailer";

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

        // Configure email transporter (you'll need to set up your email service)
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || "587"),
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        // Email content
        const mailOptions = {
            from: `"${process.env.APP_NAME || 'StudtAI'}" <${process.env.SMTP_FROM}>`,
            to: email,
            subject: "Password Reset Request",
            html: `
                <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
                    <h2 style="color: #333;">Password Reset Request</h2>
                    <p>Hello ${user.name},</p>
                    <p>You requested a password reset for your AI Personal Tutor account.</p>
                    <p>Click the button below to reset your password:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" 
                           style="background-color: #007bff; color: white; padding: 12px 30px; 
                                  text-decoration: none; border-radius: 5px; display: inline-block;">
                            Reset Password
                        </a>
                    </div>
                    <p>Or copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; color: #666;">${resetUrl}</p>
                    <p><strong>This link will expire in 15 minutes.</strong></p>
                    <p>If you didn't request this password reset, please ignore this email.</p>
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                    <p style="color: #666; font-size: 12px;">
                        This is an automated message from AI Personal Tutor. Please do not reply to this email.
                    </p>
                </div>
            `,
        };

        // Send email
        await transporter.sendMail(mailOptions);

        console.log(`Password reset email sent to: ${email}`);
        
        return res.status(200).json({ 
            message: "If an account with that email exists, a password reset link has been sent" 
        });
    } catch (error) {
        console.error("Server error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}