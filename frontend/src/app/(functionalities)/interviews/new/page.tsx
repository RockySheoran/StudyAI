'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { uploadResume, startInterview } from '@/Actions/Interview/interviewService';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { 
  Loader2, 
  Briefcase, 
  User, 
  History, 
  ArrowLeft, 
  Upload, 
  FileText, 
  Sparkles, 
  Clock, 
  Target,
  CheckCircle,
  Play
} from 'lucide-react';
import { ResumeUpload } from '@/components/Interview/ResumeUploader';
import { motion } from 'framer-motion';

export default function NewInterviewPage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<'personal' | 'technical'>();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'type' | 'resume' | 'confirm'>('type');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [skipResume, setSkipResume] = useState(false);

  const handleStartInterview = async () => {
    if (!selectedType) {
      toast.error('Please select an interview type');
      return;
    }

    setLoading(true);
    
    try {
      let resumeId: string | null = null;

      if (resumeFile && !skipResume) {
        try {
          const resumeResponse: any = await uploadResume(resumeFile);
          console.log(resumeResponse)
          resumeId = resumeResponse?._id;
          toast.success('Resume uploaded successfully');
        } catch (error:any) {
          console.error('Resume upload error:', error);
          toast.error(error.respone.data.message || 'Failed to upload resume. Starting without resume...');
        }
      }

      const interviewResponse = await startInterview(selectedType, resumeId || null);
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

  const handleResumeUpload = (file: File) => {
    setResumeFile(file);
    setSkipResume(false);
    setStep('confirm');
  };

  const handleSkipResume = () => {
    setResumeFile(null);
    setSkipResume(true);
    setStep('confirm');
  };

  const goBack = () => {
    if (step === 'confirm') {
      setStep('resume');
    } else if (step === 'resume') {
      setStep('type');
      setSelectedType(undefined);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 sm:mb-10 lg:mb-12"
        >
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 sm:p-3 rounded-xl sm:rounded-2xl">
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3 sm:mb-4 px-2">
            AI Interview Practice
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed px-4">
            Master your interview skills with personalized AI-powered practice sessions designed to boost your confidence
          </p>
        </motion.div>

        {/* Progress Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-8 sm:mb-10 lg:mb-12 px-4"
        >
          <div className="flex items-center space-x-2 sm:space-x-4 overflow-x-auto">
            <div className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-full transition-all duration-300 whitespace-nowrap ${
              step === 'type' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 
              'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
            }`}>
              {step !== 'type' ? <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" /> : <span className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-600 rounded-full" />}
              <span className="text-xs sm:text-sm font-medium">Choose Type</span>
            </div>
            <div className="w-4 sm:w-8 h-0.5 bg-gray-300 dark:bg-gray-600 flex-shrink-0" />
            <div className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-full transition-all duration-300 whitespace-nowrap ${
              step === 'resume' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 
              step === 'confirm' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' :
              'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
            }`}>
              {step === 'confirm' ? <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" /> : 
               step === 'resume' ? <span className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-600 rounded-full" /> :
               <span className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-400 rounded-full" />}
              <span className="text-xs sm:text-sm font-medium">Resume</span>
            </div>
            <div className="w-4 sm:w-8 h-0.5 bg-gray-300 dark:bg-gray-600 flex-shrink-0" />
            <div className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-full transition-all duration-300 whitespace-nowrap ${
              step === 'confirm' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' :
              'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
            }`}>
              {step === 'confirm' ? <span className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-600 rounded-full" /> :
               <span className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-400 rounded-full" />}
              <span className="text-xs sm:text-sm font-medium">Start</span>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          {step === 'type' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6 sm:space-y-8"
            >
              <div className="text-center mb-6 sm:mb-8 px-4">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                  Choose Your Interview Type
                </h2>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                  Select the type of interview you'd like to practice
                </p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 px-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className={`group cursor-pointer transition-all duration-300 hover:scale-[1.02] sm:hover:scale-105 ${
                    selectedType === 'technical' ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => handleTypeSelect('technical')}
                >
                  <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
                    <div className="text-center">
                      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-3 sm:p-4 rounded-xl sm:rounded-2xl w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 mx-auto mb-4 sm:mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Briefcase className="text-white w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
                      </div>
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                        Technical Interview
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 leading-relaxed">
                        Master coding challenges and technical problem-solving
                      </p>
                      {/* <div className="space-y-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center justify-center space-x-2">
                          <Target className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>Algorithm & Data Structures</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>30-45 minutes</span>
                        </div>
                      </div> */}
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className={`group cursor-pointer transition-all duration-300 hover:scale-[1.02] sm:hover:scale-105 ${
                    selectedType === 'personal' ? 'ring-2 ring-purple-500' : ''
                  }`}
                  onClick={() => handleTypeSelect('personal')}
                >
                  <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
                    <div className="text-center">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 sm:p-4 rounded-xl sm:rounded-2xl w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 mx-auto mb-4 sm:mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <User className="text-white w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
                      </div>
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                        Personal Interview
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 leading-relaxed">
                        Practice behavioral questions and showcase your soft skills
                      </p>
                      {/* <div className="space-y-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center justify-center space-x-2">
                          <Target className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>Behavioral & Situational</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>20-30 minutes</span>
                        </div>
                      </div> */}
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {step === 'resume' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-2xl mx-auto px-4"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl border border-gray-100 dark:border-gray-700">
                {/* <div className="text-center mb-6 sm:mb-8">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mx-auto mb-3 sm:mb-4">
                    <FileText className="text-white w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10" />
                  </div>
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                    Upload Your Resume (Optional)
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                    Upload your resume for personalized questions, or skip to continue with general interview practice
                  </p>
                </div> */}

                <ResumeUpload
                  onUpload={handleResumeUpload}
                  onSkip={handleSkipResume}
                  onBack={goBack}
                  isLoading={loading}
                />
              </div>
            </motion.div>
          )}

          {step === 'confirm' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-2xl mx-auto px-4"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl border border-gray-100 dark:border-gray-700">
                <div className="text-center mb-6 sm:mb-8">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mx-auto mb-3 sm:mb-4">
                    <CheckCircle className="text-white w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10" />
                  </div>
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                    Ready to Start!
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-6 sm:mb-8">
                    Review your interview setup and start when you're ready
                  </p>
                </div>

                <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg sm:rounded-xl">
                    <span className="font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-0">Interview Type:</span>
                    <div className="flex items-center space-x-2">
                      {selectedType === 'technical' ? (
                        <><Briefcase className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" /><span className="text-blue-600 font-medium text-sm sm:text-base">Technical</span></>
                      ) : (
                        <><User className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" /><span className="text-purple-600 font-medium text-sm sm:text-base">Personal</span></>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg sm:rounded-xl">
                    <span className="font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-0">Resume:</span>
                    <div className="flex items-center space-x-2">
                      {resumeFile ? (
                        <><Upload className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" /><span className="text-green-600 font-medium text-sm sm:text-base">Uploaded</span></>
                      ) : (
                        <span className="text-gray-500 text-sm sm:text-base">Skipped</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                  <Button
                    onClick={goBack}
                    variant="outline"
                    className="w-full sm:flex-1 py-2.5 sm:py-3 text-sm sm:text-lg"
                    disabled={loading}
                  >
                    <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={handleStartInterview}
                    className="w-full sm:flex-1 py-2.5 sm:py-3 text-sm sm:text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    disabled={loading}
                  >
                    {loading ? (
                      <><Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2 animate-spin" />Starting...</>
                    ) : (
                      <><Play className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />Start Interview</>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* View History Button */}
        {step === 'type' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center mt-12"
          >
            <Link 
              href="/interviews/history" 
              className="inline-flex items-center bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <History className="mr-2 w-5 h-5" />
              View Interview History
            </Link>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-16 text-center text-sm text-gray-500 dark:text-gray-400"
        >
          <p className="flex items-center justify-center space-x-2">
            <Sparkles className="w-4 h-4" />
            <span>Powered by Advanced AI • Comprehensive Interview Preparation</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}