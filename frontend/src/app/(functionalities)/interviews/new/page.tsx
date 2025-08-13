'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/Layout/Layout';
import { uploadResume, startInterview } from '@/services/interviewService';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Loader2, FileText, Briefcase, User, SkipForward } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function NewInterviewPage() {
  const router = useRouter();
  const { theme } = useTheme();
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

      if (withResume && resume) {
        try {
          const resumeResponse: any = await uploadResume(resume);
          resumeId = resumeResponse?._id;
          toast.success('Resume uploaded successfully');
        } catch (error) {
          toast.error('Failed to upload resume');
          console.error('Resume upload error:', error);
        }
      }

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

  const handleResumeUpload = (file: File) => {
    setResume(file);
    handleStartInterview(true);
  };

  const handleSkipResume = () => {
    handleStartInterview(false);
  };

  const goBack = () => {
    if (step === 'resume') {
      setStep('type');
    }
  };

  if (step === 'type') {
    return (
      <Layout>
        <div className="max-w-md mx-auto py-8 ">
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
                onClick={() => handleTypeSelect('technical')}
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
                onClick={() => handleTypeSelect('personal')}
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
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto py-8">
        <Card className="border-0 shadow-sm">
          <CardHeader className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/50 mb-4">
              <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-2xl">Upload Your Resume</CardTitle>
            <CardDescription>
              Upload your resume to personalize your interview experience (optional)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 mb-6 bg-muted/50 dark:bg-muted/20">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <input
                type="file"
                id="resume-upload"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleResumeUpload(e.target.files[0])}
                disabled={loading}
              />
              <label
                htmlFor="resume-upload"
                className="cursor-pointer mb-2"
              >
                <Button variant="outline" disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    'Select File'
                  )}
                </Button>
              </label>
              <p className="text-sm text-muted-foreground text-center">
                PDF, DOC, or DOCX (max 5MB)
              </p>
              {resume && (
                <p className="mt-4 text-sm text-green-600 dark:text-green-400">
                  Selected: {resume.name}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button
              size="lg"
              className="w-full"
              onClick={() => resume && handleResumeUpload(resume)}
              disabled={!resume || loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Starting Interview...
                </>
              ) : (
                'Start Interview with Resume'
              )}
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={handleSkipResume}
              disabled={loading}
            >
              <SkipForward className="h-4 w-4 mr-2" />
              Skip Resume and Start
            </Button>
            
            <Button
              variant="ghost"
              onClick={goBack}
              disabled={loading}
            >
              Back to Interview Type
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
}