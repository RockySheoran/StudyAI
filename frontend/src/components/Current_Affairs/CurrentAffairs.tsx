'use client';
import React, { useState, useEffect } from 'react';
import ArticleModal from './ArticleModal';
import { AffairType, CurrentAffair, PaginationInfo } from '@/types/Current-Affairs/CurrentAffair-types';
import { fetchCurrentAffairs } from '@/Actions/Current_Affairs/CurrentAffair_Api';
import { FaHistory, FaSearch, FaChevronRight, FaSpinner, FaTimesCircle } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '@/lib/Store/userStore';

const CurrentAffairs: React.FC = () => {
  const [type, setType] = useState<AffairType>('random');
  const [customCategory, setCustomCategory] = useState('');
  const [affairs, setAffairs] = useState<CurrentAffair[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedAffair, setSelectedAffair] = useState<CurrentAffair | null>(null);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {token} = useUserStore();
  const handleSubmit = async (e: React.FormEvent, page: number = 1) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const category = type === 'custom' ? customCategory : undefined;
      const result = await fetchCurrentAffairs(type, category, page , token!);
      setAffairs(result.affairs);
      setPagination(result.pagination);
    } catch (err) {
      setError('Failed to fetch current affairs. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (!pagination || !pagination.hasNext) return;
    
    setLoading(true);
    try {
      const category = type === 'custom' ? customCategory : undefined;
      const result = await fetchCurrentAffairs(type, category, pagination.currentPage + 1 , token!);
      setAffairs([...affairs, ...result.affairs]);
      setPagination(result.pagination);
    } catch (err) {
      setError('Failed to load more articles. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (affair: CurrentAffair) => {
    setSelectedAffair(affair);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedAffair(null);
  };

  const goToHistory = () => {
    router.push('/current-affairs/history');
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex flex-col sm:flex-row gap-3 justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
              Current Affairs Explorer
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Stay updated with the latest news and articles on various topics
            </p>
          </div>
          <motion.button
            onClick={goToHistory}
            className="flex items-center gap-2 bg-indigo-600 dark:bg-indigo-700 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaHistory className="text-lg" />
            View History
          </motion.button>
        </motion.div>

        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="p-6">
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Article Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      checked={type === 'random'}
                      onChange={() => setType('random')}
                      className="form-radio h-5 w-5 text-indigo-600 dark:text-indigo-400"
                    />
                    <span className="ml-2 text-gray-700 dark:text-gray-300">Random</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      checked={type === 'custom'}
                      onChange={() => setType('custom')}
                      className="form-radio h-5 w-5 text-indigo-600 dark:text-indigo-400"
                    />
                    <span className="ml-2 text-gray-700 dark:text-gray-300">Custom</span>
                  </label>
                </div>
              </div>
              
              {type === 'custom' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Enter Category
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      className="w-full px-4 py-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
                      placeholder="e.g., Technology, Politics, Sports"
                      required
                    />
                    <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
                  </div>
                </div>
              )}
              
              <motion.button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 dark:bg-indigo-700 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors duration-200 flex items-center justify-center"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Loading...
                  </>
                ) : (
                  'Get Current Affairs'
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>

        {/* Error messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start"
            >
              <FaTimesCircle className="flex-shrink-0 mt-0.5 text-red-500 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Articles List */}
        <div className="space-y-6">
          <AnimatePresence>
            {affairs?.map((affair, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
              >
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{affair.title}</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">{affair.summary}</p>
                <motion.button
                  onClick={() => openModal(affair)}
                  className="flex items-center gap-2 bg-indigo-600 dark:bg-indigo-700 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Show More
                  <FaChevronRight className="text-sm" />
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Load More Button */}
        {pagination && pagination.hasNext && (
          <div className="mt-8 text-center">
            <motion.button
              onClick={loadMore}
              disabled={loading}
              className="bg-indigo-600 dark:bg-indigo-700 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin inline mr-2" />
                  Loading...
                </>
              ) : (
                'Load More'
              )}
            </motion.button>
          </div>
        )}

        {/* Empty state when no articles */}
        <AnimatePresence>
          {affairs?.length === 0 && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl mt-6"
            >
              <div className="mb-4 text-4xl">📰</div>
              <p>Select a type and get the latest current affairs</p>
            </motion.div>
          )}
        </AnimatePresence>
        
        {showModal && selectedAffair && (
          <ArticleModal affair={selectedAffair} onClose={closeModal} />
        )}
      </div>
    </div>
  );
};

export default CurrentAffairs;