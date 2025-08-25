import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { ISummary } from "@/types/Summary-type";
import { Summary_history_get } from "@/Actions/Get-History/Get-summary";

interface SummaryHistoryState {
  summaries: ISummary[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  cacheExpiry: number; // 5 minutes in milliseconds
  
  // Actions
  setSummaries: (summaries: ISummary[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addSummary: (summary: ISummary) => void;
  removeSummary: (summaryId: string) => void;
  updateSummary: (summaryId: string, updates: Partial<ISummary>) => void;
  fetchSummaries: (token: string, forceRefresh?: boolean) => Promise<void>;
  clearCache: () => void;
  isDataStale: () => boolean;
}

export const useSummaryHistoryStore = create<SummaryHistoryState>()(
  devtools(
    persist(
      (set, get) => ({
        summaries: [],
        loading: false,
        error: null,
        lastFetched: null,
        cacheExpiry: 50 * 60 * 1000, // 5 minutes

        setSummaries: (summaries) => 
          set({ summaries, lastFetched: Date.now(), error: null }, false, "setSummaries"),

        setLoading: (loading) => 
          set({ loading }, false, "setLoading"),

        setError: (error) => 
          set({ error, loading: false }, false, "setError"),

        addSummary: (summary) =>
          set((state) => ({
            summaries: [summary, ...state.summaries],
            lastFetched: Date.now()
          }), false, "addSummary"),

        removeSummary: (summaryId) =>
          set((state) => ({
            summaries: state.summaries.filter(s => s._id !== summaryId),
            lastFetched: Date.now()
          }), false, "removeSummary"),

        updateSummary: (summaryId, updates) =>
          set((state) => ({
            summaries: state.summaries.map(s => 
              s._id === summaryId ? { ...s, ...updates } : s
            ),
            lastFetched: Date.now()
          }), false, "updateSummary"),

        isDataStale: () => {
          const { lastFetched, cacheExpiry } = get();
          if (!lastFetched) return true;
          return Date.now() - lastFetched > cacheExpiry;
        },

        fetchSummaries: async (token: string, forceRefresh = false) => {
          const { summaries, isDataStale, setLoading, setSummaries, setError } = get();
          
          // Return cached data if available and not stale, unless force refresh
          if (!forceRefresh && summaries.length > 0 && !isDataStale()) {
            console.log("Using cached summary data");
            return;
          }

          setLoading(true);
          setError(null);

          try {
            console.log("Fetching fresh summary data from API");
            const res = await Summary_history_get({ token });
            
            if (res.status === 200) {
              setSummaries(res.data || []);
            } else {
              setError(res.message || "Failed to fetch summary history");
            }
          } catch (error) {
            console.error("Error fetching summary history:", error);
            setError("Failed to load summary history");
          } finally {
            setLoading(false);
          }
        },

        clearCache: () =>
          set({ 
            summaries: [], 
            lastFetched: null, 
            error: null 
          }, false, "clearCache"),
      }),
      {
        name: "summary-history-store",
        partialize: (state) => ({
          summaries: state.summaries,
          lastFetched: state.lastFetched,
        }),
      }
    ),
    {
      name: "summary-history-store",
    }
  )
);