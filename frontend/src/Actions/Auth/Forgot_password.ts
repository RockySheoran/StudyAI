"use server"
import axios from "axios"
import { api_forgot_url } from "../../lib/apiEnd_Point_Call"


export const Forgot_pass_action = async ({email}:{email:string}) =>{
    try {
        const res  = await axios.post (api_forgot_url,{email})
        console.log(res.data)
        return {
            status: 200,
            message: "Reset link sent successfully",
            data: res.data
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