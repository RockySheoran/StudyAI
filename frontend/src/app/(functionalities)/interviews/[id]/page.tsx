'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { InterviewContainer } from '@/components/Interview/InterviewContainer';
import { FeedbackService, fetchInterview, sendInterviewMessage } from '@/services/interviewService';
import { Loading } from '@/components/ui/Loading';
import { IInterview } from '@/types/Interview-type';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, ArrowLeft, Clock, User, Briefcase, Code, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function InterviewPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [interview, setInterview] = useState<IInterview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  // Fetch interview data
  useEffect(() => {
    if (!id) return;

    const loadInterview = async () => {
      try {
        setLoading(true);
        const data = await fetchInterview(id);
        setInterview(data);
        setError(null);
      } catch (err) {
        console.error('Failed to load interview:', err);
        setError('Failed to load interview. Please try again.');
        toast.error('Failed to load interview data');
      } finally {
        setLoading(false);
      }
    };

    loadInterview();
  }, [id, toast]);

  // Handle sending messages
  const handleSendMessage = useCallback(async (message?: string) => {
    if (!interview || !message?.trim()) return;

    try {
      setIsSubmitting(true);
      setError(null);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const updatedInterview:any = await sendInterviewMessage(
        interview._id, 
        message,
      );

      clearTimeout(timeoutId);
      setInterview(updatedInterview.interview);
      return updatedInterview.interview;
    } catch (err:any) {
      console.error('Error sending message:', err);
      
      let errorMessage = 'Failed to send message. Please try again.';
      if (err.name === 'AbortError') {
        errorMessage = 'Request timed out. Please try again.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [interview, toast]);

  // Handle interview completion
  const handleComplete = useCallback(async () => {
    if (!interview || interview.completedAt) return;

    try {
      setIsCompleting(true);
      const response = await FeedbackService(id);
      
      router.push(`/interviews/history`);
    } catch (err) {
      console.error('Error completing interview:', err);
      setError('Failed to complete interview. Please try again.');
      toast.error('Failed to complete interview');
    } finally {
      setIsCompleting(false);
    }
  }, [interview, id, router, toast]);

  // Loading state
  if (loading) {
    return (
      <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center h-full"
        >
          <div className="text-center space-y-4">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto" />
              <div className="absolute inset-0 h-12 w-12 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-pulse mx-auto"></div>
            </div>
            <p className="text-lg font-medium text-gray-600 dark:text-gray-300">Loading interview...</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Please wait while we prepare your session</p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error || !interview) {
    return (
      <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center h-full p-4"
        >
          <div className="text-center space-y-6 max-w-md">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Something went wrong</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{error || 'Interview not found'}</p>
              <Button 
                onClick={() => router.push('/interviews/history')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Interviews
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Main interview page
  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Fixed Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex-shrink-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white flex-shrink-0">
                  {interview.type === 'personal' ? (
                    <User className="h-3 w-3 sm:h-4 sm:w-4" />
                  ) : (
                    <Code className="h-3 w-3 sm:h-4 sm:w-4" />
                  )}
                </div>
                
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                      {interview.type === 'personal' ? 'Personal' : 'Technical'}
                    </span>
                    <div className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0",
                      interview.completedAt 
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    )}>
                      {interview.completedAt ? 'Completed' : 'Active'}
                    </div>
                  </div>
                  
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                    <span className="hidden sm:inline">Started </span>
                    {new Date(interview.createdAt).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Flexible Interview Container */}
      <div className="flex-1 overflow-hidden">
        <InterviewContainer
          id={id}
          interview={interview}
          onSendMessage={handleSendMessage}
          onComplete={handleComplete}
          isCompleting={isCompleting}
          error={error}
          isLoading={isSubmitting}
        />
      </div>
    </div>
  );
}