"use server"
import { api_logout_url } from "@/lib/apiEnd_Point_Call"
import axios from "axios"
import { cookies } from 'next/headers';

/**
 * Server action to handle user logout and clear authentication cookies
 * @param token - JWT authentication token
 * @returns Promise containing logout status
 */
export const Logout_Action = async ({token}: {token: string}) => {
    try {
        const cookieStore = await cookies();
        await axios.get(api_logout_url,{
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
        cookieStore.delete('token');
        cookieStore.delete('auth-token');
        return {status: 200}
    } catch (error : any) {
        return {status: 500}
    }
}