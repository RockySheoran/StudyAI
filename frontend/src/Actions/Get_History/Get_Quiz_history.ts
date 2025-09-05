"use server"
import axios from "axios"
import { api_quiz_history_url } from "@/lib/apiEnd_Point_Call"

/**
 * Server action to fetch user's quiz history from the backend
 * @param token - JWT authentication token
 * @returns Promise containing quiz history data or error response
 */
export const Quiz_history_get = async ({token}:{token:string}) => {
    try {
        const res = await axios.get(api_quiz_history_url,{
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })

        return {
            status: 200,
            message: "Quiz history retrieved successfully",
            data: res.data
        }
        
    } catch (error:any) {
        return {
            status: 500,
            message: error?.response?.data?.message || "Internal server error",
            data: null
        }
    }
}