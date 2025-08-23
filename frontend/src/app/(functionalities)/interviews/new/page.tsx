'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/Layout/Layout';
import { uploadResume, startInterview } from '@/services/interviewService';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Loader2, Briefcase, User } from 'lucide-react';
import { ResumeUpload } from '@/components/Interview/ResumeUploader';

export default function NewInterviewPage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<'personal' | 'technical'>();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'type' | 'resume'>('type');

  const handleStartInterview = async (resumeFile?: File) => {
    if (!selectedType) {
      toast.error('Please select an interview type');
      return;
    }

    setLoading(true);
    
    try {
      let resumeId: string | null = null;

      if (resumeFile) {
        try {
          const resumeResponse: any = await uploadResume(resumeFile);
          resumeId = resumeResponse?._id;
          toast.success('Resume uploaded successfully');
        } catch (error) {
          console.error('Resume upload error:', error);
          toast.error('Failed to upload resume. Starting without resume...');
        }
      }

      const interviewResponse = await startInterview(selectedType);
      toast.success('Interview starting...');
      router.push(`/interviews/${interviewResponse._id}`);
    } catch (error) {
      console.error('Interview start error:', error);
      toast.error('Failed to start interview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTypeSelect = (type: 'personal' | 'technical') => {
    setSelectedType(type);
    setStep('resume');
  };

  const goBack = () => {
    setStep('type');
  };

  return (
    <Layout>
      {step === 'type' ? (
        <InterviewTypeSelect 
          onSelect={handleTypeSelect} 
          selectedType={selectedType} 
        />
      ) : (
        <ResumeUpload
          onUpload={handleStartInterview}
          onSkip={() => handleStartInterview()}
          onBack={goBack}
          isLoading={loading}
        />
      )}
    </Layout>
  );
}

function InterviewTypeSelect({ 
  onSelect, 
  selectedType 
}: { 
  onSelect: (type: 'personal' | 'technical') => void;
  selectedType?: 'personal' | 'technical';
}) {
  return (
    <div className="max-w-md mx-auto py-8">
      <Card className="border-0 shadow-sm bg-gray-200 dark:bg-gray-800">
        <CardHeader className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/50 mb-4">
            <Briefcase className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl">Select Interview Type</CardTitle>
          <CardDescription>
            Choose the type of interview you want to practice
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button
            variant={selectedType === 'technical' ? 'default' : 'outline'}
            size="lg"
            className="h-24 justify-start px-6"
            onClick={() => onSelect('technical')}
          >
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/50">
                <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-left">
                <h3 className="font-medium">Technical Interview</h3>
                <p className="text-sm text-muted-foreground">
                  Practice coding and technical questions
                </p>
              </div>
            </div>
          </Button>

          <Button
            variant={selectedType === 'personal' ? 'default' : 'outline'}
            size="lg"
            className="h-24 justify-start px-6"
            onClick={() => onSelect('personal')}
          >
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/50">
                <User className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-left">
                <h3 className="font-medium">Personal Interview</h3>
                <p className="text-sm text-muted-foreground">
                  Practice behavioral and situational questions
                </p>
              </div>
            </div>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}