"use client";
import { useSummaryHistoryStore } from "@/lib/Store/Summary/Summary_history_store";
import { useUserStore } from "@/lib/Store/userStore";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FaFileAlt, FaHistory } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

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
    const recentSummaries = summaries.slice(0, 2);

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
            case 'completed': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700';
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700';
            case 'failed': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700';
            default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
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
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 min-h-[400px] flex items-center justify-center">
                <div className="text-center">
                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"
                    ></motion.div>
                    <p className="text-gray-600 dark:text-gray-300">Loading your summary history...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
                    <div className="text-red-600 dark:text-red-400 mb-4">
                        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-red-800 dark:text-red-300 mb-2">Error Loading Summary History</h3>
                    <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                    <button
                        onClick={() => token && fetchSummaries(token)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            {/* Header */}
            <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
            >
                <div className="flex items-center">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg mr-3">
                        <FaFileAlt className="text-indigo-600 dark:text-indigo-400 text-lg" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Summary History</h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Your latest {recentSummaries.length} summaries
                        </p>
                    </div>
                </div>
                
                {recentSummaries.length > 0 && (
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Button
                            onClick={handleSeeAll}
                            variant="ghost"
                            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300"
                          >
                          
                            See More
                            <ExternalLink className="w-4 h-4" />
                        </Button>
                    </motion.div>
                )}
            </motion.div>

            {/* Summary List */}
            {recentSummaries.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-center py-8"
                >
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <FaFileAlt className="h-8 w-8 text-indigo-400 dark:text-indigo-500" />
                    </div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">No summaries yet</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                        Start creating summaries to see them here.
                    </p>
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Button
                            onClick={() => router.push('/summary')}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl"
                            size="lg"
                        >
                            Create Your First Summary
                        </Button>
                    </motion.div>
                </motion.div>
            ) : (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ staggerChildren: 0.1 }}
                    className="space-y-4"
                >
                    {recentSummaries.map((summary, index) => (
                        <motion.div
                            key={summary._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => handleCardClick(summary._id)}
                            className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer hover:border-indigo-200 dark:hover:border-indigo-800 group"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(summary.status).replace('dark:bg-', 'dark:bg-').replace('dark:text-', 'dark:text-')} border-current`}>
                                            {summary.status.charAt(0).toUpperCase() + summary.status.slice(1)}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {formatDate(summary.generatedAt)}
                                        </span>
                                    </div>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                            
                            <div className="bg-white dark:bg-gray-600 rounded-lg p-4 border border-gray-100 dark:border-gray-500">
                                <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed line-clamp-2">
                                    {summary?.content?.length > 150 
                                        ? `${summary?.content?.substring(0, 150)}...` 
                                        : summary?.content}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </div>
    );
};