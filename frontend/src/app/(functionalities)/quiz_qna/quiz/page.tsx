// frontend/src/app/quiz/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

import { QuizData, QuizResult } from '@/types/Qna-Quiz/quiz';
import { api } from '@/Actions/Quiz-Qna/Quiz-Qna-api';
import QuizQuestions from '@/components/Quiz-Qna/Quiz/QuizQuestions';
import QuizResults from '@/components/Quiz-Qna/Quiz/QuizResults';
import QuizForm from '@/components/Quiz-Qna/Quiz/QuizForm';
import { useQuizStore } from '@/lib/Store/Quiz-Qna/quizStore';


const formSchema = z.object({
  educationLevel: z.string().min(1, 'Education level is required'),
  topic: z.string().min(1, 'Topic is required'),
});

type FormData = z.infer<typeof formSchema>;

export default function QuizPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  // Get store state and actions
  const {
    currentStep,
    currentQuiz,
    currentQuestionIndex,
    userAnswers,
    quizResult,
    setCurrentStep,
    setCurrentQuiz,
    setCurrentQuestionIndex,
    setUserAnswers,
    setQuizResult,
    clearCurrentQuiz,
    addQuizResult
  } = useQuizStore();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      educationLevel: '',
      topic: ''
    }
  });

  // Restore form data from store if available
  useEffect(() => {
    if (currentStep === 'form' && currentQuiz) {
      form.setValue('educationLevel', currentQuiz.educationLevel);
      form.setValue('topic', currentQuiz.topic);
    }
  }, [currentStep, currentQuiz, form]);

  const handleGoBack = () => {
    router.back();
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.generateQuiz(data);
      const quizData: QuizData = response.data;
      
      // Store quiz data and reset progress
      setCurrentQuiz(quizData);
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setCurrentStep('quiz');
    } catch (error: any) {
      console.error('Error generating quiz:', error);
      setError(error.message || 'Failed to generate quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuizSubmit = async (answers: Record<number, string>) => {
    if (!currentQuiz) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await api.submitQuiz({
        quizId: currentQuiz._id,
        answers: Object.values(answers)
      });
      
      const result: QuizResult = response.data;
      
      // Store result and move to results page
      setQuizResult(result);
      addQuizResult(result);
      setCurrentStep('results');
    } catch (error: any) {
      console.error('Error submitting quiz:', error);
      setError(error.message || 'Failed to submit quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    setUserAnswers({ ...userAnswers, [questionIndex]: answer });
  };

  const handleQuestionNavigation = (newIndex: number) => {
    setCurrentQuestionIndex(newIndex);
  };

  const handleRestart = () => {
    setCurrentStep('form');
    clearCurrentQuiz();
    setError(null);
    form.reset();
  };

  const handleCancel = () => {
    setCurrentStep('form');
    setError(null);
  };
  const reset = () => {
    form.reset();
    setCurrentQuiz(null);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setQuizResult(null);
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
          Quiz Generator
        </h1>
        
        {error && (
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4 transition-colors duration-200">
            {error}
          </div>
        )}
        
        {currentStep === 'form' && (
          <QuizForm 
            form={form} 
            reset={reset}
            onSubmit={onSubmit} 
            loading={loading} 
          />
        )}
        
        {currentStep === 'quiz' && currentQuiz && (
          <QuizQuestions 
            quizData={currentQuiz}
            currentQuestionIndex={currentQuestionIndex}
            userAnswers={userAnswers}
            onAnswerSelect={handleAnswerSelect}
            onQuestionNavigate={handleQuestionNavigation}
            onSubmit={handleQuizSubmit}
            onCancel={handleCancel}
            loading={loading}
          />
        )}
        
        {currentStep === 'results' && quizResult && (
          <QuizResults 
            result={quizResult} 
            onRestart={handleRestart} 
          />
        )}

        
      </div>
    </div>
  );
}