'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, FileText, Layers, Clock, AlertCircle, Home, Copy, Check } from 'lucide-react';
import { useUserStore } from '@/lib/Store/userStore';
import { useTopicHistoryStore, TopicHistoryItem } from '@/lib/Store/Topics/topicHistoryStore';

export default function TopicDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useUserStore();
  const { allHistory, selectedHistoryItem } = useTopicHistoryStore();
  const [topicItem, setTopicItem] = useState<TopicHistoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Memoize the current item to prevent unnecessary re-renders
  const currentItem = useMemo(() => {
    if (!params.id) return null;
    
    // First check if we have a selected item from navigation
    if (selectedHistoryItem && selectedHistoryItem.id === params.id) {
      return selectedHistoryItem;
    }
    
    // Find the item in the store
    return allHistory.find(item => item.id === params.id) || null;
  }, [params.id, selectedHistoryItem, allHistory]);

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

  const getDetailLevelColor = useCallback((level: string) => {
    switch (level) {
      case 'less': return 'text-green-600 dark:text-green-400';
      case 'more': return 'text-amber-600 dark:text-amber-400';
      case 'most': return 'text-blue-600 dark:text-blue-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  }, []);

  const getDetailLevelBgColor = useCallback((level: string) => {
    switch (level) {
      case 'less': return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'more': return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800';
      case 'most': return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      default: return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
    }
  }, []);

  const getDetailLevelIcon = useCallback((level: string) => {
    switch (level) {
      case 'less': return <FileText className="w-6 h-6 sm:w-8 sm:h-8" />;
      case 'more': return <BookOpen className="w-6 h-6 sm:w-8 sm:h-8" />;
      case 'most': return <Layers className="w-6 h-6 sm:w-8 sm:h-8" />;
      default: return <FileText className="w-6 h-6 sm:w-8 sm:h-8" />;
    }
  }, []);

  const getDetailLevelLabel = useCallback((level: string) => {
    switch (level) {
      case 'less': return 'Brief Explanation';
      case 'more': return 'Detailed Explanation';
      case 'most': return 'Comprehensive Explanation';
      default: return level;
    }
  }, []);

  // Initialize the component state
  useEffect(() => {
    if (!params.id) {
      setError('No topic item ID provided');
      setLoading(false);
      return;
    }

    if (currentItem) {
      setTopicItem(currentItem);
      setError(null);
      setLoading(false);
    } else {
      setError('Topic item not found');
      setLoading(false);
    }
  }, [params.id, currentItem]);

  const handleCopyDefinition = async () => {
    if (!topicItem) return;
    
    try {
      await navigator.clipboard.writeText(topicItem.definition);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading topic details...</p>
        </div>
      </div>
    );
  }

  if (error || !topicItem) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="flex justify-center mb-4">
            <AlertCircle className="w-16 h-16 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {error || 'Topic Not Found'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The topic you're looking for doesn't exist or has been removed.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.push('/topics/history')}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to History
            </button>
            <button
              onClick={() => router.push('/topics')}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              <Home className="w-4 h-4" />
              Go to Topics
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
              <span className="truncate">{formatDate(topicItem.timestamp)}</span>
            </div>
          </div>
          
          <div className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className={`p-3 rounded-lg flex-shrink-0 ${getDetailLevelColor(topicItem.detailLevel).replace('text', 'bg')} bg-opacity-10`}>
              {getDetailLevelIcon(topicItem.detailLevel)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  topicItem.detailLevel === 'less' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : topicItem.detailLevel === 'more'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                }`}>
                  {getDetailLevelLabel(topicItem.detailLevel)}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                {topicItem.topic}
              </h1>
            </div>
          </div>
        </div>

        {/* Definition Card */}
        <div className={`p-6 rounded-xl border-2 ${getDetailLevelBgColor(topicItem.detailLevel)}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Definition
            </h2>
            <button
              onClick={handleCopyDefinition}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </button>
          </div>
          
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
              {topicItem.definition}
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Topic Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Detail Level
              </label>
              <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${
                topicItem.detailLevel === 'less' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  : topicItem.detailLevel === 'more'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400'
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
              }`}>
                {getDetailLevelIcon(topicItem.detailLevel)}
                <span className="font-medium">{getDetailLevelLabel(topicItem.detailLevel)}</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Created On
              </label>
              <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                <Clock className="w-4 h-4" />
                <span>{formatDate(topicItem.timestamp)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => router.push('/topics/history')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to History
          </button>
          <button
            onClick={() => router.push('/topics')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
          >
            <BookOpen className="w-4 h-4" />
            Search New Topic
          </button>
        </div>
      </div>
    </div>
  );
}
