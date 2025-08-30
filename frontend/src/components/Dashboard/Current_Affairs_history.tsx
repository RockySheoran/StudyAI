"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FaNewspaper,
  FaClock,
  FaExternalLinkAlt,
  FaEye,
  FaHistory,
} from "react-icons/fa";
import { useUserStore } from "@/lib/Store/userStore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCurrentAffairsHistoryStore } from "@/lib/Store/Current-Affairs/currentAffairsHistoryStore";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

const Current_Affairs_History: React.FC = () => {
  const router = useRouter();
  const { token } = useUserStore();
  const {
    getLatestHistory,
    refreshHistory,
    setSelectedHistoryItem,
    setCurrentView,
  } = useCurrentAffairsHistoryStore();

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const loadHistory = async () => {
      if (token && mounted) {
        setLoading(true);
        try {
          await refreshHistory(token);
        } catch (error) {
          console.error("Failed to load current affairs history:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadHistory();
  }, [token, mounted, refreshHistory]);

  const latestHistory = getLatestHistory(2);

  const handleItemClick = (item: any) => {
    setSelectedHistoryItem(item);
    setCurrentView("details");
    router.push("/current-affairs/history");
  };

  const handleSeeAll = () => {
    router.push("/current-affairs/history");
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getReadTimeDisplay = (readTime?: number) => {
    if (!readTime || readTime === 0) return "Not read";
    const minutes = Math.floor(readTime / 60);
    const seconds = readTime % 60;
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <FaNewspaper className="text-blue-600 dark:text-blue-400 text-xl" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Current Affairs History
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Recent articles you've read
            </p>
          </div>
        </div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={handleSeeAll}
            variant="ghost"
            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300"
          >
            See More
            <ExternalLink className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>

      {/* Loading State */}
      {/* {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
        </div>
      )} */}

      {/* History Items */}
      {!loading && latestHistory.length > 0 && (
        <div className="space-y-4">
          {latestHistory.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleItemClick(item)}
              className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-all duration-200 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                      {item.category}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <FaClock className="text-xs" />
                      {formatDate(item.timestamp)}
                    </div>
                  </div>

                  <h4 className="font-medium text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {item.title}
                  </h4>

                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">
                    {item.summary}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <FaEye className="text-xs" />
                      Read time: {getReadTimeDisplay(item.readTime)}
                    </div>
                  </div>
                </div>

                <div className="ml-4 flex-shrink-0">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty State */}
      { latestHistory.length === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaNewspaper className="text-gray-400 dark:text-gray-500 text-2xl" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Current Affairs History
          </h4>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Start reading current affairs to see your history here
          </p>
          <Button
            onClick={() => router.push("/current-affairs")}
            className="bg-indigo-600 mt-2 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl"
            size="lg"
          >
           Start reading
          </Button>
        </div>
      )}
    </div>
  );
};

export default Current_Affairs_History;
