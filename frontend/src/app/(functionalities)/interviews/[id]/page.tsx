// app/interview/[id]/page.tsx
'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { InterviewContainer } from '@/components/Interview/InterviewContainer';
import { fetchInterview, sendInterviewMessage } from '@/services/interviewService';
import { Loading } from '@/components/ui/Loading';
import { IInterview } from '@/types/interview';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

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
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <Loading />
        <p className="text-gray-600">Loading interview...</p>
      </div>
    );
  }

  // Error state
  if (error || !interview) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 p-4">
        <div className="max-w-md w-full p-6 bg-red-50 text-red-600 rounded-lg text-center">
          <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
          <p className="mb-4">{error || 'Interview not found'}</p>
          <div className="flex gap-2 justify-center">
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
            >
              Retry
            </Button>
            <Button 
              onClick={() => router.push('/interviews')}
            >
              Back to Interviews
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="">
    <InterviewContainer
      id={id}
      interview={interview}
      onSendMessage={handleSendMessage}
      onComplete={handleComplete}
      error={error}
      isLoading={isSubmitting}
    />
    </div>
  );
}