"use server"
import { api_delete_summary_url } from "@/lib/apiEnd_Point_Call";
import axios from "axios";


export const Delete_summary = async ({ token, summaryId }: { token: string; summaryId: string }) => {
    try {
        console.log(summaryId)
        console.log(api_delete_summary_url)
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
        console.error("Delete summary error:", error?.response?.data);
        return {
            status: error?.response?.status || 500,
            message: error?.response?.data?.message || "Failed to delete summary",
            data: null
        };
    }
};
