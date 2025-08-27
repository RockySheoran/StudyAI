'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaNewspaper, 
  FaClock, 
  FaFilter, 
  FaSearch, 
  FaTimes, 
  FaChevronDown,
  FaArrowLeft,
  FaEye,
  FaExternalLinkAlt
} from 'react-icons/fa';
import { useCurrentAffairsHistoryStore, CurrentAffairsHistoryItem } from '@/lib/Store/Current-Affairs/currentAffairsHistoryStore';
import { useUserStore } from '@/lib/Store/userStore';
import { useRouter } from 'next/navigation';

interface FilterState {
  search: string;
  category: string;
  dateRange: 'all' | 'today' | 'week' | 'month';
}

const CurrentAffairsFullHistory: React.FC = () => {
  const router = useRouter();
  const { token } = useUserStore();
  const {
    allHistory,
    selectedHistoryItem,
    currentView,
    setSelectedHistoryItem,
    setCurrentView,
    refreshHistory
  } = useCurrentAffairsHistoryStore();

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: 'all',
    dateRange: 'all'
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const loadHistory = async () => {
      if (token && mounted) {
        setLoading(true);
        try {
          await refreshHistory({ token });
        } catch (error) {
          console.error('Failed to load current affairs history:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadHistory();
  }, [token, mounted, refreshHistory]);

  // Get unique categories
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(allHistory.map(item => item.category)));
    return uniqueCategories.sort();
  }, [allHistory]);

  // Filter history based on current filters
  const filteredHistory = useMemo(() => {
    let filtered = [...allHistory];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchLower) ||
        item.summary.toLowerCase().includes(searchLower) ||
        item.category.toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(item => item.category === filters.category);
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.timestamp);
        
        switch (filters.dateRange) {
          case 'today':
            return itemDate >= today;
          case 'week':
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            return itemDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            return itemDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [allHistory, filters]);

  // Statistics
  const statistics = useMemo(() => {
    const totalSessions = allHistory.length;
    const totalReadTime = allHistory.reduce((sum, item) => sum + (item.readTime || 0), 0);
    const averageReadTime = totalSessions > 0 ? totalReadTime / totalSessions : 0;
    const categoriesRead = new Set(allHistory.map(item => item.category)).size;

    return {
      totalSessions,
      totalReadTime,
      averageReadTime,
      categoriesRead
    };
  }, [allHistory]);

  const handleItemClick = (item: CurrentAffairsHistoryItem) => {
    setSelectedHistoryItem(item);
    setCurrentView('details');
  };

  const handleBackToHistory = () => {
    setCurrentView('history');
    setSelectedHistoryItem(null);
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: 'all',
      dateRange: 'all'
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatReadTime = (seconds: number) => {
    if (seconds === 0) return 'Not read';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  const formatTotalTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (!mounted) {
    return null;
  }

  // Detail view for selected item
  if (currentView === 'details' && selectedHistoryItem) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <motion.button
            onClick={handleBackToHistory}
            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-6 transition-colors duration-200"
            whileHover={{ x: -5 }}
          >
            <FaArrowLeft />
            Back to History
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700"
          >
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                  {selectedHistoryItem.category}
                </span>
                <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                  <FaClock className="text-xs" />
                  {formatDate(selectedHistoryItem.timestamp)}
                </div>
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {selectedHistoryItem.title}
              </h1>
              
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
                <div className="flex items-center gap-1">
                  <FaEye className="text-xs" />
                  Read time: {formatReadTime(selectedHistoryItem.readTime || 0)}
                </div>
                {selectedHistoryItem.sourceUrl && (
                  <a
                    href={selectedHistoryItem.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    <FaExternalLinkAlt className="text-xs" />
                    Source
                  </a>
                )}
              </div>
            </div>

            <div className="prose dark:prose-invert max-w-none">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Summary</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {selectedHistoryItem.summary}
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Full Content</h3>
                <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {selectedHistoryItem.fullContent}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Main history view
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <motion.button
              onClick={handleBackToDashboard}
              className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200"
              whileHover={{ x: -5 }}
            >
              <FaArrowLeft />
              Dashboard
            </motion.button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Current Affairs History
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Complete history of your current affairs reading
              </p>
            </div>
          </div>
        </motion.div>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <FaNewspaper className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {statistics.totalSessions}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Articles</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <FaClock className="text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatTotalTime(statistics.totalReadTime)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Read Time</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <FaClock className="text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatReadTime(Math.round(statistics.averageReadTime))}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Avg Read Time</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <FaNewspaper className="text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {statistics.categoriesRead}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Categories</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 mb-8"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Filter History
              </h3>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200"
              >
                <FaFilter />
                <FaChevronDown className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Search
                      </label>
                      <div className="relative">
                        <FaSearch className="absolute left-3 top-3 text-gray-400" />
                        <input
                          type="text"
                          value={filters.search}
                          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Search articles..."
                        />
                      </div>
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Category
                      </label>
                      <select
                        value={filters.category}
                        onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">All Categories</option>
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>

                    {/* Date Range */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Date Range
                      </label>
                      <select
                        value={filters.dateRange}
                        onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value as any }))}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={clearFilters}
                      className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200"
                    >
                      <FaTimes />
                      Clear Filters
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
          </div>
        )}

        {/* History List */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            {filteredHistory.length > 0 ? (
              filteredHistory.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleItemClick(item)}
                  className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl cursor-pointer transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                          {item.category}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <FaClock className="text-xs" />
                          {formatDate(item.timestamp)}
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                        {item.title}
                      </h3>
                      
                      <p className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                        {item.summary}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <FaEye className="text-xs" />
                          Read time: {formatReadTime(item.readTime || 0)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-4 flex-shrink-0">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaNewspaper className="text-gray-400 dark:text-gray-500 text-2xl" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No Articles Found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {filters.search || filters.category !== 'all' || filters.dateRange !== 'all'
                    ? 'Try adjusting your filters to see more results'
                    : 'Start reading current affairs to see your history here'
                  }
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CurrentAffairsFullHistory;
