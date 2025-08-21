// frontend/src/app/quiz/page.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { QuizData, QuizResult } from '@/types/Qna-Quiz/quiz';
import { api } from '@/lib/Api/Quiz-Qna-api';
import QuizQuestions from '@/components/Quiz-Qna/Quiz/QuizQuestions';
import QuizResults from '@/components/Quiz-Qna/Quiz/QuizResults';
import QuizForm from '@/components/Quiz-Qna/Quiz/QuizForm';


const formSchema = z.object({
  educationLevel: z.string().min(1, 'Education level is required'),
  topic: z.string().min(1, 'Topic is required'),
});

type FormData = z.infer<typeof formSchema>;

export default function QuizPage() {
  const [step, setStep] = useState<'form' | 'quiz' | 'results'>('form');
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      educationLevel: '',
      topic: ''
    }
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.generateQuiz(data);
      setQuizData(response.data);
      setStep('quiz');
    } catch (error: any) {
      console.error('Error generating quiz:', error);
      setError(error.message || 'Failed to generate quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuizSubmit = async (answers: Record<number, string>) => {
    if (!quizData) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await api.submitQuiz({
        quizId: quizData._id,
        answers: Object.values(answers)
      });
      setQuizResult(response.data);
      setStep('results');
    } catch (error: any) {
      console.error('Error submitting quiz:', error);
      setError(error.message || 'Failed to submit quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestart = () => {
    setStep('form');
    setQuizData(null);
    setQuizResult(null);
    setError(null);
    form.reset();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors duration-200">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-8">
          Quiz Generator
        </h1>
        
        {error && (
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4 transition-colors duration-200">
            {error}
          </div>
        )}
        
        {step === 'form' && (
          <QuizForm 

            form={form} 
            onSubmit={onSubmit} 
            loading={loading} 
          />
        )}
        
        {step === 'quiz' && quizData && (
          <QuizQuestions 
            quizData={quizData} 
            onSubmit={handleQuizSubmit}
            onCancel={() => setStep('form')}
            loading={loading}
          />
        )}
        
        {step === 'results' && quizResult && (
          <QuizResults 
            result={quizResult} 
            onRestart={handleRestart} 
          />
        )}
      </div>
    </div>
  );
}