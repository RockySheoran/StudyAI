'use client';
import React, { useState, useEffect } from 'react';
import ArticleModal from './ArticleModal';
import { CurrentAffair, PaginationInfo } from '@/types/Current-Affairs/CurrentAffair-types';
import { fetchHistory } from '@/Actions/Current_Affairs/CurrentAffair_Api';
import { FaHistory, FaChevronRight, FaClock, FaFolder, FaArrowLeft, FaSpinner, FaTimesCircle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/lib/Store/userStore';

const History: React.FC = () => {
  const [affairs, setAffairs] = useState<CurrentAffair[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAffair, setSelectedAffair] = useState<CurrentAffair | null>(null);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const {token} = useUserStore();

  useEffect(() => {
    setMounted(true);
    const loadHistory = async () => {
      try {
        const history = await fetchHistory(1, token!);
        setAffairs(history.affairs);
        setPagination(history.pagination);
      } catch (err) {
        setError('Failed to load history. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  const loadMore = async () => {
    if (!pagination || !pagination.hasNext) return;
    
    setLoading(true);
    try {
      const history = await fetchHistory(pagination.currentPage + 1, token!);
      setAffairs([...affairs, ...history.affairs]);
      setPagination(history.pagination);
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

  const goBack = () => {
    router.back();
  };

  if (!mounted) {
    return null;
  }

  if (loading && affairs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 transition-colors duration-300">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <FaSpinner className="animate-spin text-4xl mx-auto mb-3" />
              <p>Loading your history...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex justify-between items-center"
        >
          <div className="flex items-center gap-3">
            <motion.button
              onClick={goBack}
              className="flex items-center gap-2 bg-indigo-600 dark:bg-indigo-700 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaArrowLeft className="text-sm" />
              Go Back
            </motion.button>
            <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
              <FaHistory className="text-xl" />
            </div>
            <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">Reading History</h1>
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

        {/* Empty state */}
        {affairs.length === 0 ? (
          <motion.div 
            className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg text-center border border-gray-200 dark:border-gray-700"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <FaHistory className="text-4xl text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300">No reading history available yet.</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Articles you read will appear here.
            </p>
          </motion.div>
        ) : (
          <>
            <div className="space-y-6">
              {affairs.map((affair, index) => (
                <motion.div 
                  key={affair._id || index} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
                >
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{affair.title}</h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{affair.summary}</p>
                  
                  <div className="flex flex-wrap gap-4 items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {affair.createdAt && (
                      <div className="flex items-center gap-1">
                        <FaClock className="text-xs" />
                        <span>{new Date(affair.createdAt).toLocaleDateString()}</span>
                      </div>
                    )}
                    {affair.category && (
                      <div className="flex items-center gap-1">
                        <FaFolder className="text-xs" />
                        <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-md">
                          {affair.category}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end">
                    <motion.button
                      onClick={() => openModal(affair)}
                      className="flex items-center gap-2 bg-indigo-600 dark:bg-indigo-700 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Read Full Article
                      <FaChevronRight className="text-xs" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
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
          </>
        )}
        
        {showModal && selectedAffair && (
          <ArticleModal affair={selectedAffair} onClose={closeModal} />
        )}
      </div>
    </div>
  );
};

export default History;