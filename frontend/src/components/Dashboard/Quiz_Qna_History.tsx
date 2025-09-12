'use client';

import React, { useEffect } from 'react';
import { Clock, BookOpen, Brain, ChevronRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/lib/Store/userStore';
import { useQuizQnAHistoryStore, HistoryItem, QuizHistoryItem, QnAHistoryItem } from '@/lib/Store/Quiz-Qna/quizQnaHistoryStore';
import { Button } from '../ui/button';

export const Quiz_Qna_History = () => {
    const router = useRouter();
    const { token } = useUserStore();
    const {
        activeTab,
        setActiveTab,
        getQuizHistory,
        getQnAHistory,
        refreshHistory
    } = useQuizQnAHistoryStore();

    useEffect(() => {
        const loadHistory = async () => {
            if (!token) return;
            await refreshHistory( token );
        };
        loadHistory();
    }, [refreshHistory, token]);

    // Get latest 2 items for each category
    const quizHistory = getQuizHistory(2);
    const qnaHistory = getQnAHistory(2);

    
    const formatDate = (timestamp: Date) => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getScoreColor = (percentage: number) => {
        if (percentage >= 80) return 'text-green-600 dark:text-green-400';
        if (percentage >= 60) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    const getScoreBgColor = (percentage: number) => {
        if (percentage >= 80) return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
        if (percentage >= 60) return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    };

    const handleHistoryItemClick = (item: HistoryItem) => {
        router.push(`/quiz_qna/history/${item.id}`);
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Quiz & Q&A History
                </h2>
                <Link 
                    href="/quiz_qna/history"
                    className="flex items-center gap-2 px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200 text-sm font-medium"
                >
                    See More
                    <ExternalLink className="w-4 h-4" />
                </Link>
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                    onClick={() => setActiveTab('quiz')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                        activeTab === 'quiz'
                            ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                >
                    <BookOpen className="w-4 h-4" />
                    Quiz ({quizHistory.length})
                </button>
                <button
                    onClick={() => setActiveTab('qna')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                        activeTab === 'qna'
                            ? 'bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 shadow-sm'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                >
                    <Brain className="w-4 h-4" />
                    Q&A ({qnaHistory.length})
                </button>
            </div>

            {/* History Content */}
            <div className="space-y-4">
                {activeTab === 'quiz' && (
                    <>
                        {quizHistory.length === 0 ? (
                            <div className="text-center py-8">
                                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500 dark:text-gray-400">No quiz history available</p>
                                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                                    Complete a quiz to see your history here
                                </p>
                                <Button
                                    onClick={() => router.push("/quiz_qna/quiz")}
                                    className="bg-indigo-600 mt-2 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl"
                                    size="lg"
                                >
                                    Start Quiz
                                </Button> 
                            </div>
                        ) : (
                            quizHistory.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => handleHistoryItemClick(item)}
                                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${getScoreBgColor((item as QuizHistoryItem).result?.percentage || 0)}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                <h3 className="font-medium text-gray-900 dark:text-white">
                                                    {item?.topic}
                                                </h3>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    {formatDate(item.createdAt)}
                                                </span>
                                                <span>{item.educationLevel}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <div className={`text-lg font-bold ${getScoreColor((item as QuizHistoryItem).result?.percentage || 0)}`}>
                                                    {(item as QuizHistoryItem).result?.percentage || 0}%
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {(item as QuizHistoryItem).result?.score || 0}/{(item as QuizHistoryItem).result?.totalQuestions || 0}
                                                </div>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-gray-400" />
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </>
                )}

                {activeTab === 'qna' && (
                    <>
                        {qnaHistory.length === 0 ? (
                            <div className="text-center py-8">
                                <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500 dark:text-gray-400">No Q&A history available</p>
                                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                                    Complete a Q&A session to see your history here
                                </p>
                                <Button
                                    onClick={() => router.push("/quiz_qna/qna")}
                                    className="bg-indigo-600 mt-2 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl"
                                    size="lg"
                                >
                                    Start Q&A
                                </Button>
                            </div>
                        ) : (
                            qnaHistory.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => handleHistoryItemClick(item)}
                                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${getScoreBgColor(
                                        (item as QnAHistoryItem).result?.totalScore && (item as QnAHistoryItem).result?.maxPossibleScore 
                                            ? Math.round(((item as QnAHistoryItem).result!.totalScore / (item as QnAHistoryItem).result!.maxPossibleScore) * 100) 
                                            : 0
                                    )}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                                <h3 className="font-medium text-gray-900 dark:text-white">
                                                    {item.topic}
                                                </h3>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    {formatDate(item.createdAt)}
                                                </span>
                                                <span>{item.educationLevel}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <div className={`text-lg font-bold ${getScoreColor(
                                                    (item as QnAHistoryItem).result?.totalScore && (item as QnAHistoryItem).result?.maxPossibleScore 
                                                        ? Math.round(((item as QnAHistoryItem).result!.totalScore / (item as QnAHistoryItem).result!.maxPossibleScore) * 100) 
                                                        : 0
                                                )}`}>
                                                    {(item as QnAHistoryItem).result?.totalScore && (item as QnAHistoryItem).result?.maxPossibleScore 
                                                        ? Math.round(((item as QnAHistoryItem).result!.totalScore / (item as QnAHistoryItem).result!.maxPossibleScore) * 100) 
                                                        : 0}%
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {(item as QnAHistoryItem).result?.totalScore || 0}/{(item as QnAHistoryItem).result?.maxPossibleScore || 0}
                                                </div>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-gray-400" />
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </>
                )}
            </div>
        </div>
    );
};