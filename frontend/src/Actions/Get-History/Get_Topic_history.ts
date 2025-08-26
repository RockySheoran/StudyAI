"use server"
import { api_topic_history_url } from "@/lib/apiEnd_Point_Call"
import axios from "axios"

export const Get_Topic_history = async ({token}: {token: string}) => {
    try {
        console.log(api_topic_history_url)
        const res = await axios.get(api_topic_history_url, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        return {
            status: 200,
            data: res.data
        };
    } catch (error: any) {
        console.error('Error fetching topic history:', error?.response);
        
        if (error.response) {
            // Server responded with error status
            return {
                status: error.response.status,
                data: null,
                error: error.response.data?.message || 'Failed to fetch topic history'
            };
        } else if (error.request) {
            // Request was made but no response received
            return {
                status: 500,
                data: null,
                error: 'Network error - no response from server'
            };
        } else {
            // Something else happened
            return {
                status: 500,
                data: null,
                error: error.message || 'Unknown error occurred'
            };
        }
    }
};