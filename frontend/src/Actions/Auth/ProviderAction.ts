"use server"
import { api_Google_url } from "@/lib/apiEnd_Point_Call"
import axios from "axios"
import { redirect } from "next/navigation"

export const Google_Login_Action = async ({provider}: {provider: string}) =>{
    try {
        const response  = await axios.get(`${api_Google_url}/${provider}`)
        console.log(response.data)
        if (!response.data?.url) {
            throw new Error('No redirect URL received from the API');
        }


        return {
            success: true,
            message: "Provider login successful",
            data: response.data
        }
    } catch (error) {
        console.error("Provider login error:", error);
        return {
            success: false,
            message: 'Internal server error',
        };
    }
}