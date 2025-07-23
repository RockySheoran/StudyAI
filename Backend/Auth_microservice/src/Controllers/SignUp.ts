

import { Request, Response } from "express";
import { supabase } from "../Config/supabaseClient";

export const SignUp = async(req:Request,res:Response): Promise<any> =>{
    const {name,email,password} = req.body;
    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
              emailRedirectTo: 'http://localhost:3000/auth/signin',
            },
          })
          console.log("data",data)
          console.log("error",error)
        if(error){
            return res.status(400).json({message:"User already exists"});
        }


      
        return res.status(201).json({message:"User created successfully"});
    } catch (error) {
        return res.status(500).json({message:"Internal server error",error});
    }
}


