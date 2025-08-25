"use client";
import { useSummaryHistoryStore } from "@/lib/Store/History/Summary_history_store";
import { useUserStore } from "@/lib/Store/userStore";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export const Summary_history = () => {
    const { token } = useUserStore();
    const { 
        summaries, 
        loading, 
        error, 
        fetchSummaries 
    } = useSummaryHistoryStore();
    const router = useRouter();

    useEffect(() => {
        if (token) {
            fetchSummaries(token);
        }
    }, [token, fetchSummaries]);

    // Get only the latest 3 summaries for dashboard
    const recentSummaries = summaries.slice(0, 3);

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
            case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
        }
    };

    const handleSeeAll = () => {
        router.push('/summary/history');
    };

    const handleCardClick = (id: string) => {
        router.push(`/summary/history?id=${id}`);
    };

    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 min-h-[400px] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-300">Loading your summary history...</p>
                </div>
            </div>
        );
    }

    // if (error) {
    //     return (
    //         <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
    //             <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
    //                 <div className="text-red-600 dark:text-red-400 mb-4">
    //                     <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    //                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
    //                     </svg>
    //                 </div>
    //                 <h3 className="text-lg font-medium text-red-800 dark:text-red-300 mb-2">Error Loading Summary History</h3>
    //                 <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
    //                 <button
    //                     onClick={() => token && fetchSummaries(token)}
    //                     className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
    //                 >
    //                     Try Again
    //                 </button>
    //             </div>
    //         </div>
    //     );
    // }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Summaries</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Your latest {recentSummaries.length} summaries
                    </p>
                </div>
                
                {recentSummaries.length > 0 && (
                    <button
                        onClick={handleSeeAll}
                        className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors self-start sm:self-auto"
                    >
                        See All
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Summary List */}
            {recentSummaries.length === 0 ? (
                <div className="text-center py-8">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <svg className="h-8 w-8 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">No summaries yet</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Start creating summaries to see them here.
                    </p>
                    <button
                        onClick={() => router.push('/summary')}
                        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                        Create Your First Summary
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {recentSummaries.map((summary) => (
                        <div
                            key={summary._id}
                            onClick={() => handleCardClick(summary._id)}
                            className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-4 hover:shadow-sm transition-all cursor-pointer hover:border-blue-200 dark:hover:border-blue-800"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(summary.status)}`}>
                                            {summary.status.charAt(0).toUpperCase() + summary.status.slice(1)}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {formatDate(summary.generatedAt)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white dark:bg-gray-600 rounded-lg p-3">
                                <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed line-clamp-2">
                                    {summary?.content?.length > 150 
                                        ? `${summary?.content?.substring(0, 150)}...` 
                                        : summary?.content}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};