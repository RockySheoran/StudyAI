"use server"

import axios from "axios";
import { api_Signup_url } from "@/lib/apiEnd_Point_Call";

interface FormState {
    errors: Record<string, string>;
    message: string;
    status: number;
    data: any;
}

/**
 * Server action to handle user registration/signup
 * @param prevState - Previous form state for error handling
 * @param formData - Form data containing name, email, and password
 * @returns Promise containing signup result or error response
 */
export const SignUp_Actions = async (prevState: FormState, formData: FormData): Promise<FormState> => {
    try {
       
        const data = {
            name: formData.get("name"),
            email: formData.get("email"),
            password: formData.get("password"),
        }
        
        const response = await axios.post(api_Signup_url, data, {
            headers: {
                "Content-Type": "application/json",
            }
        });

        return {
            errors: {},
            message: response.data.message || "Signup successful",
            status: 200,
            data: response.data
        };
    } catch (error: any) {
        return {
            errors: { general: error.response?.data?.message || "Signup failed" },
            message: error.response?.data?.message || "Signup failed",
            status: error.response?.status || 500,
            data: null
        };
    }
}