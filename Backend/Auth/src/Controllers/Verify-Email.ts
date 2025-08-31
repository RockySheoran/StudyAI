import { Request, Response } from "express";
import { UserModel } from "../Models/UserModel";
import { hashResetToken } from "../Utils/resetTokenUtils";

export const Verify_Email = async (req: Request, res: Response): Promise<any> => {
    const { token, email } = req.query;

    if (!token || !email) {
        return res.status(400).json({ message: "Token and email are required" });
    }

    try {
        // Hash the token to compare with stored hash
        const hashedToken = hashResetToken(token as string);
        console.log(hashedToken)

        // Find user with matching email and valid verification token
        const user = await UserModel.findOne({
            email: email as string,
            emailVerificationToken: hashedToken,
            emailVerificationExpires: { $gt: new Date() }
        });
console.log(user)
        if (!user) {
            return res.status(400).json({ 
                message: "Invalid or expired verification token" 
            });
        }

        // Check if already verified
        if (user.isEmailVerified) {
            return res.status(200).json({ 
                message: "Email is already verified" 
            });
        }

        // Update user as verified and clear verification token
        await UserModel.findByIdAndUpdate(user._id, {
            isEmailVerified: true,
            emailVerificationToken: undefined,
            emailVerificationExpires: undefined
        });

        console.log(`Email verified for user: ${email}`);

        return res.status(200).json({ 
            message: "Email verified successfully! You can now log in." 
        });
    } catch (error) {
        console.error("Email verification error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const Resend_Verification = async (req: Request, res: Response): Promise<any> => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    try {
        // Find user by email
        const user = await UserModel.findOne({ email: email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if already verified
        if (user.isEmailVerified) {
            return res.status(400).json({ 
                message: "Email is already verified" 
            });
        }

        // Generate new verification token
        const { generateResetToken } = await import("../Utils/resetTokenUtils");
        const verificationToken = generateResetToken();
        const hashedVerificationToken = hashResetToken(verificationToken);
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Update user with new verification token
        await UserModel.findByIdAndUpdate(user._id, {
            emailVerificationToken: hashedVerificationToken,
            emailVerificationExpires: verificationExpires
        });

        // Create verification URL
        const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;

        // Send verification email using EmailJS
        const emailjs = await import("@emailjs/nodejs");
        
        try {
            const templateParams = {
                to_email: email,
                to_name: user.name,
                verification_link: verificationUrl,
                company_name: process.env.APP_NAME || 'StudyAI',
                website_link: process.env.CLIENT_URL || 'http://localhost:3000'
            };

            await emailjs.default.send(
                process.env.EMAILJS_SERVICE_ID!,
                process.env.EMAILJS_VERIFICATION_TEMPLATE_ID!,
                templateParams,
                {
                    publicKey: process.env.EMAILJS_PUBLIC_KEY!,
                    privateKey: process.env.EMAILJS_PRIVATE_KEY!
                }
            );

            console.log(`Verification email resent to: ${email}`);
        } catch (emailError) {
            console.error('Failed to resend verification email:', emailError);
            return res.status(500).json({ message: "Failed to send verification email" });
        }

        return res.status(200).json({ 
            message: "Verification email sent successfully" 
        });
    } catch (error) {
        console.error("Resend verification error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
