

import {  Request, Response } from "express";
import { UserModel } from "../Models/UserModel";
import bcrypt from "bcrypt";

export const SignUp = async(req:Request,res:Response): Promise<any> =>{
    const {name,email,password} = req.body;
    
    // Input validation
    if (!name || !email || !password) {
        return res.status(400).json({message: "Name, email, and password are required"});
    }

    

    // Password validation
    if (password.length < 8) {
        return res.status(400).json({message: "Password must be at least 8 characters long"});
    }

    // if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    //     return res.status(400).json({message: "Password must contain at least one uppercase letter, one lowercase letter, and one number"});
    // }
    
    try {
        const findUser = await UserModel.findOne({email: email});
        
        if(findUser && findUser.provider.includes("email")){
            return res.status(400).json({message: "User already exists with this email"});
        }
        if(findUser && !findUser.provider.includes("email")){
            const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
       const user = await UserModel.findByIdAndUpdate(findUser._id,{
            password: hashedPassword,
            name: name,
            provider: ["email"],
        })

        return res.status(200).json({message: "User updated successfully", 
            user: {
            id: user?._id.toString(),
            email: user?.email,
            name: user?.name
        }});
        }

        // Hash password properly with await
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const user = await UserModel.create({
            name: name,
            email: email,
            password: hashedPassword,
            provider: ["email"],
        });

        console.log(`New user created: ${email}`);

        return res.status(201).json({
            message: "User created successfully", 
            user: {
                id: user?._id.toString(),
                email: user?.email,
                name: user?.name
            }
        });
    } catch (error) {
        console.error("SignUp error:", error)
        return res.status(500).json({message:"Internal server error"});
    }
}


