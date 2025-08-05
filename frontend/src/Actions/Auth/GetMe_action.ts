"use server"

import { api_getme_url } from "../../lib/apiEnd_Point_Call"
import axios from "axios"

export const GetMe_action = async ({token}: {token: string}) => {

    try {
        console.log(token , api_getme_url)
        const res  = await axios.get(api_getme_url, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
        console.log(res.data)
        return {
            status: 200,
            message: "Get me successfully",
            data: res.data.user
        }
    } catch (error : any) {
        console.log(error?.response?.data)
        return {
            status: 500,
            message: error?.response?.data?.message || "Internal server error",
            data: null
        }
    }

    
}
