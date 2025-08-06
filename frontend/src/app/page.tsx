"use client"
import { useState } from 'react';
import Head from 'next/head';
import { uploadResume } from '@/services/resumeService';
import { startInterview } from '@/services/interviewService';
import Layout from './(functionalities)/layout';
import ResumeUploader from '@/components/Interview/ResumeUploader';
import InterviewTypeSelector from '@/components/Interview/InterviewTypeSelector';

export default function Home() {
  const [hasResume, setHasResume] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUploadResume = async (file: File) => {
    try {
      await uploadResume(file);
      setHasResume(true);
    } catch (err) {
      setError('Failed to upload resume');
      console.error(err);
    }
  };

  const handleStartInterview = async (type: 'personal' | 'technical') => {
    setIsStarting(true);
    setError(null);
    
    try {
      const interview = await startInterview(type);
      window.location.href = `/interviews/${interview._id}`;
    } catch (err) {
      setError('Failed to start interview');
      console.error(err);
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <Layout>
      <Head>
        <title>AI Interview Platform</title>
        <meta name="description" content="Practice your interview skills with AI" />
      </Head>

      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] px-4 py-12">
        <div className="w-full max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Interview Practice
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Improve your interview skills with our AI-powered interview simulator
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          <div className="bg-white p-8 rounded-xl shadow-md">
            {!hasResume ? (
              <ResumeUploader 
                onUpload={handleUploadResume} 
                isLoading={isStarting} 
              />
            ) : (
              <InterviewTypeSelector 
                onSelect={handleStartInterview} 
                loading={isStarting} 
              />
            )}
          </div>
        </div>
      </main>
    </Layout>
  );
}