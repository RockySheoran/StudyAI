'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { IInterview } from '@/types/Interview-type';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Star, ChevronRight, AlertCircle } from 'lucide-react';

interface InterviewCardProps {
  interview: IInterview;
  index: number;
  onViewFeedback: (feedback: any) => void;
  onViewDetails: (id: string) => void;
}

const InterviewCard: React.FC<InterviewCardProps> = ({
  interview,
  index,
  onViewFeedback,
  onViewDetails
}) => {
  const getInterviewTypeColor = (type: string) => {
    switch (type) {
      case 'personal': 
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700';
      case 'technical': 
        return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700';
      default: 
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700/50 dark:text-gray-200 dark:border-gray-600';
    }
  };

  // Check if feedback is valid and complete
  const hasValidFeedback = (feedback: any) => {
    if (!feedback) return false;
    
    // Check if rating exists and is a valid number
    const hasValidRating = feedback.rating !== undefined && 
                          feedback.rating !== null && 
                          typeof feedback.rating === 'number' && 
                          feedback.rating > 0;
    
    // Check if strengths array exists and has content
    const hasStrengths = Array.isArray(feedback.strengths) && 
                        feedback.strengths.length > 0 && 
                        feedback.strengths.some((strength: string) => strength.trim().length > 0);
    
    // Check if suggestions array exists and has content
    const hasSuggestions = Array.isArray(feedback.suggestions) && 
                          feedback.suggestions.length > 0 && 
                          feedback.suggestions.some((suggestion: string) => suggestion.trim().length > 0);
    
    // Feedback is valid if it has rating AND (strengths OR suggestions)
    return hasValidRating && (hasStrengths || hasSuggestions);
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      layout
    >
      <Card className="h-full hover:shadow-lg transition-all duration-300 group cursor-pointer bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start mb-2">
            <Badge className={getInterviewTypeColor(interview.type)}>
              {interview.type === 'personal' ? 'Personal' : 'Technical'}
            </Badge>
            {interview.completedAt && (
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700">
                Completed
              </Badge>
            )}
          </div>
          <CardTitle className="text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-gray-900 dark:text-white">
            Interview Session
          </CardTitle>
          <CardDescription className="flex items-center gap-2 mt-2 text-gray-600 dark:text-gray-400">
            <Calendar className="w-4 h-4" />
            {formatDate(interview.createdAt)}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pb-3">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Questions</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {interview.messages.filter(m => m.role === 'assistant').length}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Responses</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {interview.messages.filter(m => m.role === 'user').length}
              </span>
            </div>
            
            {hasValidFeedback(interview.feedback) ? (
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Rating</span>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < (interview?.feedback?.rating || 0)
                            ? 'text-yellow-500 fill-yellow-500' 
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    ))}
                    <span className="text-sm font-medium ml-1 text-gray-900 dark:text-white">
                      ({(interview?.feedback?.rating || 0).toFixed(1)})
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                  <div className="text-xs text-amber-700 dark:text-amber-300">
                    <p className="font-medium">No feedback available</p>
                    <p className="text-amber-600 dark:text-amber-400">
                      Remember to get feedback after concluding interviews
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
          {hasValidFeedback(interview.feedback) ? (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onViewFeedback(interview.feedback);
              }}
              className="text-xs border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              View Feedback
            </Button>
          ) : (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              No feedback available
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDetails(interview._id)}
            className="text-xs gap-1 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          >
            Details
            <ChevronRight className="w-3 h-3" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default InterviewCard;
