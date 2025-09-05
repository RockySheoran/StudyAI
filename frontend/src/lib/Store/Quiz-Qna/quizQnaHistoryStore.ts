// frontend/src/lib/Store/Quiz-Qna/quizQnaHistoryStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage, devtools } from 'zustand/middleware';
import { useQuizStore } from './quizStore';
import { useQnAStore } from './qnaStore';
import { Quiz_history_get } from '@/Actions/Get_History/Get_Quiz_history';
import { Qna_history_get } from '@/Actions/Get_History/Get_Qna_history';

export interface QuizResult {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  difficulty: 'easy' | 'medium' | 'hard'
}

interface IQuizResult {
  score: number;
  totalQuestions: number;
  percentage: number;
  results: QuizResult[];
}


export interface QuizHistoryItem {
  id: string;
  type: 'quiz';
  educationLevel: string;
 topic:string;
  timestamp: Date;
  result?: IQuizResult; // Full quiz result for detailed view
}
export interface IQnAResult {
  question: string;
  answer: string;
  score: number;
  maxMarks: number;
  feedback: string;
}
interface IQnAAllResult {
  totalScore: number;
  maxPossibleScore: number;
  evaluations: IQnAResult[];
}
export interface QnAHistoryItem {
  id: string;
  type: 'qna';
  educationLevel: string;
  topic: string;
  timestamp: Date;
  result?: IQnAAllResult ; // Full QnA result for detailed view
}

export type HistoryItem = QuizHistoryItem | QnAHistoryItem;

interface QuizQnAHistoryState {
  // Combined history
  allHistory: HistoryItem[];
  selectedHistoryItem: HistoryItem | null;
  currentView: 'history' | 'results';
  activeTab: 'quiz' | 'qna';
  
  // Actions
  setActiveTab: (tab: 'quiz' | 'qna') => void;
  setSelectedHistoryItem: (item: HistoryItem | null) => void;
  setCurrentView: (view: 'history' | 'results') => void;
  getLatestHistory: (count?: number) => HistoryItem[];
  getQuizHistory: (count?: number) => QuizHistoryItem[];
  getQnAHistory: (count?: number) => QnAHistoryItem[];
  refreshHistory: (token:string,refresh?: boolean) => Promise<void>;
  clearAllHistory: () => void;
}

export const useQuizQnAHistoryStore = create<QuizQnAHistoryState>()(
  devtools(
    persist(
      (set, get) => ({
        allHistory: [],
        selectedHistoryItem: null,
        currentView: 'history',
        activeTab: 'quiz',

        setActiveTab: (tab) => {
          set({ activeTab: tab });
        },

        setSelectedHistoryItem: (item) => {
          set({ 
            selectedHistoryItem: item,
            currentView: item ? 'results' : 'history'
          });
        },

        setCurrentView: (view) => {
          set({ currentView: view });
          if (view === 'history') {
            set({ selectedHistoryItem: null });
          }
        },

        getLatestHistory: (count = 3) => {
          const { allHistory } = get();
          return allHistory
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, count);
        },

        getQuizHistory: (count = 3) => {
          const { allHistory } = get();
          return allHistory
            .filter((item): item is QuizHistoryItem => item.type === 'quiz')
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, count);
        },

        getQnAHistory: (count = 3) => {
          const { allHistory } = get();
          return allHistory
            .filter((item): item is QnAHistoryItem => item.type === 'qna')
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, count);
        },

        refreshHistory: async (token:string,refresh = false ) => {
          if(!token){
            return;
          }
          
          // Checking refresh parameter
          if(get().allHistory?.length > 0 && !refresh){
            return;
          }
       
            // Fetch data from APIs
            const [quizResponse, qnaResponse] = await Promise.all([
              Quiz_history_get({ token }),
              Qna_history_get({ token })
            ]);

            const combinedHistory: HistoryItem[] = [];

            // Process quiz history
            if (quizResponse?.data && Array.isArray(quizResponse.data)) {
              const quizItems: QuizHistoryItem[] = quizResponse.data.map((quiz: any) => ({
                ...quiz,
                type: 'quiz' as const,
                createdAt: quiz.createdAt || quiz.date,
                percentage: quiz.percentage || 0,
                totalQuestions: quiz.totalQuestions || 0,
                correctAnswers: quiz.correctAnswers || 0
              }));
              combinedHistory.push(...quizItems);
            }

            // Process QnA history
            if (qnaResponse?.data && Array.isArray(qnaResponse.data)) {
              const qnaItems: QnAHistoryItem[] = qnaResponse.data.map((qna: any) => ({
                ...qna,
                type: 'qna' as const,
                createdAt: qna.createdAt || qna.date,
                percentage: qna.percentage || 0,
                totalQuestions: qna.totalQuestions || 0,
                correctAnswers: qna.correctAnswers || 0
              }));
              combinedHistory.push(...qnaItems);
            }
            // Update the store with fetched data
            set({ allHistory: combinedHistory });

        

        },

        clearAllHistory: () => {
          set({ 
            allHistory: [],
            selectedHistoryItem: null,
            currentView: 'history'
          });
          // Also clear individual stores
          useQuizStore.getState().clearQuizHistory();
          useQnAStore.getState().clearQnAHistory();
        },
      }),
      {
        name: 'quiz-qna-history-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          allHistory: state.allHistory,
          activeTab: state.activeTab,
        }),
      }
    )
  )
);

// Note: Auto-refresh disabled since refreshHistory now requires token
// Components should call refreshHistory manually with token when needed
