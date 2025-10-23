import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { IInterview } from "@/types/Interview-type";
import { Interview_history_get } from "@/Actions/Get_History/Get_Interview_history";

interface InterviewHistoryState {
  interviews: IInterview[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  cacheExpiry: number; // 5 minutes in milliseconds
  
  // Actions
  setInterviews: (interviews: IInterview[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addInterview: (interview: IInterview) => void;
  removeInterview: (interviewId: string) => void;
  updateInterview: (interviewId: string, updates: Partial<IInterview>) => void;
  fetchInterviews: (token: string, forceRefresh?: boolean) => Promise<void>;
  clearCache: () => void;
  isDataStale: () => boolean;
}

export const useInterviewHistoryStore = create<InterviewHistoryState>()(
  devtools(
    persist(
      (set, get) => ({
        interviews: [],
        loading: false,
        error: null,
        lastFetched: null,
        cacheExpiry: 5 * 60 * 1000, // 5 minutes

        setInterviews: (interviews) => 
          set({ interviews, lastFetched: Date.now(), error: null }, false, "setInterviews"),

        setLoading: (loading) => 
          set({ loading }, false, "setLoading"),

        setError: (error) => 
          set({ error, loading: false }, false, "setError"),

        addInterview: (interview) =>
          set((state) => ({
            interviews: [interview, ...state.interviews],
            lastFetched: Date.now()
          }), false, "addInterview"),

        removeInterview: (interviewId) =>
          set((state) => ({
            interviews: state.interviews.filter(i => i._id !== interviewId),
            lastFetched: Date.now()
          }), false, "removeInterview"),

        updateInterview: (interviewId, updates) =>
          set((state) => ({
            interviews: state.interviews.map(i => 
              i._id === interviewId ? { ...i, ...updates } : i
            ),
            lastFetched: Date.now()
          }), false, "updateInterview"),

        isDataStale: () => {
          const { lastFetched, cacheExpiry } = get();
          if (!lastFetched) return true;
          return Date.now() - lastFetched > cacheExpiry;
        },

        fetchInterviews: async (token: string, forceRefresh = false) => {
          const { interviews, isDataStale, setLoading, setInterviews, setError } = get();
          
          // Return cached data if available and not stale, unless force refresh
          if (!forceRefresh && interviews.length > 0) {
            setError(null);
            return;
          }

          setLoading(true);
          setError(null);

          try {
            const res = await Interview_history_get({ token });
            
            if (res.status === 200) {
              setInterviews(res.data.data.interviews || []);
            } else {
              setError(res.message || "Failed to fetch interview history");
            }
          } catch (error) {
            console.error("Error fetching interview history:", error);
            setError("Failed to load interview history");
          } finally {
            setLoading(false);
          }
        },

        clearCache: () =>
          set({ 
            interviews: [], 
            lastFetched: null, 
            error: null 
          }, false, "clearCache"),
      }),
      {
        name: "interview-history-store",
        partialize: (state) => ({
          interviews: state.interviews,
          lastFetched: state.lastFetched,
        }),
      }
    ),
    {
      name: "interview-history-store",
    }
  )
);
