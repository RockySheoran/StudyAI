'use client';

import { useEffect, useState } from 'react';
import { IInterview, feedback } from '@/types/Interview-type';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Loading } from '@/components/ui/Loading';
import axios from 'axios';
import { useUserStore } from '@/lib/Store/userStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export default function InterviewHistoryPage() {
  const [interviews, setInterviews] = useState<IInterview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useUserStore();
  const router = useRouter();
  const [selectedFeedback, setSelectedFeedback] = useState<feedback | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await axios.get("http://localhost:8002/api/interview/history", {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setInterviews(response.data);
      } catch (err) {
        setError('Failed to load interview history');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [token]);

  const handleStartNew = () => {
    router.push('/interviews/new');
  };

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

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Feedback Modal */}
      <Dialog open={showFeedbackModal} onOpenChange={setShowFeedbackModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center">Interview Feedback</DialogTitle>
          </DialogHeader>
          
          {selectedFeedback && (
            <div className="space-y-6">
              {/* Rating Section */}
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h3 className="font-medium text-lg mb-3">Overall Rating</h3>
                <div className="flex items-center">
                  <div className="text-3xl font-bold mr-4">
                    {selectedFeedback.rating.toFixed(1)}/5.0
                  </div>
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${(selectedFeedback.rating / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Strengths Section */}
              {selectedFeedback.strengths.length > 0 && (
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h3 className="font-medium text-lg mb-3 text-green-800 dark:text-green-200">
                    Your Strengths
                  </h3>
                  <div className="space-y-2">
                    {selectedFeedback.strengths.map((item, index) => 
                      renderFeedbackItem('strengths', item, index)
                    )}
                  </div>
                </div>
              )}
              
              {/* Suggestions Section */}
              {selectedFeedback.suggestions.length > 0 && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <h3 className="font-medium text-lg mb-3 text-yellow-800 dark:text-yellow-200">
                    Areas for Improvement
                  </h3>
                  <div className="space-y-2">
                    {selectedFeedback.suggestions.map((item, index) => 
                      renderFeedbackItem('suggestions', item, index)
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Main Content */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Interview History</h1>
        <Button onClick={handleStartNew}>Start New Interview</Button>
      </div>

      {error && (
        <div className="p-4 mb-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      {interviews.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No interview history found</p>
          <Button onClick={handleStartNew}>Start Your First Interview</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {interviews.map((interview) => (
            <div
              key={interview._id}
              className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium dark:text-white">
                    {interview.type === 'personal'
                      ? 'Personal Interview'
                      : 'Technical Interview'}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(interview.createdAt).toLocaleString()}
                  </p>
                </div>
                {interview.completedAt && (
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs rounded-full">
                    Completed
                  </span>
                )}
              </div>

              {interview.feedback && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="font-medium mr-2 dark:text-white">Rating:</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`text-lg ${interview.feedback && i < interview.feedback.rating ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-600'}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                        ({interview.feedback.rating}/5)
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFeedback(interview.feedback ?? null);
                        setShowFeedbackModal(true);
                      }}
                    >
                      See Full Feedback
                    </Button>
                  </div>
                </div>
              )}

              <div className="mt-3 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/interviews/${interview._id}?details=true`)}
                >
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}