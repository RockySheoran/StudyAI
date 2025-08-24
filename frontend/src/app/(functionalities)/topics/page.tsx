'use client';
import React from 'react';
import axios from 'axios';
import { FaSpinner, FaCheckCircle, FaTimesCircle, FaHistory, FaTrash } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useTopicStore, useTopicResponse, useTopicLoading, useTopicError, useCurrentTopic, useCurrentDetailLevel, useSubmitted, useTopicHistory } from '@/lib/Store/topicStore';
import { useUserStore } from '@/lib/Store/userStore';

const GeminiTopicExplorer: React.FC = () => {
  const {
    currentTopic,
    currentDetailLevel,
    response,
    loading,
    error,
    submitted,
    history,
    setCurrentTopic,
    setCurrentDetailLevel,
    setLoading,
    setError,
    setResponse,
    setSubmitted,
    addToHistory,
    reset,
    removeFromHistory,
    clearHistory
  } = useTopicStore();

  const {token} = useUserStore();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentTopic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setLoading(true);
    setError('');
    setSubmitted(true);

    try {
      const requestData = {
        topic: currentTopic.trim(),
        detailLevel: currentDetailLevel,
        userId: 'user123'
      };

      const result = await axios.post(
        'http://localhost:8005/api/topic/definition',
        requestData,{ headers: { Authorization: `Bearer ${token}` } }
      );

      setResponse(result.data);
      addToHistory(result.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch topic definition');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    reset();
  };

  const loadHistoryItem = (historyItem: any) => {
    setCurrentTopic(historyItem.topic);
    setCurrentDetailLevel(historyItem.detailLevel as 'less' | 'more' | 'most');
    setResponse(historyItem);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
            Educational Topic Explorer
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Explore any topic with AI-powered explanations at different detail levels
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Input Form */}
          <div className="lg:col-span-2">
            {/* Topic input card */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-6"
            >
              <div className="p-6">
                <form onSubmit={handleSubmit}>
                  {/* Topic input */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Topic to explore
                    </label>
                    <input
                      type="text"
                      value={currentTopic}
                      onChange={(e) => setCurrentTopic(e.target.value)}
                      placeholder="e.g., Quantum Physics, Renaissance Art, Machine Learning"
                      disabled={loading}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
                    />
                  </div>
                  
                  {/* Detail level selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Detail level
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['less', 'more', 'most'] as const).map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setCurrentDetailLevel(level)}
                          disabled={loading}
                          className={`py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
                            currentDetailLevel === level
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                          } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={resetForm}
                      disabled={loading || (!currentTopic && !response)}
                      className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
                        !currentTopic && !response
                          ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      Reset
                    </button>
                    <button
                      type="submit"
                      disabled={!currentTopic.trim() || loading}
                      className={`flex-1 py-3 px-4 rounded-lg font-medium text-white transition-colors duration-200 flex items-center justify-center ${
                        !currentTopic.trim() || loading
                          ? 'bg-indigo-400 dark:bg-indigo-800 cursor-not-allowed'
                          : 'bg-indigo-600 dark:bg-indigo-700 hover:bg-indigo-700 dark:hover:bg-indigo-800 cursor-pointer'
                      }`}
                    >
                      {loading ? (
                        <>
                          <FaSpinner className="animate-spin mr-2" />
                          Generating...
                        </>
                      ) : (
                        'Get Definition'
                      )}
                    </button>
                  </div>
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

            {/* Results */}
            <AnimatePresence>
              {response && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-6"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Definition of {response.topic}
                      </h2>
                      <div className="flex items-center space-x-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm">
                        <FaCheckCircle className="flex-shrink-0" />
                        <span>Ready</span>
                      </div>
                    </div>
                    
                    <div className="mb-4 flex items-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">
                        Detail level:
                      </span>
                      <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-md text-sm">
                        {response.detailLevel}
                      </span>
                    </div>
                    
                    <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 mb-4">
                      <div className="whitespace-pre-line bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        {response.definition}
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Generated at: {new Date(response.timestamp).toLocaleString()}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Empty state when no topic has been submitted yet */}
            <AnimatePresence>
              {!submitted && !response && !error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-12 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl"
                >
                  <div className="mb-4 text-4xl">🔍</div>
                  <p>Enter a topic and select your preferred detail level to get started</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column - History */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden h-fit"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <FaHistory className="mr-2" />
                    History
                  </h3>
                  {history.length > 0 && (
                    <button
                      onClick={clearHistory}
                      className="text-sm text-red-500 hover:text-red-700 dark:hover:text-red-400 flex items-center"
                    >
                      <FaTrash className="mr-1" />
                      Clear
                    </button>
                  )}
                </div>

                {history.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
                    No search history yet
                  </p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {history.map((item, index) => (
                      <motion.div
                        key={item.timestamp}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                        onClick={() => loadHistoryItem(item)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                              {item.topic}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {new Date(item.timestamp).toLocaleString()}
                            </p>
                            <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded text-xs">
                              {item.detailLevel}
                            </span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFromHistory(item.timestamp);
                            }}
                            className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 ml-2"
                          >
                            <FaTrash size={12} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeminiTopicExplorer;