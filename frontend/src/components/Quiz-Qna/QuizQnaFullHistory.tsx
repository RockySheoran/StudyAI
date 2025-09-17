"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft, Search, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/lib/Store/userStore";
import {
  useQuizQnAHistoryStore,
  HistoryItem,
  QuizHistoryItem,
  QnAHistoryItem,
} from "@/lib/Store/Quiz-Qna/quizQnaHistoryStore";

// Import components
import { FilterSection, FilterState } from "./components/FilterSection";
import { StatsCards } from "./components/StatsCards";
import { HistoryItem as HistoryItemComponent } from "./components/HistoryItem";
import { Pagination } from "./components/Pagination";
import { ItemsPerPageSelector } from "./components/ItemsPerPageSelector";


interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
}

export const QuizQnaFullHistory = () => {
  const router = useRouter();
  const { token } = useUserStore();
  const { allHistory, refreshHistory, setSelectedHistoryItem } =
    useQuizQnAHistoryStore();

  const [showFilters, setShowFilters] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    type: "all",
    performance: "all",
    dateRange: "all",
    searchTerm: "",
  });
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    itemsPerPage: 10,
  });

  useEffect(() => {
    const loadHistory = async () => {
      if (!token) return;
      await refreshHistory(token);
    };
    loadHistory();
  }, [refreshHistory, token]);


  const getPerformanceCategory = (percentage: number) => {
    if (percentage >= 80) return "excellent";
    if (percentage >= 60) return "good";
    return "needs_improvement";
  };

  const isWithinDateRange = (date: Date, range: string) => {
    const now = new Date();
    const itemDate = new Date(date);

    switch (range) {
      case "today":
        return itemDate.toDateString() === now.toDateString();
      case "week":
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return itemDate >= weekAgo;
      case "month":
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return itemDate >= monthAgo;
      default:
        return true;
    }
  };

  const filteredHistory = allHistory
    .filter((item: HistoryItem) => {
      // Type filter
      if (filters.type !== "all" && item.type !== filters.type) return false;

      // Performance filter
      if (filters.performance !== "all") {
        const percentage =
          item.type === "quiz"
            ? item.result?.percentage || 0
            : item.result?.totalScore && item.result?.maxPossibleScore
            ? Math.round(
                (item.result.totalScore / item.result.maxPossibleScore) * 100
              )
            : 0;
        const category = getPerformanceCategory(percentage);
        if (category !== filters.performance) return false;
      }

      // Date range filter
      if (
        filters.dateRange !== "all" &&
        !isWithinDateRange(item.createdAt, filters.dateRange)
      ) {
        return false;
      }

      // Search filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        return (
          item?.topic.toLowerCase().includes(searchLower) ||
          item.educationLevel.toLowerCase().includes(searchLower)
        );
      }

      return true;
    })
    .sort(
      (a: HistoryItem, b: HistoryItem) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  // Pagination logic
  const totalItems = filteredHistory.length;
  const totalPages = Math.ceil(totalItems / pagination.itemsPerPage);
  const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
  const endIndex = startIndex + pagination.itemsPerPage;
  const paginatedHistory = filteredHistory.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, [filters]);

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
    // Scroll to top of history section
    document.getElementById('history-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (itemsPerPage: number) => {
    setPagination({ currentPage: 1, itemsPerPage });
  };

  const handleHistoryItemClick = (item: HistoryItem) => {
    setSelectedHistoryItem(item);
    router.push(`/quiz_qna/history/${item._id}`);
  };

  const clearFilters = () => {
    setFilters({
      type: "all",
      performance: "all",
      dateRange: "all",
      searchTerm: "",
    });
  };

  const handleRefresh = async () => {
    if (!token || isRefreshing) return;

    setIsRefreshing(true);
    try {
      await refreshHistory(token,true);
      toast.success("History refreshed successfully");
    } catch (error) {
      console.error("Error refreshing history:", error);
      toast.error("Failed to refresh history");
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatsData = () => {
    const quizItems = filteredHistory.filter(
      (item: HistoryItem) => item.type === "quiz"
    );
    const qnaItems = filteredHistory.filter(
      (item: HistoryItem) => item.type === "qna"
    );

    const avgQuizScore =
      quizItems.length > 0
        ? quizItems.reduce((sum: number, item: HistoryItem) => {
            const quizItem = item as QuizHistoryItem;
            const percentage = quizItem.result?.percentage || 0;
            return sum + percentage;
          }, 0) / quizItems.length
        : 0;

    const avgQnaScore =
      qnaItems.length > 0
        ? qnaItems.reduce((sum: number, item: HistoryItem) => {
            const qnaItem = item as QnAHistoryItem;
            const percentage =
              qnaItem.result?.totalScore && qnaItem.result?.maxPossibleScore
                ? Math.round(
                    (qnaItem.result.totalScore /
                      qnaItem.result.maxPossibleScore) *
                      100
                  )
                : 0;
            return sum + percentage;
          }, 0) / qnaItems.length
        : 0;

    return {
      totalItems: filteredHistory.length,
      quizCount: quizItems.length,
      qnaCount: qnaItems.length,
      avgQuizScore: Math.round(avgQuizScore),
      avgQnaScore: Math.round(avgQnaScore),
      overallAvg:
        filteredHistory.length > 0
          ? Math.round(
              filteredHistory.reduce((sum: number, item: HistoryItem) => {
                const percentage =
                  item.type === "quiz"
                    ? (item as QuizHistoryItem).result?.percentage || 0
                    : (item as QnAHistoryItem).result?.totalScore &&
                      (item as QnAHistoryItem).result?.maxPossibleScore
                    ? Math.round(
                        ((item as QnAHistoryItem).result!.totalScore /
                          (item as QnAHistoryItem).result!.maxPossibleScore) *
                          100
                      )
                    : 0;
                return sum + percentage;
              }, 0) / filteredHistory.length
            )
          : 0,
    };
  };

  const stats = getStatsData();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Complete Quiz & Q&A History
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
              View and analyze all your quiz and Q&A sessions
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex justify-center items-center gap-2 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            <motion.svg
              animate={{ rotate: isRefreshing ? 360 : 0 }}
              transition={{
                duration: 0.5,
                repeat: isRefreshing ? Infinity : 0,
              }}
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </motion.svg>
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </motion.button>
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center sm:justify-start gap-2 px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200 w-full sm:w-auto flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>

        {/* Stats Cards */}
        <StatsCards stats={stats} />

        {/* Filters */}
        <FilterSection
          filters={filters}
          setFilters={setFilters}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          onClearFilters={clearFilters}
        />

        {/* History List */}
        <div id="history-section" className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                History{" "}
                <span className="text-blue-600 dark:text-blue-400">
                  ({totalItems})
                </span>
              </h2>
              {totalItems > 0 && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <BarChart3 className="w-4 h-4" />
                    <span>Sorted by most recent</span>
                  </div>
                  {totalItems > pagination.itemsPerPage && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems}
                    </div>
                  )}
                </div>
              )}
            </div>
            <ItemsPerPageSelector
              totalItems={totalItems}
              itemsPerPage={pagination.itemsPerPage}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </div>

          {totalItems > 0 ? (
            <div className="space-y-6">
              <div className="grid gap-4">
                {paginatedHistory.map((item: HistoryItem) => (
                  <HistoryItemComponent
                    key={item._id}
                    item={item}
                    onClick={handleHistoryItemClick}
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={pagination.itemsPerPage}
                startIndex={startIndex}
                endIndex={endIndex}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Results Found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Try adjusting your filters or search terms.
            </p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};
