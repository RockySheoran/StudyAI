

import {  Request, Response } from "express";
import { supabase } from "../Config/supabaseClient";

export const SignUp = async(req:Request,res:Response): Promise<any> =>{
    const {name,email,password} = req.body;
    
    // Input validation
    if (!name || !email || !password) {
        return res.status(400).json({message: "Name, email, and password are required"});
    }
    
    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
              emailRedirectTo: 'http://localhost:3000/login',
              data: {
                name: name,
              },
            },
          })
          console.log("data",data)
          console.log("error",error)
        
        if(error){
            // More specific error handling
            if (error.message.includes('already registered')) {
                return res.status(400).json({message: "User already exists"});
            }
            return res.status(400).json({message: error.message});
        }

        return res.status(201).json({
            message: "User created successfully", 
            user: {
                id: data.user?.id,
                email: data.user?.email,
                name: data.user?.user_metadata?.name
            }
        });
    } catch (error) {
        return res.status(500).json({message:"Internal server error",error});
    }
}


