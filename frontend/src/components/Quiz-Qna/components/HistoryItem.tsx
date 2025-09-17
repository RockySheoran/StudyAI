"use client";

import React from "react";
import { BookOpen, Brain, Trophy, Calendar, ChevronRight } from "lucide-react";
import {
  HistoryItem as HistoryItemType,
  QuizHistoryItem,
  QnAHistoryItem,
} from "@/lib/Store/Quiz-Qna/quizQnaHistoryStore";

interface HistoryItemProps {
  item: HistoryItemType;
  onClick: (item: HistoryItemType) => void;
}

export const HistoryItem: React.FC<HistoryItemProps> = ({ item, onClick }) => {
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
      onClick={() => onClick(item)}
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
            <div className="min-w-0 flex-1">
              <h3
                className="font-semibold text-gray-900 dark:text-white text-lg truncate mb-1"
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
                className={`font-bold text-sm ${getScoreColor(percentage)}`}
              >
                {percentage}%
              </span>
            </div>

            {/* Results */}
            <div className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">
              {item.type === "quiz"
                ? `${(item as QuizHistoryItem).result?.score || 0}/${
                    (item as QuizHistoryItem).result?.totalQuestions || 0
                  } correct`
                : `${(item as QnAHistoryItem).result?.totalScore || 0}/${
                    (item as QnAHistoryItem).result?.maxPossibleScore || 0
                  } points`}
            </div>
          </div>

          {/* Date */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar className="w-3 h-3 flex-shrink-0" />
            <span
              className="hidden sm:inline"
              title={formatDate(item.createdAt)}
            >
              {formatDate(item.createdAt)}
            </span>
            <span className="sm:hidden" title={formatDate(item.createdAt)}>
              {formatShortDate(item.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
