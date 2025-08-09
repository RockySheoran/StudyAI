'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { InterviewContainer } from '@/components/Interview/InterviewContainer';
import { fetchInterview, sendInterviewMessage } from '@/services/interviewService';
import { Loading } from '@/components/ui/Loading';
import { IInterview } from '@/types/interview';

export default function InterviewPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [interview, setInterview] = useState<IInterview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const loadInterview = async () => {
      try {
        const data = await fetchInterview(id);
        setInterview(data);
      } catch (err) {
        setError('Failed to load interview');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadInterview();
  }, [id]);

  const handleSendMessage = async (message: string) => {
    if (!interview) return;

    try {
      const updatedInterview: any = await sendInterviewMessage(interview._id, message);
      console.log(updatedInterview);
      setInterview(updatedInterview.interview);
    } catch (err) {
      setError('Failed to send message');
      console.error(err);
      throw err; // Re-throw to be caught by InterviewContainer
    }
  };

  const handleComplete = () => {
    router.push('/interviews/history');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loading />
      </div>
    );
  }

  if (error || !interview) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="p-4 bg-red-50 text-red-600 rounded-lg max-w-md mx-auto text-center">
          {error || 'Interview not found'}
        </div>
      </div>
    );
  }

  return (
    <InterviewContainer
      interview={interview}
      onSendMessage={handleSendMessage}
      onComplete={handleComplete}
      error={error}
      isLoading={loading}
    />
  );
}