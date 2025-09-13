'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, Brain, Clock, Trophy, AlertCircle, Home } from 'lucide-react';
import QuizResults from '@/components/Quiz-Qna/Quiz/QuizResults';
import QnAResults from '@/components/Quiz-Qna/Qna/QnAResults';
import { useUserStore } from '@/lib/Store/userStore';
import { useQuizQnAHistoryStore, HistoryItem, QuizHistoryItem, QnAHistoryItem } from '@/lib/Store/Quiz-Qna/quizQnaHistoryStore';
import { QuizResult } from '@/types/Qna-Quiz/quiz';
import { QnAResult } from '@/types/Qna-Quiz/qna';

// Helper functions to convert store interfaces to component interfaces
const convertToQuizResult = (storeResult: any): QuizResult => {
  return {
    score: storeResult?.score || 0,
    totalQuestions: storeResult?.totalQuestions || 0,
    correctAnswers: storeResult?.score || 0,
    incorrectAnswers: (storeResult?.totalQuestions || 0) - (storeResult?.score || 0),
    percentage: storeResult?.percentage || 0,
    results: storeResult?.results || []
  };
};

const convertToQnAResult = (storeResult: any): QnAResult => {
  const percentage = storeResult?.totalScore && storeResult?.maxPossibleScore 
    ? Math.round((storeResult.totalScore / storeResult.maxPossibleScore) * 100)
    : 0;
  return {
    totalScore: storeResult?.totalScore || 0,
    maxPossibleScore: storeResult?.maxPossibleScore || 0,
    percentage,
    evaluations: storeResult?.evaluations || []
  };
};

export default function HistoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useUserStore();
  const { allHistory, selectedHistoryItem } = useQuizQnAHistoryStore();
  const [historyItem, setHistoryItem] = useState<HistoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize the current item to prevent unnecessary re-renders
  const currentItem = useMemo(() => {
    if (!params.id) return null;
    
    // First check if we have a selected item from navigation
    if (selectedHistoryItem && selectedHistoryItem._id === params.id) {
      return selectedHistoryItem;
    }
    
    // Find the item in the store
    return allHistory.find(item => item._id === params.id) || null;
  }, [params.id, selectedHistoryItem, allHistory]);

  // Memoize percentage calculation to prevent recalculation on every render
  const percentage = useMemo(() => {
    if (!historyItem) return 0;
    
    return historyItem.type === 'quiz' 
      ? (historyItem as QuizHistoryItem).result?.percentage || 0
      : (historyItem as QnAHistoryItem).result?.totalScore && (historyItem as QnAHistoryItem).result?.maxPossibleScore 
          ? Math.round(((historyItem as QnAHistoryItem).result!.totalScore / (historyItem as QnAHistoryItem).result!.maxPossibleScore) * 100) 
          : 0;
  }, [historyItem]);

  const formatDate = useCallback((date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  const getScoreColor = useCallback((percentage: number) => {
    if (percentage >= 80) return 'text-green-600 dark:text-green-400';
    if (percentage >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  }, []);

  const getScoreBgColor = useCallback((percentage: number) => {
    if (percentage >= 80) return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    if (percentage >= 60) return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
  }, []);

  // Initialize the component state
  useEffect(() => {
    if (!params.id) {
      setError('No history item ID provided');
      setLoading(false);
      return;
    }

    if (currentItem) {
      setHistoryItem(currentItem);
      setError(null);
      setLoading(false);
    } else {
      setError('History item not found');
      setLoading(false);
    }
  }, [params.id, currentItem]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading history details...</p>
        </div>
      </div>
    );
  }

  if (error || !historyItem) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="flex justify-center mb-4">
            <AlertCircle className="w-16 h-16 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {error || 'Item Not Found'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The history item you're looking for doesn't exist or has been removed.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.push('/quiz_qna/history')}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to History
            </button>
            <button
              onClick={() => router.push('/quiz_qna')}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              <Home className="w-4 h-4" />
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200 self-start"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to History</span>
              <span className="sm:hidden">Back</span>
            </button>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 self-start sm:self-auto">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{formatDate(historyItem.createdAt)}</span>
            </div>
          </div>
          
          <div className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex-shrink-0">
              {historyItem.type === 'quiz' ? (
                <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400" />
              ) : (
                <Brain className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 dark:text-purple-400" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  historyItem.type === 'quiz' 
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                }`}>
                  {historyItem.type === 'quiz' ? 'Quiz Session' : 'Q&A Session'}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                  {historyItem.educationLevel}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white truncate">
                {historyItem.topic}
              </h1>
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <div className={`p-4 sm:p-6 rounded-lg border-2 ${getScoreBgColor(percentage)}`}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="text-center col-span-2 md:col-span-1 md:border-r md:dark:border-gray-700">
              <div className={`text-3xl sm:text-4xl font-bold ${getScoreColor(percentage)} mb-2`}>
                {percentage}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Overall Score</div>
            </div>
            <div className="text-center md:border-r md:dark:border-gray-700">
              <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {historyItem.type === 'quiz' ? 'Quiz' : 'Q&A'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Session Type</div>
            </div>
            <div className="text-center">
              <div className="flex flex-col items-center justify-center text-gray-500 mb-2">
                <Clock className="w-5 h-5 mb-1" />
                <span className="text-xs sm:text-sm">{formatDate(historyItem.createdAt).split(',')[0]}</span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Completed On</div>
            </div>
          </div>
        </div>

        {/* Results Component */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          {historyItem.type === 'quiz' ? (
            <QuizResults
              result={convertToQuizResult((historyItem as QuizHistoryItem).result)}
              onRestart={() => router.push('/quiz_qna')}
              showRestartButton={true}
              title={`Quiz Results: ${historyItem.topic}`}
            />
          ) : (
            <QnAResults
              result={convertToQnAResult((historyItem as QnAHistoryItem).result)}
              onRestart={() => router.push('/quiz_qna')}
              showRestartButton={true}
              title={`Q&A Results: ${historyItem.topic}`}
            />
          )}
        </div>
      </div>
    </div>
  );
}