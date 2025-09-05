
"use server"
import axios from "axios"
import { api_reset_url } from "../../lib/apiEnd_Point_Call"

/**
 * Server action to reset user password using reset token
 * @param token - Password reset token from email
 * @param password - New password to set
 * @param email - User's email address
 * @returns Promise containing reset status or error response
 */
export const Reset_pass_action = async ({token,password,email}:{token:string,password:string,email:string}) =>{
   try {
      const res = await axios.post(api_reset_url,{token,password,email})
      return {
        status: 200,
        message: "Password reset successfully"
      }
   } catch (error:any) {
    return {
        status: 500,
        message: error?.response?.data?.message || "Internal server error",
    }
   }   
}
