// frontend/src/app/qna/page.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { QnAData, QnAResult } from '@/types/Qna-Quiz/qna';
import { api } from '@/lib/Api/Quiz-Qna-api';
import QnAForm from '@/components/Quiz-Qna/Qna/QnAForm';
import QnAQuestions from '@/components/Quiz-Qna/Qna/QnAQuestions';
import QnAResults from '@/components/Quiz-Qna/Qna/QnAResults';

const formSchema = z.object({
  educationLevel: z.string().min(1, 'Education level is required'),
  topic: z.string().min(1, 'Topic is required'),
  marks: z.number().min(2).max(5, 'Marks should be between 2 and 5'),
});

type FormData = z.infer<typeof formSchema>;

export default function QnAPage() {
  const [step, setStep] = useState<'form' | 'qna' | 'results'>('form');
  const [qnaData, setQnaData] = useState<QnAData | null>(null);
  const [qnaResult, setQnaResult] = useState<QnAResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      educationLevel: '',
      topic: '',
      marks: 2,
    }
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.generateQnA(data);
      setQnaData(response.data);
      setStep('qna');
    } catch (error: any) {
      console.error('Error generating QnA:', error);
      setError(error.message || 'Failed to generate QnA. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQnASubmit = async (answers: Record<number, string>) => {
    if (!qnaData) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await api.submitQnA({
        qnaId: qnaData._id,
        answers: Object.values(answers)
      });
      setQnaResult(response.data);
      setStep('results');
    } catch (error: any) {
      console.error('Error submitting QnA:', error);
      setError(error.message || 'Failed to submit QnA. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestart = () => {
    setStep('form');
    setQnaData(null);
    setQnaResult(null);
    setError(null);
    form.reset();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors duration-200">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-8">
          QnA Generator
        </h1>
        
        {error && (
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4 transition-colors duration-200">
            {error}
          </div>
        )}
        
        {step === 'form' && (
          <QnAForm 
            form={form} 
            onSubmit={onSubmit} 
            loading={loading} 
          />
        )}
        
        {step === 'qna' && qnaData && (
          <QnAQuestions 
            qnaData={qnaData} 
            onSubmit={handleQnASubmit}
            onCancel={() => setStep('form')}
            loading={loading}
          />
        )}
        
        {step === 'results' && qnaResult && (
          <QnAResults 
            result={qnaResult} 
            onRestart={handleRestart} 
          />
        )}
      </div>
    </div>
  );
}