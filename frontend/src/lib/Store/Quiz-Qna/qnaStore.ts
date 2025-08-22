// frontend/src/store/qnaStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage, devtools } from 'zustand/middleware';
import { QnAData, QnAResult } from '@/types/Qna-Quiz/qna';

interface QnAState {
  // Current state
  currentStep: 'form' | 'qna' | 'results';
  currentQnA: QnAData | null;
  currentQuestionIndex: number;
  userAnswers: Record<number, string>;
  qnaResult: QnAResult | null;
  
  // QnA history
  qnaHistory: Array<{
    id: string;
    educationLevel: string;
    topic: string;
    score: number;
    maxPossibleScore: number;
    percentage: number;
    timestamp: Date;
  }>;
  
  // Recent QnA results
  recentResults: QnAResult[];
  
  // Actions
  setCurrentStep: (step: 'form' | 'qna' | 'results') => void;
  setCurrentQnA: (qna: QnAData | null) => void;
  setCurrentQuestionIndex: (index: number) => void;
  setUserAnswers: (answers: Record<number, string>) => void;
  setQnaResult: (result: QnAResult | null) => void;
  clearCurrentQnA: () => void;
  addQnAResult: (result: QnAResult) => void;
  clearQnAHistory: () => void;
  removeQnAFromHistory: (id: string) => void;
}

export const useQnAStore = create<QnAState>()(
    devtools(
  persist(
    (set, get) => ({
      currentStep: 'form',
      currentQnA: null,
      currentQuestionIndex: 0,
      userAnswers: {},
      qnaResult: null,
      qnaHistory: [],
      recentResults: [],

      setCurrentStep: (step) => {
        set({ currentStep: step });
      },

      setCurrentQnA: (qna) => {
        set({ currentQnA: qna });
      },

      setCurrentQuestionIndex: (index) => {
        set({ currentQuestionIndex: index });
      },

      setUserAnswers: (answers) => {
        set({ userAnswers: answers });
      },

      setQnaResult: (result) => {
        set({ qnaResult: result });
      },

      clearCurrentQnA: () => {
        set({ 
          currentQnA: null,
          currentQuestionIndex: 0,
          userAnswers: {},
          qnaResult: null
        });
      },

      addQnAResult: (result) => {
        const { qnaHistory, recentResults, currentQnA } = get();
        
        // Add to history
        const historyEntry = {
          id: Math.random().toString(36).substr(2, 9),
          educationLevel: currentQnA?.educationLevel || 'Unknown',
          topic: currentQnA?.topic || 'Unknown',
          score: result.totalScore,
          maxPossibleScore: result.maxPossibleScore,
          percentage: result.percentage,
          timestamp: new Date(),
        };

        // Update recent results (keep last 5)
        const updatedRecentResults = [result, ...recentResults].slice(0, 5);

        set({
          qnaHistory: [historyEntry, ...qnaHistory],
          recentResults: updatedRecentResults,
          currentStep: 'results',
        });
      },

      clearQnAHistory: () => {
        set({ qnaHistory: [], recentResults: [] });
      },

      removeQnAFromHistory: (id) => {
        set((state) => ({
          qnaHistory: state.qnaHistory.filter((item) => item.id !== id),
        }));
      },
    }),
    {
      name: 'qna-storage',
      storage: createJSONStorage(() => localStorage),
    }
  ))
);