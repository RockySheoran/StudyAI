'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { FaSpinner, FaCheckCircle, FaTimesCircle, FaUpload, FaCog } from 'react-icons/fa';
import { useSummaryStore } from '@/lib/Store/Summary/summaryStore';

const ProgressIndicator: React.FC = () => {
  const { 
    status, 
    progress, 
    error, 
    isUploading, 
    isProcessing,
    uploadStartTime,
    processingStartTime,
    cancelOperation 
  } = useSummaryStore();

  const getElapsedTime = (startTime: number | null) => {
    if (!startTime) return 0;
    return Math.floor((Date.now() - startTime) / 1000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (status === 'idle' || status === 'completed') {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 mb-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {status === 'uploading' && (
            <>
              <FaUpload className="text-blue-500 animate-pulse" />
              <span className="text-lg font-medium text-gray-900 dark:text-white">
                Uploading File...
              </span>
            </>
          )}
          
          {status === 'processing' && (
            <>
              <FaCog className="text-indigo-500 animate-spin" />
              <span className="text-lg font-medium text-gray-900 dark:text-white">
                Generating Summary...
              </span>
            </>
          )}
          
          {status === 'failed' && (
            <>
              <FaTimesCircle className="text-red-500" />
              <span className="text-lg font-medium text-red-600 dark:text-red-400">
                Processing Failed
              </span>
            </>
          )}
          
          {status === 'cancelled' && (
            <>
              <FaTimesCircle className="text-yellow-500" />
              <span className="text-lg font-medium text-yellow-600 dark:text-yellow-400">
                Operation Cancelled
              </span>
            </>
          )}
        </div>

        {(status === 'uploading' || status === 'processing') && (
          <motion.button
            onClick={cancelOperation}
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-red-300 dark:hover:border-red-600 transition-colors duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Cancel
          </motion.button>
        )}
      </div>

      {/* Progress Bar */}
      {(status === 'uploading' || status === 'processing') && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div
              className={`h-2 rounded-full ${
                status === 'uploading' ? 'bg-blue-500' : 'bg-indigo-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}

      {/* Time Elapsed */}
      {(isUploading || isProcessing) && (
        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>
            {status === 'uploading' ? 'Upload time:' : 'Processing time:'}
          </span>
          <span>
            {formatTime(getElapsedTime(isUploading ? uploadStartTime : processingStartTime))}
          </span>
        </div>
      )}

      {/* Error Message */}
      {error && status === 'failed' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-red-600 dark:text-red-400 flex-1">{error}</p>
            <motion.button
              onClick={() => window.location.reload()}
              className="ml-3 px-3 py-1 text-xs font-medium text-red-600 dark:text-red-400 border border-red-300 dark:border-red-600 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Refresh Page
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Status Messages */}
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        {status === 'uploading' && (
          <p>Please wait while we upload your document...</p>
        )}
        {status === 'processing' && (
          <p>Our AI is analyzing your document and generating a comprehensive summary...</p>
        )}
        {status === 'cancelled' && (
          <p>The operation was cancelled. You can start over with a new file.</p>
        )}
      </div>
    </motion.div>
  );
};

export default ProgressIndicator;
