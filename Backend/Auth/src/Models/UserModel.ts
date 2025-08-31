import mongoose from "mongoose";

interface User {
    name: string;
    email: string;
    password?: string;
    profile?: string;
    accessToken?: string;
    refreshToken?: string;
    provider: ("google" | "github" | "email")[];
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    isEmailVerified?: boolean;
    emailVerificationToken?: string;
    emailVerificationExpires?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    profile: { type: String },
    accessToken: { type: String },
    refreshToken: { type: String },
    provider: { 
        type: [String], 
        enum: ["google", "github", "email"], 
        required: true 
    },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String },
    emailVerificationExpires: { type: Date },
}, {
    timestamps: true
});

export const UserModel = mongoose.model<User>("User", userSchema);