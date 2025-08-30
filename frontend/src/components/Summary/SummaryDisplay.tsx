'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaCopy, FaDownload, FaShare, FaHistory, FaClock, FaFile } from 'react-icons/fa';
import { useSummaryStore } from '@/lib/Store/Summary/summaryStore';

const SummaryDisplay: React.FC = () => {
  const { 
    summaryContent, 
    selectedFile, 
    status,
    resetSession,
    startNewSummary,
    summaryHistory 
  } = useSummaryStore();
  
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  if (status !== 'completed' || !summaryContent) {
    return null;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summaryContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([summaryContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${selectedFile?.name || 'document'}_summary.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Summary of ${selectedFile?.name || 'Document'}`,
          text: summaryContent,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      handleCopy();
    }
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Success Header */}
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6"
      >
        <div className="flex items-center space-x-3">
          <FaCheckCircle className="text-green-500 text-2xl" />
          <div>
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-300">
              Summary Generated Successfully!
            </h3>
            <p className="text-sm text-green-600 dark:text-green-400">
              Your document has been processed and summarized.
            </p>
          </div>
        </div>
      </motion.div>

      {/* File Info */}
      {selectedFile && (
        <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <FaFile className="text-red-500" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {selectedFile.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatFileSize(selectedFile.size)} • Processed just now
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Document Summary
            </h3>
            
            <div className="flex items-center space-x-2">
              <motion.button
                onClick={handleCopy}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Copy to clipboard"
              >
                <FaCopy className={copied ? 'text-green-500' : ''} />
              </motion.button>
              
              <motion.button
                onClick={handleDownload}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Download summary"
              >
                <FaDownload />
              </motion.button>
              
              <motion.button
                onClick={handleShare}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Share summary"
              >
                <FaShare />
              </motion.button>
            </div>
          </div>
          
          <div className="prose dark:prose-invert max-w-none">
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-sans leading-relaxed">
                {summaryContent}
              </pre>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <motion.button
          onClick={startNewSummary}
          className="flex-1 bg-indigo-600 dark:bg-indigo-700 text-white py-3 px-4 sm:px-6 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200 font-medium text-sm sm:text-base"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          New Summary
        </motion.button>
        
        <motion.button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 font-medium text-sm sm:text-base"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FaHistory />
          <span className="hidden sm:inline">View History</span>
          <span className="sm:hidden">History</span>
          <span className="ml-1">({summaryHistory.length})</span>
        </motion.button>
      </div>

      {/* History Panel */}
      {showHistory && summaryHistory.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Summaries
            </h4>
            
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {summaryHistory.slice(0, 5).map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <FaFile className="text-red-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {item.fileName}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                        <FaClock />
                        <span>{formatDate(item.createdAt)}</span>
                        <span>•</span>
                        <span>{formatFileSize(item.fileSize)}</span>
                        {item.processingTime && (
                          <>
                            <span>•</span>
                            <span>{Math.round(item.processingTime / 1000)}s</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {copied && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg"
        >
          Copied to clipboard!
        </motion.div>
      )}
    </motion.div>
  );
};

export default SummaryDisplay;
