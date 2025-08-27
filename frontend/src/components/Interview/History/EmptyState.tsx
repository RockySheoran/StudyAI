'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';

interface EmptyStateProps {
  onStartNew: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onStartNew }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="text-center py-12"
    >
      <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 max-w-md mx-auto border border-gray-200 dark:border-gray-700">
        <div className="bg-indigo-100 dark:bg-indigo-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No interviews yet
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Start your first interview to begin your practice journey
        </p>
        <Button 
          onClick={onStartNew} 
          size="lg" 
          className="gap-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800"
        >
          <MessageSquare className="w-4 h-4" />
          Start Your First Interview
        </Button>
      </div>
    </motion.div>
  );
};

export default EmptyState;
