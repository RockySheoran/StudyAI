'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { uploadResume, startInterview } from '@/services/interviewService';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Loader2, Briefcase, User, History } from 'lucide-react';
import { ResumeUpload } from '@/components/Interview/ResumeUploader';
import { motion } from 'framer-motion';

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
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6 transition-colors duration-200">
        <div className="max-w-4xl w-full">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">
              Practice Interview
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Prepare for your next job interview with AI-powered practice sessions
            </p>
          </motion.div>

          

          {step === 'type' ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div 
                  className="block p-8 text-center cursor-pointer"
                  onClick={() => handleTypeSelect('technical')}
                >
                  <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                    <Briefcase className="text-blue-600 dark:text-blue-400 text-2xl" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">
                    Technical Interview
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Practice coding and technical questions
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div 
                  className="block p-8 text-center cursor-pointer"
                  onClick={() => handleTypeSelect('personal')}
                >
                  <div className="bg-purple-100 dark:bg-purple-900 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                    <User className="text-purple-600 dark:text-purple-400 text-2xl" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">
                    Personal Interview
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Practice behavioral and situational questions
                  </p>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <ResumeUpload
              onUpload={handleStartInterview}
              onSkip={() => handleStartInterview()}
              onBack={goBack}
              isLoading={loading}
            />
          )}
          <div>
            {/* View History Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-12"
          >
            <Link 
              href="/interviews/history" 
              className="inline-flex items-center bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-semibold py-4 px-8 rounded-lg transition duration-300"
            >
              <History className="mr-3" />
              View Interview History
            </Link>
          </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400"
          >
            <p>Powered by AI • Comprehensive interview preparation</p>
          </motion.div>
        </div>
      </div>
    </>
  );
}