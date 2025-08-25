'use client';
import { CurrentAffair } from '@/types/Current-Affairs/CurrentAffair-types';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaExternalLinkAlt, FaSpinner } from 'react-icons/fa';

interface ArticleModalProps {
  affair: CurrentAffair;
  onClose: () => void;
}

const ArticleModal: React.FC<ArticleModalProps> = ({ affair, onClose }) => {
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleBackdropClick}
      >
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-lg border border-gray-200 dark:border-gray-700"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white pr-4">
                {affair.title}
              </h2>
              <motion.button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaTimes className="h-5 w-5" />
              </motion.button>
            </div>
            
            <div className="mb-4 flex items-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">
                Category:
              </span>
              <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-md text-sm">
                {affair.category || 'General'}
              </span>
            </div>
            
            <div className="prose dark:prose-invert max-w-none mb-6">
              <div className="whitespace-pre-line bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-gray-700 dark:text-gray-300">
                {affair.fullContent.split('\n').map((paragraph, index) => (
                  paragraph ? (
                    <p key={index} className="mb-4">
                      {paragraph}
                    </p>
                  ) : (
                    <br key={index} />
                  )
                ))}
              </div>
            </div>
            
            {affair.sourceUrl && (
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <motion.a
                  href={affair.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors duration-200"
                  whileHover={{ scale: 1.05 }}
                >
                  <span className="mr-2">Read original source</span>
                  <FaExternalLinkAlt className="text-sm" />
                </motion.a>
              </div>
            )}
            
            <div className="mt-8 flex justify-end">
              <motion.button
                onClick={onClose}
                className="bg-indigo-600 dark:bg-indigo-700 text-white py-2 px-6 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Close
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ArticleModal;