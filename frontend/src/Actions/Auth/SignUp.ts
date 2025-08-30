"use server"

import axios from "axios";
import { api_Signup_url } from "@/lib/apiEnd_Point_Call";

interface FormState {
    errors: Record<string, string>;
    message: string;
    status: number;
    data: any;
}

export const SignUp_Actions = async (prevState: FormState, formData: FormData): Promise<FormState> => {
    try {
       
        const data ={
            name: formData.get("name"),
            email: formData.get("email"),
            password: formData.get("password"),
           
        }
        console.log(data)
        const response = await axios.post(api_Signup_url, data,{
            headers:{
                "Content-Type": "application/json",
            }
        });
        // console.log(response.data);

        return {
            errors: {},
            message: "Signup successful",
            status: 200,
            data: response.data
        };
    } catch (error: any) {
        // console.error("Signup error:", error.response.data);
        
        return {
            errors: { general: error.response?.data?.message || "Signup failed" },
            message: error.response?.data?.message || "Signup failed",
            status: error.response?.status || 500,
            data: null
        };
    }
}