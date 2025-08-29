"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Brain,
  Clock,
  Trophy,
  Search,
  Filter,
  ChevronRight,
  TrendingUp,
  Calendar,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/lib/Store/userStore";
import {
  useQuizQnAHistoryStore,
  HistoryItem,
  QuizHistoryItem,
  QnAHistoryItem,
} from "@/lib/Store/Quiz-Qna/quizQnaHistoryStore";

interface FilterState {
  type: "all" | "quiz" | "qna";
  performance: "all" | "excellent" | "good" | "needs_improvement";
  dateRange: "all" | "today" | "week" | "month";
  searchTerm: string;
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

  useEffect(() => {
    const loadHistory = async () => {
      if (!token) return;
      await refreshHistory(token);
    };
    loadHistory();
  }, [refreshHistory, token]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatShortDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600 dark:text-green-400";
    if (percentage >= 60) return "text-amber-600 dark:text-amber-400";
    return "text-blue-600 dark:text-blue-400";
  };

  const getScoreBgColor = (percentage: number) => {
    if (percentage >= 80)
      return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
    if (percentage >= 60)
      return "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800";
    return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800";
  };

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
        !isWithinDateRange(item.timestamp, filters.dateRange)
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
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

  const handleHistoryItemClick = (item: HistoryItem) => {
    setSelectedHistoryItem(item);
    router.push(`/quiz_qna/history/${item.id}`);
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            {
              icon: Trophy,
              label: "Total Sessions",
              value: stats.totalItems,
              color: "text-yellow-500",
            },
            {
              icon: BookOpen,
              label: "Quiz Average",
              value: `${stats.avgQuizScore}%`,
              color: "text-blue-500",
              score: stats.avgQuizScore,
            },
            {
              icon: Brain,
              label: "Q&A Average",
              value: `${stats.avgQnaScore}%`,
              color: "text-purple-500",
              score: stats.avgQnaScore,
            },
            {
              icon: TrendingUp,
              label: "Overall Average",
              value: `${stats.overallAvg}%`,
              color: "text-green-500",
              score: stats.overallAvg,
            },
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`p-2 rounded-lg ${stat.color.replace(
                    "text",
                    "bg"
                  )} bg-opacity-10`}
                >
                  <stat.icon className="w-5 h-5" />
                </div>
                <span className="font-medium text-gray-700 dark:text-gray-300 text-sm truncate">
                  {stat.label}
                </span>
              </div>
              <div
                className={`text-2xl font-bold ${
                  stat.score !== undefined
                    ? getScoreColor(stat.score)
                    : "text-gray-900 dark:text-white"
                }`}
              >
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center sm:justify-start gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200 w-full sm:w-auto"
            >
              <Filter className="w-4 h-4" />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>
            {(filters.type !== "all" ||
              filters.performance !== "all" ||
              filters.dateRange !== "all" ||
              filters.searchTerm) && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline w-full sm:w-auto text-center"
              >
                Clear All Filters
              </button>
            )}
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Topic or level..."
                    value={filters.searchTerm}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        searchTerm: e.target.value,
                      }))
                    }
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      type: e.target.value as FilterState["type"],
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="quiz">Quiz</option>
                  <option value="qna">Q&A</option>
                </select>
              </div>

              {/* Performance Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Performance
                </label>
                <select
                  value={filters.performance}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      performance: e.target.value as FilterState["performance"],
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="all">All Performance</option>
                  <option value="excellent">Excellent (80%+)</option>
                  <option value="good">Good (60-79%)</option>
                  <option value="needs_improvement">
                    Needs Improvement (&lt;60%)
                  </option>
                </select>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date Range
                </label>
                <select
                  value={filters.dateRange}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      dateRange: e.target.value as FilterState["dateRange"],
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* History List */}
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              History{" "}
              <span className="text-blue-600 dark:text-blue-400">
                ({filteredHistory.length})
              </span>
            </h2>
            {filteredHistory.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <BarChart3 className="w-4 h-4" />
                <span>Sorted by most recent</span>
              </div>
            )}
          </div>

          {filteredHistory.length > 0 ? (
            <div className="grid gap-4">
              {filteredHistory.map((item: HistoryItem) => {
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

                return (
                  <div
                    key={item.id}
                    onClick={() => handleHistoryItemClick(item)}
                    className="group cursor-pointer transition-all duration-200 hover:transform hover:scale-[1.02]"
                  >
                    <div
                      className={`p-4 rounded-xl border-2 ${getScoreBgColor(
                        percentage
                      )} hover:shadow-md transition-shadow duration-200`}
                    >
                      {/* Header Section */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1 w-[100]">
                          <div
                            className={`p-2 rounded-lg ${
                              item.type === "quiz"
                                ? "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                : "bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
                            }`}
                          >
                            {item.type === "quiz" ? (
                              <BookOpen className="w-4 h-4" />
                            ) : (
                              <Brain className="w-4 h-4" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1  ">
                            <h3
                              className="font-semibold text-gray-900 dark:text-white text-lg truncate  mb-1"
                              title={item.topic}
                            >
                              {item.topic}
                            </h3>
                            <p
                              className="text-sm text-gray-600 dark:text-gray-400 truncate"
                              title={item.educationLevel}
                            >
                              {item.educationLevel}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 flex-shrink-0 mt-2" />
                      </div>

                      {/* Stats Section */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-4">
                          {/* Score */}
                          <div className="flex items-center gap-2">
                            <div
                              className={`p-1 rounded-md ${getScoreColor(
                                percentage
                              ).replace("text", "bg")} bg-opacity-10`}
                            >
                              <Trophy className="w-3 h-3" />
                            </div>
                            <span
                              className={`font-bold text-sm ${getScoreColor(
                                percentage
                              )}`}
                            >
                              {percentage}%
                            </span>
                          </div>

                          {/* Results */}
                          <div className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">
                            {item.type === "quiz"
                              ? `${
                                  (item as QuizHistoryItem).result?.score || 0
                                }/${
                                  (item as QuizHistoryItem).result
                                    ?.totalQuestions || 0
                                } correct`
                              : `${
                                  (item as QnAHistoryItem).result?.totalScore ||
                                  0
                                }/${
                                  (item as QnAHistoryItem).result
                                    ?.maxPossibleScore || 0
                                } points`}
                          </div>
                        </div>

                        {/* Date */}
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="w-3 h-3 flex-shrink-0" />
                          <span
                            className="hidden sm:inline"
                            title={formatDate(item.timestamp)}
                          >
                            {formatDate(item.timestamp)}
                          </span>
                          <span
                            className="sm:hidden"
                            title={formatDate(item.timestamp)}
                          >
                            {formatShortDate(item.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
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
