"use client";

import { Delete_summary } from "@/actions/Delete/Delete_summary";
import { useUserStore } from "@/lib/Store/userStore";
import { useSummaryHistoryStore } from "@/lib/Store/Summary/Summary_history_store";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export default function Summary_history() {
  const router = useRouter();
  const { token } = useUserStore();
  const {
    summaries,
    loading,
    error,
    fetchSummaries,
    removeSummary
  } = useSummaryHistoryStore();
  
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [deletingItems, setDeletingItems] = useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch summary history when token is available
  useEffect(() => {
    if (token) {
      fetchSummaries(token);
    }
  }, [token, fetchSummaries]);

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

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (expandedItems.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    
    setDeletingItems(prev => new Set(prev).add(id));
    
    try {
      const res = await Delete_summary({ token, summaryId: id });
      
      if (res.status === 200) {
        // Update the store to remove the deleted summary
        removeSummary(id);
        toast.success("Summary deleted successfully");
        
        // Remove from expanded items if it was expanded
        setExpandedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      } else {
        toast.error(res.message || "Failed to delete summary");
      }
    } catch (error) {
      console.error("Error deleting summary:", error);
      toast.error("Failed to delete summary");
    } finally {
      setDeletingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const refreshHistory = async () => {
    if (!token) return;
    setIsRefreshing(true);
    await fetchSummaries(token, true);
    setTimeout(() => setIsRefreshing(false), 500);
    toast.success("History refreshed");
  };

  if (loading && summaries.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="rounded-full h-12 w-12 border-b-2 border-blue-600"
          ></motion.div>
          <span className="text-gray-600 dark:text-gray-300">Loading your summaries...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          {/* Go Back Button */}
          <motion.button
            onClick={() => router.back()}
            className="flex items-center gap-2 mb-6 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 px-3 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors font-medium"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Go Back
          </motion.button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Summary History</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm sm:text-base">
                Manage and review all your generated summaries
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={refreshHistory}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              <motion.svg 
                animate={{ rotate: isRefreshing ? 360 : 0 }}
                transition={{ duration: 0.5, repeat: isRefreshing ? Infinity : 0 }}
                className="h-4 w-4" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </motion.svg>
              {loading ? 'Refreshing...' : 'Refresh'}
            </motion.button>
          </div>

          {/* Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4"
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{summaries.length}</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Summaries</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
                {summaries.filter(s => s.status === 'completed').length}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Completed</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="text-xl sm:text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {summaries.filter(s => s.status === 'pending').length}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Pending</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Error State */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-6 overflow-hidden"
            >
              <div className="flex items-center gap-3">
                <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <h3 className="text-lg font-medium text-red-800 dark:text-red-300">Error Loading Summary History</h3>
                  <p className="text-red-600 dark:text-red-400 mt-1">{error}</p>
                </div>
              </div>
              <button
                onClick={refreshHistory}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        <AnimatePresence>
          {!loading && !error && summaries.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-12"
            >
              <svg className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No summaries found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Start creating summaries to see them here.
              </p>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Your First Summary
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Summary List */}
        <AnimatePresence mode="popLayout">
          {!loading && !error && summaries.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ 
                staggerChildren: 0.05,
                delayChildren: 0.1
              }}
              className="space-y-4"
            >
              {summaries.map((summary) => {
                const isExpanded = expandedItems.has(summary._id);
                const isDeleting = deletingItems.has(summary._id);
                const truncatedContent = summary?.content?.length > 200 
                  ? `${summary?.content?.substring(0, 200)}...` 
                  : summary?.content;

                return (
                  <motion.div
                    key={summary._id}
                  
                    
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden mx-2 sm:mx-0"
                  >
                    <div className="p-4 sm:p-6">
                      {/* Header */}
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
                            <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(summary.status)}`}>
                              {summary.status.charAt(0).toUpperCase() + summary.status.slice(1)}
                            </span>
                            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                              {formatDate(summary.generatedAt)}
                            </span>
                          </div>
                          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 break-all">
                            ID: {summary._id}
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => toggleExpanded(summary._id)}
                            className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 px-2 sm:px-3 py-1 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors text-xs sm:text-sm font-medium"
                          >
                            {isExpanded ? (
                              <>
                                <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                                <span className="hidden sm:inline">Show Less</span>
                                <span className="sm:hidden">Less</span>
                              </>
                            ) : (
                              <>
                                <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                                <span className="hidden sm:inline">See More</span>
                                <span className="sm:hidden">More</span>
                              </>
                            )}
                          </motion.button>
                          
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDelete(summary._id)}
                            disabled={isDeleting}
                            className="flex items-center gap-1 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 px-2 sm:px-3 py-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors text-xs sm:text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isDeleting ? (
                              <>
                                <motion.div 
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  className="rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-red-600"
                                ></motion.div>
                                <span className="hidden sm:inline">Deleting...</span>
                              </>
                            ) : (
                              <>
                                <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                <span className="hidden sm:inline">Delete</span>
                              </>
                            )}
                          </motion.button>
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="relative bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4">
                        <div 
                          className="overflow-hidden transition-all duration-200 ease-in-out"
                          style={{ height: isExpanded ? 'auto' : '100px' }}
                        >
                          <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-wrap break-words">
                            {isExpanded ? summary?.content : truncatedContent}
                          </div>
                        </div>
                        
                        {/* Gradient fade for truncated content */}
                        {!isExpanded && summary?.content?.length > 200 && (
                          <div className="absolute bottom-0 left-0 right-0 h-6 sm:h-8 bg-gradient-to-t from-gray-50 to-transparent dark:from-gray-700 pointer-events-none" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}