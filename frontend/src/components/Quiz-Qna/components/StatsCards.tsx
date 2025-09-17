"use client";

import React from "react";
import { Trophy, BookOpen, Brain, TrendingUp } from "lucide-react";

interface StatsData {
  totalItems: number;
  quizCount: number;
  qnaCount: number;
  avgQuizScore: number;
  avgQnaScore: number;
  overallAvg: number;
}

interface StatsCardsProps {
  stats: StatsData;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600 dark:text-green-400";
    if (percentage >= 60) return "text-amber-600 dark:text-amber-400";
    return "text-blue-600 dark:text-blue-400";
  };

  const statsConfig = [
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
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {statsConfig.map((stat, index) => (
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
  );
};
