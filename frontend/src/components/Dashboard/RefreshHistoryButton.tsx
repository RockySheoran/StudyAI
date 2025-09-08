"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useUserStore } from '@/lib/Store/userStore';
import { useSummaryHistoryStore } from '@/lib/Store/Summary/Summary_history_store';
import { useInterviewHistoryStore } from '@/lib/Store/Interview/Interview_history_store';
import { useQuizQnAHistoryStore } from '@/lib/Store/Quiz-Qna/quizQnaHistoryStore';
import { useCurrentAffairsHistoryStore } from '@/lib/Store/Current-Affairs/currentAffairsHistoryStore';
import { useTopicHistoryStore } from '@/lib/Store/Topics/topicHistoryStore';

interface RefreshHistoryButtonProps {
  onRefresh?: () => void;
  className?: string;
}

export const RefreshHistoryButton: React.FC<RefreshHistoryButtonProps> = ({
  onRefresh,
  className = ""
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Get stores
  const { token } = useUserStore();
  const { fetchSummaries } = useSummaryHistoryStore();
  const { fetchInterviews } = useInterviewHistoryStore();
  const { refreshHistory: refreshQuizQnAHistory } = useQuizQnAHistoryStore();
  const { refreshHistory: refreshCurrentAffairsHistory } = useCurrentAffairsHistoryStore();
  const { refreshHistory: refreshTopicHistory } = useTopicHistoryStore();

  const handleRefresh = async () => {
    if (!token) {
      toast.error('❌ Authentication required', {
        description: 'Please log in to refresh your history.'
      });
      return;
    }

    setIsRefreshing(true);
    
    try {
      // Refresh all history stores with force refresh
      const refreshPromises = [
        fetchSummaries(token, true), // forceRefresh = true
        fetchInterviews(token, true), // forceRefresh = true
        refreshQuizQnAHistory(token, true), // refresh = true
        refreshCurrentAffairsHistory(token, true), // refresh = true
        refreshTopicHistory(token, true) // refresh = true
      ];

      await Promise.all(refreshPromises);
      
      // Call the optional refresh callback
      if (onRefresh) {
        await onRefresh();
      }
      
      toast.success('🔄 History refreshed successfully!', {
        description: 'All your learning history has been updated with the latest data.'
      });
      
    } catch (error) {
      console.error('Error refreshing history:', error);
      toast.error('❌ Failed to refresh history', {
        description: 'Please try again or check your internet connection.'
      });
    } finally {
      setIsRefreshing(false);
    }
  };


  return (
    <>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={className}
      >
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing || !token}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-4 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRefreshing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Refreshing...</span>
            </>
          ) : (
            <>
              <RotateCcw className="w-4 h-4" />
              <span>Refresh History</span>
            </>
          )}
        </Button>
      </motion.div>
    </>
  );
};

export default RefreshHistoryButton;
