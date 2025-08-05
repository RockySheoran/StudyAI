
"use server"
import axios from "axios"
import { api_reset_url } from "../../lib/apiEnd_Point_Call"

export const Reset_pass_action = async ({code,password}:{code:string,password:string}) =>{
   try {
      const res  = await axios.post(api_reset_url,{code,password})
      console.log(res.data)
      return {
        status: 200,
        message: "Password reset successfully"
      }
   } catch (error:any) {
    console.log(error?.response?.data)
    return {
        status: 500,
        message: error?.response?.data?.message || "Internal server error",
     
    }
   }   
}
