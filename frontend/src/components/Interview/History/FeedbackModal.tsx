'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { feedback } from '@/types/Interview-type';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Star, FileText, Trophy, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  feedback: feedback | null;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  feedback
}) => {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleExpand = (type: string, index: number) => {
    const key = `${type}-${index}`;
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const renderFeedbackItem = (type: 'suggestions' | 'strengths', item: string, index: number) => {
    const key = `${type}-${index}`;
    const isExpanded = expandedItems[key] || false;
    const shouldTruncate = item.length > 150 && !isExpanded;
    
    return (
      <motion.div 
        key={index} 
        className="mb-3 last:mb-0 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <div className="flex items-start">
          <span className={cn(
            "flex-shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full mt-0.5 mr-3",
            type === 'strengths' 
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
              : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
          )}>
            {type === 'strengths' ? (
              <Trophy className="w-3 h-3" />
            ) : (
              <Lightbulb className="w-3 h-3" />
            )}
          </span>
          <div className="flex-1">
            <p className={cn(
              "text-sm text-gray-700 dark:text-gray-300", 
              shouldTruncate ? "line-clamp-3" : ""
            )}>
              {item}
            </p>
            {item.length > 150 && (
              <button
                onClick={() => toggleExpand(type, index)}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline mt-2 font-medium"
              >
                {isExpanded ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl flex items-center justify-center gap-2 text-gray-900 dark:text-white">
            <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Interview Feedback
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600 dark:text-gray-400">
            Detailed analysis of your interview performance
          </DialogDescription>
        </DialogHeader>
        
        {feedback && (
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Rating Section */}
            <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 border-indigo-200 dark:border-indigo-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Overall Rating
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <div className="text-4xl font-bold bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <span className="text-gray-900 dark:text-white">
                      {feedback?.rating?.toFixed(1)}
                    </span>
                    <span className="text-2xl text-gray-500 dark:text-gray-400">/5</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Performance score</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {feedback.rating}/5
                      </span>
                    </div>
                    <Progress 
                      value={(feedback.rating / 5) * 100} 
                      className="h-3 bg-gray-200 dark:bg-gray-700" 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Strengths Section */}
            {feedback.strengths.length > 0 && (
              <Card className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-300">
                    <Trophy className="w-5 h-5" />
                    Your Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {feedback.strengths.map((item, index) => 
                      renderFeedbackItem('strengths', item, index)
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Suggestions Section */}
            {feedback.suggestions.length > 0 && (
              <Card className="bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-300">
                    <Lightbulb className="w-5 h-5" />
                    Areas for Improvement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {feedback.suggestions.map((item, index) => 
                      renderFeedbackItem('suggestions', item, index)
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackModal;
