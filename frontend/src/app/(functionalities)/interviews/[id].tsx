import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import InterviewContainer from '../../../components/Interview/InterviewContainer';
import Layout from '../../../components/Layout/Layout';
import { IInterview } from '../../../types/interview';
import { fetchInterview, sendInterviewMessage } from '../../../services/interviewService';

const InterviewPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [interview, setInterview] = useState<IInterview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const loadInterview = async () => {
      try {
        const data = await fetchInterview(id as string);
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
      const updatedInterview = await sendInterviewMessage(interview._id, message);
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
        <div>Loading interview...</div>
      </Layout>
    );
  }

  if (error || !interview) {
    return (
      <Layout>
        <div>{error || 'Interview not found'}</div>
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
};

export default InterviewPage;