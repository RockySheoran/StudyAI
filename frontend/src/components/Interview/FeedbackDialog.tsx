import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { feedback } from '@/types/Interview-type';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface FeedbackDialogProps {
  isOpen: boolean;
  onClose: () => void;
  feedback: feedback;
}

export const FeedbackDialog = ({ isOpen, onClose, feedback }: FeedbackDialogProps) => {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  // Toggle item expansion
  const toggleExpand = (type: string, index: number) => {
    const key = `${type}-${index}`;
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Render feedback item with expand/collapse functionality
  const renderFeedbackItem = (type: 'suggestions' | 'strengths', item: string, index: number) => {
    const key = `${type}-${index}`;
    const isExpanded = expandedItems[key] || false;
    const shouldTruncate = item.length > 150 && !isExpanded;
    
    return (
      <div key={index} className="mb-3 last:mb-0">
        <div className="flex items-start">
          <span className={cn(
            "flex-shrink-0 inline-block w-4 h-4 rounded-full mt-1 mr-2",
            type === 'strengths' ? 'bg-green-500' : 'bg-yellow-500'
          )} />
          <div>
            <p className={cn("text-sm", shouldTruncate ? "line-clamp-3" : "")}>
              {item}
            </p>
            {item.length > 150 && (
              <button
                onClick={() => toggleExpand(type, index)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1"
              >
                {isExpanded ? 'Show less' : 'Show full'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">Interview Feedback</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Rating Section */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="font-medium text-lg mb-3">Overall Rating</h3>
            <div className="flex items-center">
              <div className="text-3xl font-bold mr-4">
                {feedback?.rating?.toFixed(1)}/5.0
              </div>
              <div className="flex-1">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${(feedback?.rating / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Strengths Section */}
          {feedback?.strengths?.length > 0 && (
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h3 className="font-medium text-lg mb-3 text-green-800 dark:text-green-200">
                Your Strengths
              </h3>
              <div className="space-y-2">
                {feedback?.strengths?.map((item, index) => 
                  renderFeedbackItem('strengths', item, index)
                )}
              </div>
            </div>
          )}
          
          {/* Suggestions Section */}
          {feedback?.suggestions?.length > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <h3 className="font-medium text-lg mb-3 text-yellow-800 dark:text-yellow-200">
                Areas for Improvement
              </h3>
              <div className="space-y-2">
                {feedback?.suggestions?.map((item, index) => 
                  renderFeedbackItem('suggestions', item, index)
                )}
              </div>
            </div>
          )}
          
          <div className="flex justify-center">
            <Button 
              onClick={onClose}
              className="mt-4"
            >
              Close Feedback
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
