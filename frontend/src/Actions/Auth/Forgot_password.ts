"use server"
import axios from "axios"
import { api_forgot_url } from "../../lib/apiEnd_Point_Call"

/**
 * Server action to initiate password reset by sending reset link to user's email
 * @param email - User's email address to send reset link to
 * @returns Promise containing success status or error response
 */
export const Forgot_pass_action = async ({email}:{email:string}) =>{
    try {
        const res = await axios.post(api_forgot_url,{email})
        return {
            status: 200,
            message: "Reset link sent successfully",
            data: res.data
        }
    } catch (error : any) {
        return {
            status: 500,
            message: error?.response?.data?.message || "Internal server error",
            data: null
        }
    }
}