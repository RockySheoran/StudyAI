'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/Layout/Layout';


import { InterviewService } from '@/services/interviewService';
import { ResumeUploader } from '@/components/Interview/ResumeUploader';
import InterviewTypeSelector from '@/components/Interview/InterviewTypeSelector';

export default function NewInterviewPage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<'personal' | 'technical'>();
  const [resume, setResume] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'type' | 'resume'>('type');

  const handleStartInterview = async () => {
    if (!selectedType) return;

    setLoading(true);
    try {
      const interview = await InterviewService.createInterview(selectedType, resume || undefined);
      router.push(`/interviews/${interview._id}`);
    } catch (error) {
      console.error('Failed to start interview:', error);
      setLoading(false);
    }
  };

  const handleTypeSelect = (type: 'personal' | 'technical') => {
    setSelectedType(type);
    setStep('resume');
  };

  const handleResumeUpload = async (file: File) => {
    setResume(file);
    await handleStartInterview();
  };

  if (step === 'type') {
    return (
      <Layout>
        <InterviewTypeSelector 
          onSelect={handleTypeSelect} 
          loading={loading} 
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <ResumeUploader 
        onUpload={handleResumeUpload} 
        isLoading={loading}
        onSkip={() => handleStartInterview()}
      />
    </Layout>
  );
}