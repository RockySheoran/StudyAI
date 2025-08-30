"use server"

import axios from "axios"
import { api_qna_history_url } from "@/lib/apiEnd_Point_Call"

export const Qna_history_get = async ({token}:{token:string}) => {
    try {
        console.log(api_qna_history_url)
        const res = await axios.get(api_qna_history_url,{
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
        console.log(res.data)

        return {
            status: 200,
            message: "QnA history retrieved successfully",
            data: res.data
        }
        
    } catch (error:any) {
        console.log(error?.response?.data)
        return {
            status: 500,
            message: "Failed to retrieve QnA history",
            error: error?.response?.data
        }
    }
}