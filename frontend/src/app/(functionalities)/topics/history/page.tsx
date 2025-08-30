"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  FileText,
  Layers,
  Clock,
  Search,
  Filter,
  ChevronRight,
  TrendingUp,
  Calendar,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/lib/Store/userStore";
import {
  useTopicHistoryStore,
  TopicHistoryItem,
} from "@/lib/Store/Topics/topicHistoryStore";
import { motion } from "framer-motion";

interface FilterState {
  detailLevel: "all" | "less" | "more" | "most";
  dateRange: "all" | "today" | "week" | "month";
  searchTerm: string;
}

export default function TopicsFullHistory() {
  const router = useRouter();
  const { token } = useUserStore();
  const { allHistory, refreshHistory, setSelectedHistoryItem } =
    useTopicHistoryStore();

  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    detailLevel: "all",
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
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshHistory(token!, true);
    setIsRefreshing(false);
  };

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

  const getDetailLevelColor = (level: string) => {
    switch (level) {
      case "less":
        return "text-green-600 dark:text-green-400";
      case "more":
        return "text-amber-600 dark:text-amber-400";
      case "most":
        return "text-blue-600 dark:text-blue-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const getDetailLevelBgColor = (level: string) => {
    switch (level) {
      case "less":
        return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
      case "more":
        return "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800";
      case "most":
        return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800";
      default:
        return "bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800";
    }
  };

  const getDetailLevelIcon = (level: string) => {
    switch (level) {
      case "less":
        return <FileText className="w-4 h-4" />;
      case "more":
        return <BookOpen className="w-4 h-4" />;
      case "most":
        return <Layers className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getDetailLevelLabel = (level: string) => {
    switch (level) {
      case "less":
        return "Brief";
      case "more":
        return "Detailed";
      case "most":
        return "Comprehensive";
      default:
        return level;
    }
  };

  const filteredHistory = allHistory
    .filter((item: TopicHistoryItem) => {
      // Search filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        if (
          !item.topic.toLowerCase().includes(searchLower) &&
          !item.definition.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }

      // Detail level filter
      if (
        filters.detailLevel !== "all" &&
        item.detailLevel !== filters.detailLevel
      ) {
        return false;
      }

      // Date range filter
      if (filters.dateRange !== "all") {
        const itemDate = new Date(item.timestamp);
        const now = new Date();
        const today = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );

        switch (filters.dateRange) {
          case "today":
            if (itemDate < today) return false;
            break;
          case "week":
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            if (itemDate < weekAgo) return false;
            break;
          case "month":
            const monthAgo = new Date(
              today.getTime() - 30 * 24 * 60 * 60 * 1000
            );
            if (itemDate < monthAgo) return false;
            break;
        }
      }

      return true;
    })
    .sort(
      (a: TopicHistoryItem, b: TopicHistoryItem) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

  const handleHistoryItemClick = (item: TopicHistoryItem) => {
    setSelectedHistoryItem(item);
    router.push(`/topics/history/${item.id}`);
  };

  const clearFilters = () => {
    setFilters({
      detailLevel: "all",
      dateRange: "all",
      searchTerm: "",
    });
  };

  const getStatsData = () => {
    const totalItems = allHistory.length;
    const detailLevelCounts = {
      less: allHistory.filter((item) => item.detailLevel === "less").length,
      more: allHistory.filter((item) => item.detailLevel === "more").length,
      most: allHistory.filter((item) => item.detailLevel === "most").length,
    };

    return {
      totalItems,
      detailLevelCounts,
      mostUsedLevel: Object.entries(detailLevelCounts).reduce((a, b) =>
        detailLevelCounts[a[0] as keyof typeof detailLevelCounts] >
        detailLevelCounts[b[0] as keyof typeof detailLevelCounts]
          ? a
          : b
      )[0],
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
              Complete Topic History
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
              View all your topic definitions and explanations
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
              icon: BookOpen,
              label: "Total Topics",
              value: stats.totalItems,
              color: "text-blue-500",
            },
            {
              icon: FileText,
              label: "Brief Explanations",
              value: stats.detailLevelCounts.less,
              color: "text-green-500",
            },
            {
              icon: BookOpen,
              label: "Detailed Explanations",
              value: stats.detailLevelCounts.more,
              color: "text-amber-500",
            },
            {
              icon: Layers,
              label: "Comprehensive",
              value: stats.detailLevelCounts.most,
              color: "text-blue-500",
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
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
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
            {(filters.detailLevel !== "all" ||
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Topic or definition..."
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

              {/* Detail Level Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Detail Level
                </label>
                <select
                  value={filters.detailLevel}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      detailLevel: e.target.value as FilterState["detailLevel"],
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="all">All Levels</option>
                  <option value="less">Brief</option>
                  <option value="more">Detailed</option>
                  <option value="most">Comprehensive</option>
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
            <div className="space-y-4">
              {filteredHistory.map((item: TopicHistoryItem) => (
                <div
                  key={item.id}
                  onClick={() => handleHistoryItemClick(item)}
                  className="group cursor-pointer transition-all duration-200 hover:transform hover:scale-[1.02]"
                >
                  <div
                    className={`p-4 rounded-xl border-2 ${getDetailLevelBgColor(
                      item.detailLevel
                    )} hover:shadow-md transition-shadow duration-200`}
                  >
                    {/* Header Section */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div
                          className={`p-2 rounded-lg ${getDetailLevelColor(
                            item.detailLevel
                          ).replace("text", "bg")} bg-opacity-10`}
                        >
                          {getDetailLevelIcon(item.detailLevel)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3
                            className="font-semibold text-gray-900 dark:text-white text-lg truncate mb-1"
                            title={item.topic}
                          >
                            {item.topic}
                          </h3>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              item.detailLevel === "less"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                : item.detailLevel === "more"
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                            }`}
                          >
                            {getDetailLevelLabel(item.detailLevel)}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 flex-shrink-0 mt-2" />
                    </div>

                    {/* Definition */}
                    <div className="mb-3">
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                        {item.definition.length > 200
                          ? `${item.definition.substring(0, 200)}...`
                          : item.definition}
                      </p>
                    </div>

                    {/* Date */}
                    <div className="flex items-center justify-end">
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
              ))}
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
}
