"use server"
import { api_Google_url } from "@/lib/apiEnd_Point_Call"
import axios from "axios"
import { redirect } from "next/navigation"

/**
 * Server action to initiate OAuth provider login (Google/GitHub)
 * @param provider - OAuth provider name (google/github)
 * @returns Promise containing provider login URL or error response
 */
export const Google_Login_Action = async ({provider}: {provider: string}) =>{
    try {
        const response = await axios.get(`${api_Google_url}/${provider}`)
        if (!response.data?.url) {
            throw new Error('No redirect URL received from the API');
        }

        return {
            success: true,
            message: "Provider login successful",
            data: response.data
        }
    } catch (error) {
        return {
            success: false,
            message: 'Internal server error',
        };
    }
}