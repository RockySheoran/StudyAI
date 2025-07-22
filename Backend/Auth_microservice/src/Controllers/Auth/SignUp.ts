"use strict";
import { Request, Response } from "express";

export const SignUp = async(req:Request,res:Response): Promise<any> =>{
    const {name,email,password} = req.body;
    try {
        

      
        return res.status(201).json({message:"User created successfully"});
    } catch (error) {
        return res.status(500).json({message:"Internal server error",error});
    }
}