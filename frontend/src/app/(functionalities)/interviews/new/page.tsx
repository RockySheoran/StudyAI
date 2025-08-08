'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/Layout/Layout';
import { uploadResume, startInterview } from '@/services/interviewService';
import { ResumeUploader } from '@/components/Interview/ResumeUploader';
import { InterviewTypeSelector } from '@/components/Interview/InterviewTypeSelector';
import { toast } from 'sonner';

export default function NewInterviewPage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<'personal' | 'technical'>();
  const [resume, setResume] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'type' | 'resume'>('type');

  const handleStartInterview = async (withResume: boolean = false) => {
    if (!selectedType) {
      toast.error('Please select an interview type');
      return;
    }

    setLoading(true);
    
    try {
      let resumeId: string | null = null;

      // Only upload resume if file exists and user didn't skip
      if (withResume && resume) {
        try {
          const resumeResponse :any = await uploadResume(resume);
          resumeId = resumeResponse?._id;
          toast.success('Resume uploaded successfully');
        } catch (error) {
          toast.error('Failed to upload resume');
          console.error('Resume upload error:', error);
          // Continue with interview even if resume upload fails
        }
      }

      // Start the interview
      const interviewResponse = await startInterview(selectedType);
      toast.success('Interview started!');
      
      router.push(`/interviews/${interviewResponse._id}`);
    } catch (error) {
      toast.error('Failed to start interview');
      console.error('Interview start error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTypeSelect = (type: 'personal' | 'technical') => {
    setSelectedType(type);
    setStep('resume');
  };

  const handleResumeUpload = async (file: File) => {
    setResume(file);
    await handleStartInterview(true); // Start interview with resume
  };

  const handleSkipResume = async () => {
    setResume(null); // Clear any selected resume file
    console.log("first")
    // await handleStartInterview(false); // Start interview without resume
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
        onSkip={handleSkipResume}
      />
    </Layout>
  );
}