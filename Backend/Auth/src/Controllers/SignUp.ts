

import { Request, Response } from "express";
import { UserModel } from "../Models/UserModel";
import bcrypt from "bcrypt";
import emailjs from "@emailjs/nodejs";
import { generateResetToken, hashResetToken } from "../Utils/resetTokenUtils";

export const SignUp = async (req: Request, res: Response): Promise<any> => {
    const { name, email, password } = req.body;

    // Input validation
    if (!name || !email || !password) {
        return res.status(400).json({ message: "Name, email, and password are required" });
    }



    // Password validation
    if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }

    // if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    //     return res.status(400).json({message: "Password must contain at least one uppercase letter, one lowercase letter, and one number"});
    // }

    try {
        const findUser = await UserModel.findOne({ email: email });

        if (findUser && findUser.provider.includes("email") && findUser.isEmailVerified) {
            return res.status(400).json({ message: "User already exists with this email" });
        }
        if (findUser && !findUser.provider.includes("email") && (findUser.provider.includes("google") || findUser.provider.includes("github"))) {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            const verificationToken = generateResetToken();
            const hashedVerificationToken = hashResetToken(verificationToken);
            const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
            const user = await UserModel.findByIdAndUpdate(findUser._id, {
                password: hashedPassword,
                name: name,
                provider: ["email"],
                isEmailVerified: false,
                emailVerificationToken: hashedVerificationToken,
                emailVerificationExpires: verificationExpires

            })
            const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;

            // Send verification email using EmailJS
            try {
                const templateParams = {
                    to_email: email,
                    to_name: name,
                    verification_link: verificationUrl,
                    company_name: process.env.APP_NAME || 'StudyAI',
                    website_link: process.env.CLIENT_URL || 'http://localhost:3000'
                };
                console.log(
                    process.env.EMAILJS_SERVICE_ID1!,
                    process.env.EMAILJS_VERIFICATION_TEMPLATE_ID1!,)

                await emailjs.send(
                    process.env.EMAILJS_SERVICE_ID1!,
                    process.env.EMAILJS_VERIFICATION_TEMPLATE_ID1!,
                    templateParams,
                    {
                        publicKey: process.env.EMAILJS_PUBLIC_KEY1!,
                        privateKey: process.env.EMAILJS_PRIVATE_KEY1!
                    }
                );

                console.log(`Verification email sent to: ${email}`);
            } catch (emailError) {
                console.error('Failed to send verification email:', emailError);
                return res.status(500).json({ message: "Failed to send verification email" });
                // Don't fail the signup if email fails
            }


            return res.status(200).json({
                message: "User updated successfully",
                user: {
                    id: user?._id.toString(),
                    email: user?.email,
                    name: user?.name
                }
            });
        }

        // Hash password properly with await
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Generate email verification token
        const verificationToken = generateResetToken();
        const hashedVerificationToken = hashResetToken(verificationToken);
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        if (findUser?.isEmailVerified == false && findUser?.provider.includes("email")) {
            const user = await UserModel.findByIdAndUpdate(findUser._id, {
                password: hashedPassword,
                name: name,
                isEmailVerified: false,
                emailVerificationToken: hashedVerificationToken,
                emailVerificationExpires: verificationExpires
            })
        }
        else {
            const user = await UserModel.create({
                name: name,
                email: email,
                password: hashedPassword,
                provider: ["email"],
                isEmailVerified: false,
                emailVerificationToken: hashedVerificationToken,
                emailVerificationExpires: verificationExpires
            });
        }

        console.log(`New user created: ${email}`);

        // Create verification URL
        const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;

        // Send verification email using EmailJS
        try {
            const templateParams = {
                to_email: email,
                to_name: name,
                verification_link: verificationUrl,
                company_name: process.env.APP_NAME || 'StudyAI',
                website_link: process.env.CLIENT_URL || 'http://localhost:3000'
            };
            console.log(process.env.EMAILJS_SERVICE_ID1!,
                process.env.EMAILJS_VERIFICATION_TEMPLATE_ID1!,)

            await emailjs.send(
                process.env.EMAILJS_SERVICE_ID1!,
                process.env.EMAILJS_VERIFICATION_TEMPLATE_ID1!,
                templateParams,
                {
                    publicKey: process.env.EMAILJS_PUBLIC_KEY1!,
                    privateKey: process.env.EMAILJS_PRIVATE_KEY1!
                }
            );

            console.log(`Verification email sent to: ${email}`);
        } catch (emailError) {
            console.error('Failed to send verification email:', emailError);
            // Don't fail the signup if email fails
        }

        return res.status(201).json({
            message: "User created successfully. Please check your email to verify your account.",
        });
    } catch (error) {
        console.error("SignUp error:", error)
        return res.status(500).json({ message: "Internal server error" });
    }
}


