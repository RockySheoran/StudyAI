'use client';

import { useEffect, useState, useMemo } from 'react';
import { IInterview, feedback } from '@/types/Interview-type';
import { useRouter } from 'next/navigation';
import { Loading } from '@/components/ui/Loading';
import { useUserStore } from '@/lib/Store/userStore';
import { useInterviewHistoryStore } from '@/lib/Store/Interview/Interview_history_store';
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
  console.log(interviews)
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
        matchesStatus = hasValidFeedback(interview.feedback);
      } else if (statusFilter === 'no-feedback') {
        matchesStatus = !hasValidFeedback(interview.feedback);
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
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        feedback={selectedFeedback}
      />

      {/* Header */}
      <InterviewHistoryHeader
        onRefresh={handleRefresh}
        onStartNew={handleStartNew}
        isRefreshing={isRefreshing}
        loading={loading}
      />

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