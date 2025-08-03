import { api_logout_url } from "@/lib/apiEnd_Point_Call"
import axios from "axios"

export const  Logout_Action = async ({token}: {token: string}) => {
    try {
        const res  = await axios.get(api_logout_url, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
        console.log(res)
        return {status: 200}
    } catch (error) {
        console.log(error)
        return {status: 500}
    }
}