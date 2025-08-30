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
}, {
    timestamps: true
});

export const UserModel = mongoose.model<User>("User", userSchema);