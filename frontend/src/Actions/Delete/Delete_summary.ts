"use server"
import { api_delete_summary_url } from "@/lib/apiEnd_Point_Call";
import axios from "axios";

/**
 * Server action to delete a specific summary by ID
 * @param token - JWT authentication token
 * @param summaryId - Unique identifier of the summary to delete
 * @returns Promise containing deletion status or error response
 */
export const Delete_summary = async ({ token, summaryId }: { token: string; summaryId: string }) => {
    try {
        const res = await axios.delete(`${api_delete_summary_url}/summary/${summaryId}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        return {
            status: 200,
            message: "Summary deleted successfully",
            data: res.data
        };
        
    } catch (error: any) {
        return {
            status: error?.response?.status || 500,
            message: error?.response?.data?.message || "Failed to delete summary",
            data: null
        };
    }
};
