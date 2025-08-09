'use client';

import { useEffect, useState } from 'react';
import {getInterviewHistory} from '@/services/interviewService';
import { IInterview } from '@/types/interview';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Loading } from '@/components/ui/Loading';


export default function InterviewHistoryPage() {
  const [interviews, setInterviews] = useState<IInterview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
 
  const router = useRouter();

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await getInterviewHistory();
        setInterviews(data);
      } catch (err) {
        setError('Failed to load interview history');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  const handleStartNew = () => {
    router.push('/interviews/new');
  };

  if (loading) {
    return (
      <>
        <Loading />
      </>
    );
  }

  return (
    
      <div className="max-w-4xl mx-auto">
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
            {interviews?.map((interview) => (
              <div
                key={interview._id}
                className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/interviews/${interview._id}`)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">
                      {interview.type === 'personal'
                        ? 'Personal Interview'
                        : 'Technical Interview'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {interview?.createdAt}
                    </p>
                  </div>
                  {interview.completedAt && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Completed
                    </span>
                  )}
                </div>
                {interview.feedback && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center">
                      <span className="font-medium mr-2">Rating:</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`text-lg ${i < interview?.feedback?.rating  ? 'text-yellow-500' : 'text-gray-300'}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    
  );
}