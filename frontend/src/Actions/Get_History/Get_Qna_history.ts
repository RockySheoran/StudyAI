"use server"

import axios from "axios"
import { api_qna_history_url } from "@/lib/apiEnd_Point_Call"

/**
 * Server action to fetch user's Q&A history from the backend
 * @param token - JWT authentication token
 * @returns Promise containing Q&A history data or error response
 */
export const Qna_history_get = async ({token}:{token:string}) => {
    try {
        const res = await axios.get(api_qna_history_url,{
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })

        return {
            status: 200,
            message: "QnA history retrieved successfully",
            data: res.data
        }
        
    } catch (error:any) {
        return {
            status: 500,
            message: "Failed to retrieve QnA history",
            error: error?.response?.data
        }
    }
}