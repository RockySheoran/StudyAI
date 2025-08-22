// frontend/src/store/quizStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage, devtools } from 'zustand/middleware';
import { QuizData, QuizResult } from '@/types/Qna-Quiz/quiz';

interface QuizState {
  // Current state
  currentStep: 'form' | 'quiz' | 'results';
  currentQuiz: QuizData | null;
  currentQuestionIndex: number;
  userAnswers: Record<number, string>;
  quizResult: QuizResult | null;
  
  // Quiz history
  quizHistory: Array<{
    id: string;
    educationLevel: string;
    topic: string;
    score: number;
    totalQuestions: number;
    percentage: number;
    timestamp: Date;
  }>;
  
  // Recent quiz results
  recentResults: QuizResult[];
  
  // Actions
  setCurrentStep: (step: 'form' | 'quiz' | 'results') => void;
  setCurrentQuiz: (quiz: QuizData | null) => void;
  setCurrentQuestionIndex: (index: number) => void;
  setUserAnswers: (answers: Record<number, string>) => void;
  setQuizResult: (result: QuizResult | null) => void;
  clearCurrentQuiz: () => void;
  addQuizResult: (result: QuizResult) => void;
  clearQuizHistory: () => void;
  removeQuizFromHistory: (id: string) => void;
}

export const useQuizStore = create<QuizState>()(
    devtools(
  persist(
    (set, get) => ({
      currentStep: 'form',
      currentQuiz: null,
      currentQuestionIndex: 0,
      userAnswers: {},
      quizResult: null,
      quizHistory: [],
      recentResults: [],

      setCurrentStep: (step) => {
        set({ currentStep: step });
      },

      setCurrentQuiz: (quiz) => {
        set({ currentQuiz: quiz });
      },

      setCurrentQuestionIndex: (index) => {
        set({ currentQuestionIndex: index });
      },

      setUserAnswers: (answers) => {
        set({ userAnswers: answers });
      },

      setQuizResult: (result) => {
        set({ quizResult: result });
      },

      clearCurrentQuiz: () => {
        set({ 
          currentQuiz: null,
          currentQuestionIndex: 0,
          userAnswers: {},
          quizResult: null
        });
      },

      addQuizResult: (result) => {
        const { quizHistory, recentResults, currentQuiz } = get();
        
        // Add to history
        const historyEntry = {
          id: Math.random().toString(36).substr(2, 9),
          educationLevel: currentQuiz?.educationLevel || 'Unknown',
          topic: currentQuiz?.topic || 'Unknown',
          score: result.score,
          totalQuestions: result.totalQuestions,
          percentage: result.percentage,
          timestamp: new Date(),
        };

        // Update recent results (keep last 5)
        const updatedRecentResults = [result, ...recentResults].slice(0, 5);

        set({
          quizHistory: [historyEntry, ...quizHistory],
          recentResults: updatedRecentResults,
          currentStep: 'results',
        });
      },

      clearQuizHistory: () => {
        set({ quizHistory: [], recentResults: [] });
      },

      removeQuizFromHistory: (id) => {
        set((state) => ({
          quizHistory: state.quizHistory.filter((item) => item.id !== id),
        }));
      },
    }),
    {
      name: 'quiz-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
);