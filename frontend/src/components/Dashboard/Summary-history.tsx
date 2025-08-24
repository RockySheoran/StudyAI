"use client";
import { Summary_history_get } from "@/Actions/Get-History/Get-summary";
import { useUserStore } from "@/lib/Store/userStore";
import { ISummary } from "@/types/Summary-type";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export const Summary_history = () => {
    const [summaryHistory, setSummaryHistory] = useState<ISummary[]>([]);
    const { token } = useUserStore();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchSummaryHistory = async () => {
            if (!token) return;
            
            setLoading(true);
            setError(null);
            
            try {
                const res = await Summary_history_get({ token });
                if (res.status === 200) {
                    // Sort by creation date and take only the latest 3
                    const sortedData = (res.data || []).slice(0, 3);
                    setSummaryHistory(sortedData);
                } else {
                    setError(res.message || "Failed to fetch summary history");
                }
            } catch (error) {
                console.error("Error fetching summary history:", error);
                setError("Failed to load summary history");
            } finally {
                setLoading(false);
            }
        };

        fetchSummaryHistory();
    }, [token]);

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'failed': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const refreshHistory = async () => {
        if (!token) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const res = await Summary_history_get({ token });
            if (res.status === 200) {
                // Sort by creation date and take only the latest 3
                const sortedData = (res.data || []).slice(0, 3);
                setSummaryHistory(sortedData);
            } else {
                setError(res.message || "Failed to refresh summary history");
            }
        } catch (error) {
            console.error("Error refreshing summary history:", error);
            setError("Failed to refresh summary history");
        } finally {
            setLoading(false);
        }
    };

    const handleSeeMore = () => {
        router.push('/summary/history');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading summary history...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <div className="text-red-600 mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Summary History</h3>
                <p className="text-red-600 mb-4">{error}</p>
                <button
                    onClick={refreshHistory}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Recent Summaries</h1>
                    <p className="text-gray-600 mt-1">
                        Latest {summaryHistory.length} summaries
                    </p>
                </div>
                <button
                    onClick={refreshHistory}
                    className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                </button>
            </div>

            {/* Summary List */}
            {summaryHistory.length === 0 ? (
                <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No summaries found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Start creating summaries to see them here.
                    </p>
                </div>
            ) : (
                <>
                    <div className="space-y-3">
                        {summaryHistory.map((summary) => (
                            <div
                                key={summary._id}
                                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(summary.status)}`}>
                                                Completed
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {formatDate(summary.generatedAt)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-gray-50 rounded-md p-3">
                                    <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">
                                        {summary?.content?.length > 150 
                                            ? `${summary?.content?.substring(0, 150)}...` 
                                            : summary?.content}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {/* See More Button */}
                    <div className="text-center pt-4">
                        <button
                            onClick={handleSeeMore}
                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                        >
                            See More
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};