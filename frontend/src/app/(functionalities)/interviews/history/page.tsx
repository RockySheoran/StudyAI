'use client';

import { useEffect, useState } from 'react';
import { IInterview, feedback } from '@/types/Interview-type';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Loading } from '@/components/ui/Loading';
import { useUserStore } from '@/lib/Store/userStore';
import { useInterviewHistoryStore } from '@/lib/Store/History/Interview_history_store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Star, Calendar, Clock, MessageSquare, ChevronRight, RefreshCw, FileText, Trophy, Lightbulb } from 'lucide-react';

export default function InterviewHistoryPage() {
  const { token } = useUserStore();
  const {
    interviews,
    loading,
    error,
    fetchInterviews
  } = useInterviewHistoryStore();
  const router = useRouter();
  const [selectedFeedback, setSelectedFeedback] = useState<feedback | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (token) {
      fetchInterviews(token);
    }
  }, [token, fetchInterviews]);

  const handleRefresh = async () => {
    if (!token) return;
    setIsRefreshing(true);
    await fetchInterviews(token, true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

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
      <motion.div 
        key={index} 
        className="mb-3 last:mb-0 p-3 bg-white dark:bg-gray-800 rounded-lg border"
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
            <p className={cn("text-sm text-gray-700 dark:text-gray-300", shouldTruncate ? "line-clamp-3" : "")}>
              {item}
            </p>
            {item.length > 150 && (
              <button
                onClick={() => toggleExpand(type, index)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-2 font-medium"
              >
                {isExpanded ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  const getInterviewTypeColor = (type: string) => {
    switch (type) {
      case 'personal': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700';
      case 'technical': return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600';
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 lg:p-6">
      {/* Feedback Modal */}
      <Dialog open={showFeedbackModal} onOpenChange={setShowFeedbackModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl flex items-center justify-center gap-2">
              <FileText className="w-6 h-6" />
              Interview Feedback
            </DialogTitle>
            <DialogDescription className="text-center">
              Detailed analysis of your interview performance
            </DialogDescription>
          </DialogHeader>
          
          {selectedFeedback && (
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {/* Rating Section */}
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:bg-gray-900 dark:to-indigo-950/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Overall Rating
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6">
                    <div className="text-4xl font-bold bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm">
                      {selectedFeedback?.rating?.toFixed(1)}
                      <span className="text-2xl text-gray-500">/5</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Performance score</span>
                        <span className="text-sm font-medium">{selectedFeedback.rating}/5</span>
                      </div>
                      <Progress value={(selectedFeedback.rating / 5) * 100} className="h-3" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Strengths Section */}
              {selectedFeedback.strengths.length > 0 && (
                <Card className="bg-green-50 dark:bg-gray-900 border-green-200 dark:border-green-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-300">
                      <Trophy className="w-5 h-5" />
                      Your Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedFeedback.strengths.map((item, index) => 
                        renderFeedbackItem('strengths', item, index)
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Suggestions Section */}
              {selectedFeedback.suggestions.length > 0 && (
                <Card className="bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-300">
                      <Lightbulb className="w-5 h-5" />
                      Areas for Improvement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedFeedback.suggestions.map((item, index) => 
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

      {/* Main Content Header */}
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
            onClick={handleRefresh}
            disabled={loading || isRefreshing}
            className="flex items-center gap-2"
          >
            <motion.span
              animate={{ rotate: isRefreshing ? 360 : 0 }}
              transition={{ duration: 0.5, repeat: isRefreshing ? Infinity : 0 }}
            >
              <RefreshCw className="w-4 h-4" />
            </motion.span>
            Refresh
          </Button>
          <Button onClick={handleStartNew} className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            New Interview
          </Button>
        </div>
      </motion.div>

      {/* Error State */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm">{error}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => token && fetchInterviews(token, true)}
                className="ml-4 border-red-300 text-red-600 hover:bg-red-100"
              >
                Try Again
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      <AnimatePresence>
        {!loading && interviews.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center py-12"
          >
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 max-w-md mx-auto">
              <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No interviews yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Start your first interview to begin your practice journey
              </p>
              <Button onClick={handleStartNew} size="lg" className="gap-2">
                <MessageSquare className="w-4 h-4" />
                Start Your First Interview
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interview List */}
      <AnimatePresence mode="popLayout">
        {interviews.length > 0 && (
          <motion.div 
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
          >
            {interviews.map((interview, index) => (
              <motion.div
                key={interview._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                layout
              >
                <Card className="h-full hover:shadow-md transition-shadow duration-300 group cursor-pointer">
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
                    <CardTitle className="text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      Interview Session
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-2">
                      <Calendar className="w-4 h-4" />
                      {formatDate(interview.createdAt)}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pb-3">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Questions</span>
                        <span className="font-medium">
                          {interview.messages.filter(m => m.role === 'assistant').length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Responses</span>
                        <span className="font-medium">
                          {interview.messages.filter(m => m.role === 'user').length}
                        </span>
                      </div>
                      
                      {interview.feedback && (
                        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Rating</span>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${i < interview?.feedback?.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300 dark:text-gray-600'}`}
                                />
                              ))}
                              <span className="text-sm font-medium ml-1">
                                ({interview?.feedback?.rating?.toFixed(1)})
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                    {interview.feedback && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFeedback(interview.feedback ?? null);
                          setShowFeedbackModal(true);
                        }}
                        className="text-xs"
                      >
                        View Feedback
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/interviews/${interview._id}?details=true`)}
                      className="text-xs gap-1"
                    >
                      Details
                      <ChevronRight className="w-3 h-3" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}