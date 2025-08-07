'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout/Layout';
import { InterviewContainer } from '@/components/Interview/InterviewContainer';
import { IInterview } from '@/types/interview';
import { InterviewService } from '@/services/interviewService';
import { Loading } from '@/components/ui/Loading';

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
        const data = await InterviewService.getInterview(id);
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
      const updatedInterview = await InterviewService.sendMessage(interview._id, message);
      setInterview(updatedInterview);
    } catch (err) {
      setError('Failed to send message');
      console.error(err);
    }
  };

  const handleComplete = () => {
    router.push('/interviews/history');
  };

  if (loading) {
    return (
      <Layout>
        <Loading />
      </Layout>
    );
  }

  if (error || !interview) {
    return (
      <Layout>
        <div className="p-4 bg-red-50 text-red-600 rounded-lg max-w-md mx-auto mt-8 text-center">
          {error || 'Interview not found'}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <InterviewContainer
        interview={interview}
        onSendMessage={handleSendMessage}
        onComplete={handleComplete}
      />
    </Layout>
  );
}