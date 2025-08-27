'use client';

import { useEffect, useState, useMemo } from 'react';
import { IInterview, feedback } from '@/types/Interview-type';
import { useRouter } from 'next/navigation';
import { Loading } from '@/components/ui/Loading';
import { useUserStore } from '@/lib/Store/userStore';
import { useInterviewHistoryStore } from '@/lib/Store/History/Interview_history_store';
import { AnimatePresence } from 'framer-motion';

// Import new components
import InterviewHistoryHeader from '@/components/Interview/History/InterviewHistoryHeader';
import FilterAndPagination from '@/components/Interview/History/FilterAndPagination';
import InterviewCard from '@/components/Interview/History/InterviewCard';
import FeedbackModal from '@/components/Interview/History/FeedbackModal';
import EmptyState from '@/components/Interview/History/EmptyState';
import ErrorState from '@/components/Interview/History/ErrorState';

export default function InterviewHistoryPage() {
  const { token } = useUserStore();
  const {
    interviews,
    loading,
    error,
    fetchInterviews
  } = useInterviewHistoryStore();
  const router = useRouter();
  
  // Modal state
  const [selectedFeedback, setSelectedFeedback] = useState<feedback | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Filter and pagination state
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  useEffect(() => {
    if (token) {
      fetchInterviews(token);
    }
  }, [token, fetchInterviews]);

  // Filtered and paginated interviews
  const filteredInterviews = useMemo(() => {
    let filtered = interviews.filter(interview => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        interview.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        new Date(interview.createdAt).toLocaleDateString().includes(searchTerm);

      // Type filter
      const matchesType = typeFilter === 'all' || interview.type === typeFilter;

      // Status filter
      let matchesStatus = true;
      if (statusFilter === 'completed') {
        matchesStatus = !!interview.completedAt;
      } else if (statusFilter === 'with-feedback') {
        matchesStatus = !!interview.feedback;
      } else if (statusFilter === 'no-feedback') {
        matchesStatus = !interview.feedback;
      }

      return matchesSearch && matchesType && matchesStatus;
    });

    return filtered;
  }, [interviews, searchTerm, typeFilter, statusFilter]);

  const totalPages = Math.ceil(filteredInterviews.length / itemsPerPage);
  const paginatedInterviews = filteredInterviews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter, statusFilter, itemsPerPage]);

  const handleRefresh = async () => {
    if (!token) return;
    setIsRefreshing(true);
    await fetchInterviews(token, true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleStartNew = () => {
    router.push('/interviews/new');
  };

  const handleViewFeedback = (feedback: feedback) => {
    setSelectedFeedback(feedback);
    setShowFeedbackModal(true);
  };

  const handleViewDetails = (id: string) => {
    router.push(`/interviews/${id}?details=true`);
  };

  const handleRetryFetch = () => {
    if (token) {
      fetchInterviews(token, true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
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
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
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
                <Card className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
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
          <ErrorState
            error={error}
            onRetry={handleRetryFetch}
          />
        )}
      </AnimatePresence>

      {/* Empty State */}
      <AnimatePresence>
        {!loading && interviews.length === 0 && (
          <EmptyState onStartNew={handleStartNew} />
        )}
      </AnimatePresence>

      {/* Main Content */}
      {interviews.length > 0 && (
        <>
          {/* Filters and Pagination */}
          <FilterAndPagination
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            typeFilter={typeFilter}
            onTypeFilterChange={setTypeFilter}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={setItemsPerPage}
            totalItems={filteredInterviews.length}
          />

          {/* Interview Grid */}
          <AnimatePresence mode="popLayout">
            {paginatedInterviews.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {paginatedInterviews.map((interview, index) => (
                  <InterviewCard
                    key={interview._id}
                    interview={interview}
                    index={index}
                    onViewFeedback={handleViewFeedback}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md mx-auto border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No interviews found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Try adjusting your filters to see more results
                  </p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}