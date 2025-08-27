'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { RefreshCw, MessageSquare } from 'lucide-react';

interface InterviewHistoryHeaderProps {
  onRefresh: () => void;
  onStartNew: () => void;
  isRefreshing: boolean;
  loading: boolean;
}

const InterviewHistoryHeader: React.FC<InterviewHistoryHeaderProps> = ({
  onRefresh,
  onStartNew,
  isRefreshing,
  loading
}) => {
  return (
    <motion.div 
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Interview History</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Review your past interviews and track your progress
        </p>
      </div>
      
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          onClick={onRefresh}
          disabled={loading || isRefreshing}
          className="flex items-center gap-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <motion.span
            animate={{ rotate: isRefreshing ? 360 : 0 }}
            transition={{ duration: 0.5, repeat: isRefreshing ? Infinity : 0 }}
          >
            <RefreshCw className="w-4 h-4" />
          </motion.span>
          Refresh
        </Button>
        <Button 
          onClick={onStartNew} 
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800"
        >
          <MessageSquare className="w-4 h-4" />
          New Interview
        </Button>
      </div>
    </motion.div>
  );
};

export default InterviewHistoryHeader;
