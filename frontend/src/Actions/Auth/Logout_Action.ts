"use server"
import { api_logout_url } from "@/lib/apiEnd_Point_Call"
import axios from "axios"
import { cookies } from 'next/headers';
export const  Logout_Action = async ({token}: {token: string}) => {
    try {
     const cookieStore = cookies();
        const res  = await axios.get(api_logout_url,{
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
        console.log(res);
        (await cookieStore).delete('token');
        (await cookieStore).delete('auth-token');
        return {status: 200}
    } catch (error : any) {
        console.log(error?.response?.data)
        return {status: 500}
    }
}