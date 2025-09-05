"use server"

import { api_getme_url } from "../../lib/apiEnd_Point_Call"
import axios from "axios"

/**
 * Server action to fetch current user profile data using authentication token
 * @param token - JWT authentication token
 * @returns Promise containing user data or error response
 */
export const GetMe_action = async ({token}: {token: string}) => {
    try {
        const res = await axios.get(api_getme_url, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
        return {
            status: 200,
            message: "Get me successfully",
            data: res.data.user
        }
    } catch (error : any) {
        return {
            status: 500,
            message: error?.response?.data?.message || "Internal server error",
            data: null
        }
    }
}
