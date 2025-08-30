// frontend/src/app/qna/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { QnAData, QnAResult } from '@/types/Qna-Quiz/qna';
import { api } from '@/actions/Quiz-Qna/Quiz_Qna_api';
import QnAForm from '@/components/Quiz-Qna/Qna/QnAForm';
import QnAQuestions from '@/components/Quiz-Qna/Qna/QnAQuestions';
import QnAResults from '@/components/Quiz-Qna/Qna/QnAResults';
import { useQnAStore } from '@/lib/Store/Quiz-Qna/qnaStore';

const formSchema = z.object({
  educationLevel: z.string().min(1, 'Education level is required'),
  topic: z.string().min(1, 'Topic is required'),
  marks: z.number().min(2).max(5, 'Marks should be between 2 and 5'),
});

type FormData = z.infer<typeof formSchema>;

export default function QnAPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  // Get store state and actions
  const {
    currentStep,
    currentQnA,
    currentQuestionIndex,
    userAnswers,
    qnaResult,
    setCurrentStep,
    setCurrentQnA,
    setCurrentQuestionIndex,
    setUserAnswers,
    setQnaResult,
    clearCurrentQnA,
    addQnAResult
  } = useQnAStore();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      educationLevel: '',
      topic: '',
      marks: 2,
    }
  });

  // Restore form data from store if available
  useEffect(() => {
    if (currentStep === 'form' && currentQnA) {
      form.setValue('educationLevel', currentQnA.educationLevel);
      form.setValue('topic', currentQnA.topic);
      form.setValue('marks', currentQnA.questions[0]?.maxMarks || 2);
    }
  }, [currentStep, currentQnA, form]);

  const handleGoBack = () => {
    router.back();
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.generateQnA(data);
      const qnaData: QnAData = response.data;
      
      // Store QnA data and reset progress
      setCurrentQnA(qnaData);
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setCurrentStep('qna');
    } catch (error: any) {
      console.error('Error generating QnA:', error);
      setError(error.message || 'Failed to generate QnA. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQnASubmit = async (answers: Record<number, string>) => {
    if (!currentQnA) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await api.submitQnA({
        qnaId: currentQnA._id,
        answers: Object.values(answers)
      });
      
      const result: QnAResult = response.data;
      
      // Store result and move to results page
      setQnaResult(result);
      addQnAResult(result);
      setCurrentStep('results');
    } catch (error: any) {
      console.error('Error submitting QnA:', error);
      setError(error.message || 'Failed to submit QnA. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    setUserAnswers({ ...userAnswers, [questionIndex]: answer });
  };

  const handleQuestionNavigation = (newIndex: number) => {
    setCurrentQuestionIndex(newIndex);
  };

  const handleRestart = () => {
    setCurrentStep('form');
    clearCurrentQnA();
    setError(null);
    form.reset();
  };

  const handleCancel = () => {
    setCurrentStep('form');
    setError(null);
  };
  const resetForm = () => {
    form.reset();
    setCurrentQnA(null);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors duration-200">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Go Back Button */}
        <button
          onClick={handleGoBack}
          className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white mb-6 transition-colors duration-200"
        >
          <svg 
            className="w-5 h-5 mr-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M10 19l-7-7m0 0l7-7m-7 7h18" 
            />
          </svg>
          Go Back
        </button>
        
        <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-8">
          QnA Generator
        </h1>
        
        {error && (
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4 transition-colors duration-200">
            {error}
          </div>
        )}
        
        {currentStep === 'form' && (
          <QnAForm 
            form={form} 
            onSubmit={onSubmit} 
            loading={loading} 
            resetForm={resetForm}
          />
        )}
        
        {currentStep === 'qna' && currentQnA && (
          <QnAQuestions 
            qnaData={currentQnA}
            currentQuestionIndex={currentQuestionIndex}
            userAnswers={userAnswers}
            onAnswerChange={handleAnswerChange}
            onQuestionNavigate={handleQuestionNavigation}
            onSubmit={handleQnASubmit}
            onCancel={handleCancel}
            loading={loading}
          />
        )}
        
        {currentStep === 'results' && qnaResult && (
          <QnAResults 
            // result={qnaResult} 
            onRestart={handleRestart} 
          />
        )}
        
      </div>
    </div>
  );
}