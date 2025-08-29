'use client';

import React, { useEffect } from 'react';
import { Clock, BookOpen, ChevronRight, ExternalLink, FileText, Layers } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/lib/Store/userStore';
import { motion } from 'framer-motion';
import { FaBook, FaHistory } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { TopicHistoryItem, useTopicHistoryStore } from '@/lib/Store/Topics/topicHistoryStore';

export const Topic_History = () => {
    const router = useRouter();
    const { token } = useUserStore();
    const {
        getLatestHistory,
        refreshHistory,
        setSelectedHistoryItem
    } = useTopicHistoryStore();

    useEffect(() => {
        const loadHistory = async () => {
            if (!token) return;
            await refreshHistory({ token });
        };
        loadHistory();
    }, [refreshHistory, token]);

    // Get latest 3 items
    const topicHistory = getLatestHistory(3);

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getDetailLevelColor = (level: string) => {
        switch (level) {
            case 'less': return 'text-green-600 dark:text-green-400';
            case 'more': return 'text-amber-600 dark:text-amber-400';
            case 'most': return 'text-blue-600 dark:text-blue-400';
            default: return 'text-gray-600 dark:text-gray-400';
        }
    };

    const getDetailLevelBgColor = (level: string) => {
        switch (level) {
            case 'less': return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
            case 'more': return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800';
            case 'most': return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
            default: return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
        }
    };

    const getDetailLevelIcon = (level: string) => {
        switch (level) {
            case 'less': return <FileText className="w-4 h-4" />;
            case 'more': return <BookOpen className="w-4 h-4" />;
            case 'most': return <Layers className="w-4 h-4" />;
            default: return <FileText className="w-4 h-4" />;
        }
    };

    const getDetailLevelLabel = (level: string) => {
        switch (level) {
            case 'less': return 'Brief';
            case 'more': return 'Detailed';
            case 'most': return 'Comprehensive';
            default: return level;
        }
    };

    const handleHistoryItemClick = (item: TopicHistoryItem) => {
        setSelectedHistoryItem(item);
        router.push(`/topics/history/${item.id}`);
    };

    const handleSeeAll = () => {
        router.push('/topics/history');
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Topic History
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Recent topic definitions and explanations
                    </p>
                </div>
                <Link
                    href="/topics/history"
                    className="flex items-center gap-2 px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200"
                >
                    <span className="text-sm font-medium">See More</span>
                    <ExternalLink className="w-4 h-4" />
                </Link>
            </div>

            <div className="space-y-4">
                {topicHistory.length === 0 ? (
                    <div className="text-center py-8">
                        <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">No topic history available</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                            Search for topics to see your history here
                        </p>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Button
                                onClick={() => router.push('/topics')}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl"
                                size="lg"
                            >
                                Explore Your First Topic
                            </Button>
                        </motion.div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {topicHistory.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => handleHistoryItemClick(item)}
                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${getDetailLevelBgColor(item.detailLevel)}`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className={`p-2 rounded-lg ${getDetailLevelColor(item.detailLevel).replace('text', 'bg')} bg-opacity-10`}>
                                                {getDetailLevelIcon(item.detailLevel)}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-medium text-gray-900 dark:text-white truncate" title={item.topic}>
                                                    {item.topic}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                        item.detailLevel === 'less' 
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                                            : item.detailLevel === 'more'
                                                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400'
                                                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                                    }`}>
                                                        {getDetailLevelLabel(item.detailLevel)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {formatDate(item.timestamp)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2" title={item.definition}>
                                            {item.definition.length > 100 
                                                ? `${item.definition.substring(0, 100)}...` 
                                                : item.definition
                                            }
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3 ml-4">
                                        <ChevronRight className="w-5 h-5 text-gray-400" />
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        {topicHistory.length > 0 && (
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button
                                    onClick={handleSeeAll}
                                    variant="outline"
                                    className="flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-700 hover:bg-indigo-200 dark:hover:bg-indigo-900/50"
                                >
                                    <FaHistory className="h-4 w-4" />
                                    See All
                                </Button>
                            </motion.div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};