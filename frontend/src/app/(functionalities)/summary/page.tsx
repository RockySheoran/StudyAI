'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { FaRobot, FaFileAlt, FaUpload, FaHistory } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/lib/Store/userStore';
import { useSummaryStore } from '@/lib/Store/Summary/summaryStore';
import FileUploadComponent from '@/components/Summary/FileUploadComponent';
import ProgressIndicator from '@/components/Summary/ProgressIndicator';
import SummaryDisplay from '@/components/Summary/SummaryDisplay';

const SummaryPage = () => {
  const router = useRouter();
  const { token } = useUserStore();
  const { 
    selectedFile, 
    status, 
    uploadFile, 
    resetSession 
  } = useSummaryStore();

  const handleUpload = async () => {
    if (!selectedFile || !token) return;
    
    try {
      await uploadFile(selectedFile, token);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const canUpload = selectedFile && token && status === 'idle';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          {/* Mobile-First Header Layout */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            {/* Title Section */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start mb-4">
                <div className="p-2 sm:p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mr-3 sm:mr-4">
                  <FaRobot className="text-indigo-600 dark:text-indigo-400 text-2xl sm:text-3xl" />
                </div>
                <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <FaFileAlt className="text-blue-600 dark:text-blue-400 text-2xl sm:text-3xl" />
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">
                AI Document Summarizer
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto sm:mx-0">
                Transform your lengthy documents into concise, intelligent summaries with our advanced AI technology
              </p>
            </div>

            {/* History Button - Responsive */}
            <motion.button
              onClick={() => router.push('/summary/history')}
              className="flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors duration-200 font-medium text-sm sm:text-base whitespace-nowrap flex-shrink-0 w-full sm:w-auto"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <FaHistory className="text-sm sm:text-base" />
              <span className="sm:inline">History</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Upload Section */}
          {(status === 'idle' || status === 'failed' || status === 'cancelled') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="p-8">
                <div className="flex items-center mb-6">
                  <FaUpload className="text-indigo-600 dark:text-indigo-400 text-xl mr-3" />
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    Upload Your Document
                  </h2>
                </div>
                
                <FileUploadComponent />
                
                {/* Upload Button */}
                {selectedFile && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6"
                  >
                    <motion.button
                      onClick={handleUpload}
                      disabled={!canUpload}
                      className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 ${
                        canUpload
                          ? 'bg-indigo-600 dark:bg-indigo-700 text-white hover:bg-indigo-700 dark:hover:bg-indigo-800 shadow-lg hover:shadow-xl'
                          : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      }`}
                      whileHover={canUpload ? { scale: 1.02 } : {}}
                      whileTap={canUpload ? { scale: 0.98 } : {}}
                    >
                      {!token ? 'Please login to continue' : 'Generate AI Summary'}
                    </motion.button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* Progress Section */}
          <ProgressIndicator />

          {/* Summary Display */}
          <SummaryDisplay />

          {/* Features Section */}
          {status === 'idle' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                  <FaRobot className="text-green-600 dark:text-green-400 text-xl" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  AI-Powered Analysis
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Advanced natural language processing to understand and extract key information from your documents.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                  <FaFileAlt className="text-blue-600 dark:text-blue-400 text-xl" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Multiple Formats
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Support for PDF and DOCX files up to 5MB. Recommended: under 50 pages for optimal processing.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                  <FaUpload className="text-purple-600 dark:text-purple-400 text-xl" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Fast Processing
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Get your summaries in seconds with our optimized processing pipeline and real-time progress tracking.
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SummaryPage;