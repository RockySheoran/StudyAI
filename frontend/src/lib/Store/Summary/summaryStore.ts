// frontend/src/lib/Store/Summary/summaryStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage, devtools } from 'zustand/middleware';
import axios from 'axios';

export interface SummaryFile {
  file: File;
  name: string;
  size: number;
  type: string;
}

export interface SummaryResult {
  id: string;
  fileName: string;
  content: string;
  createdAt: Date;
  fileSize: number;
  processingTime?: number;
}

export type SummaryStatus = 'idle' | 'uploading' | 'processing' | 'completed' | 'failed' | 'cancelled';

interface SummaryState {
  // File state
  selectedFile: File | null;
  fileId: string | null;
  summaryId: string | null;
  summaryContent: string | null;
  
  // Status and progress
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  error: string | null;
  isUploading: boolean;
  isProcessing: boolean;
  
  // Timing
  uploadStartTime: number | null;
  processingStartTime: number | null;
  
  // Polling
  pollingInterval: NodeJS.Timeout | null;
  
  // History
  summaryHistory: SummaryResult[];
  
  // Actions
  setSelectedFile: (file: File | null) => void;
  setStatus: (status: SummaryState['status']) => void;
  setProgress: (progress: number) => void;
  setError: (error: string | null) => void;
  setFileId: (fileId: string | null) => void;
  setSummaryId: (summaryId: string | null) => void;
  setSummaryContent: (content: string | null) => void;
  setUploadStartTime: (time: number | null) => void;
  setProcessingStartTime: (time: number | null) => void;
  
  uploadFile: (file: File, token: string) => Promise<void>;
  pollSummaryStatus: (summaryId: string, token: string) => Promise<void>;
  cancelOperation: () => void;
  resetSession: () => void;
  startNewSummary: () => void;
  
  // History actions
  addToHistory: (result: SummaryResult) => void;
  clearHistory: () => void;
  getLatestHistory: (count?: number) => SummaryResult[];
}

export const useSummaryStore = create<SummaryState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        selectedFile: null,
        fileId: null,
        summaryId: null,
        summaryContent: null,
        status: 'idle' as const,
        progress: 0,
        error: null,
        isUploading: false,
        isProcessing: false,
        uploadStartTime: null,
        processingStartTime: null,
        pollingInterval: null,
        summaryHistory: [],

        // Basic setters
        setSelectedFile: (file) => {
          set({ selectedFile: file });
        },

        setStatus: (status) => set({ status }),
        setProgress: (progress) => set({ progress }),
        setError: (error) => set({ error }),
        setFileId: (fileId) => set({ fileId }),
        setSummaryId: (summaryId) => set({ summaryId }),
        setSummaryContent: (content) => set({ summaryContent: content }),
        setUploadStartTime: (time) => set({ uploadStartTime: time }),
        setProcessingStartTime: (time) => set({ processingStartTime: time }),

        // Upload file action
        uploadFile: async (file, token) => {
          const state = get();
          
          try {
            set({ 
              isUploading: true, 
              status: 'uploading',
              error: null,
              progress: 0,
              uploadStartTime: Date.now()
            });

            const api_file_upload_url = process.env.NEXT_PUBLIC_BACKEND_FILE_URL 
              ? `${process.env.NEXT_PUBLIC_BACKEND_FILE_URL}/api` 
              : 'http://localhost:5001/api';

            const formData = new FormData();
            formData.append('file', file);

            const response = await axios.post(`${api_file_upload_url}/upload`, formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`
              },
              onUploadProgress: (progressEvent) => {
                if (progressEvent.total) {
                  const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                  set({ progress });
                }
              },
            });
            console.log(response.data)

            if (response.data) {
              const summaryId = response.data.summaryId;
              const fileId = response.data.fileId;
              console.log('Upload successful, starting polling for:', summaryId);
              
              set({ 
                fileId: response.data.fileId,
                summaryId: summaryId,
                isUploading: false,
                status: 'processing',
                progress: 50,
                processingStartTime: Date.now()
              });

              // Clear any existing polling interval
              const currentState = get();
              if (currentState.pollingInterval) {
                clearInterval(currentState.pollingInterval);
              }

              // Start polling directly in this function
              const pollingInterval = setInterval(async () => {
                const pollState = get();
                
                if (pollState.status === 'cancelled') {
                  if (pollState.pollingInterval) {
                    clearInterval(pollState.pollingInterval);
                    set({ pollingInterval: null });
                  }
                  return;
                }

                try {
                  console.log('Polling for summary status:', fileId);
                  const statusResponse = await axios.get(`${api_file_upload_url}/file/${fileId}/status`, {
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  console.log(statusResponse,"statusResponse")
                  

                  console.log('Polling response:', statusResponse.data);
                  const { status: summaryStatus, content ,message ,error } = statusResponse.data;

                  if (summaryStatus === 'completed' && content) {
                    const processingTime = pollState.processingStartTime 
                      ? Date.now() - pollState.processingStartTime 
                      : 0;

                    const result: SummaryResult = {
                      id: summaryId,
                      fileName: pollState.selectedFile?.name || 'Unknown',
                      content,
                      createdAt: new Date(),
                      fileSize: pollState.selectedFile?.size || 0,
                      processingTime
                    };

                    // Clear polling interval
                    if (pollState.pollingInterval) {
                      clearInterval(pollState.pollingInterval);
                    }

                    set({ 
                      status: 'completed',
                      summaryContent: content,
                      isProcessing: false,
                      progress: 100,
                      processingStartTime: null,
                      pollingInterval: null
                    });

                    get().addToHistory(result);
                  } else if (summaryStatus === 'failed') {
                    // Clear polling interval
                    if (pollState.pollingInterval) {
                      clearInterval(pollState.pollingInterval);
                    }

                    set({ 
                      status: 'failed',
                      error: message || 'Summary generation failed  ',
                      isProcessing: false,
                      processingStartTime: null,
                      pollingInterval: null
                    });
                  }
                  // If status is still 'processing', continue polling
                } catch (pollError: any) {
                  console.error('Polling error:', pollError);
                  
                  // Clear polling interval on error
                  if (pollState.pollingInterval) {
                    clearInterval(pollState.pollingInterval);
                  }

                  set({ 
                    status: 'failed',
                    error: 'Failed to check summary status',
                    isProcessing: false,
                    processingStartTime: null,
                    pollingInterval: null
                  });
                }
              }, 7000); // Poll every 7 seconds

              set({ pollingInterval });
            } else {
              throw new Error(response.data.message || 'Upload failed');
            }
          } catch (error: any) {
            console.error('Upload error:', error);
            set({ 
              isUploading: false,
              status: 'failed',
              error: error.response?.data?.message || error.message || 'Upload failed',
              uploadStartTime: null
            });
          }
        },

        // Poll summary status
        pollSummaryStatus: async (summaryId, token) => {
          console.log(summaryId, token)
          const state = get();
          
          // Clear any existing polling interval
          if (state.pollingInterval) {
            clearInterval(state.pollingInterval);
          }

          set({ isProcessing: true });

          const pollingInterval = setInterval(async () => {
            const currentState = get();
            
            if (currentState.status === 'cancelled') {
              if (currentState.pollingInterval) {
                clearInterval(currentState.pollingInterval);
                set({ pollingInterval: null });
              }
              return;
            }

            try {
              const api_file_upload_url = process.env.NEXT_PUBLIC_BACKEND_FILE_URL 
              ? `${process.env.NEXT_PUBLIC_BACKEND_FILE_URL}/api` 
              : 'http://localhost:5001/api';
              
              console.log(api_file_upload_url)
              const response = await axios.get(`${api_file_upload_url}/file/${summaryId}/status`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              console.log(response.data)

              const { status: summaryStatus, content } = response.data;

              if (summaryStatus === 'completed' && content) {
                const processingTime = currentState.processingStartTime 
                  ? Date.now() - currentState.processingStartTime 
                  : 0;

                const result: SummaryResult = {
                  id: summaryId,
                  fileName: currentState.selectedFile?.name || 'Unknown',
                  content,
                  createdAt: new Date(),
                  fileSize: currentState.selectedFile?.size || 0,
                  processingTime
                };

                // Clear polling interval
                if (currentState.pollingInterval) {
                  clearInterval(currentState.pollingInterval);
                }

                set({ 
                  status: 'completed',
                  summaryContent: content,
                  isProcessing: false,
                  progress: 100,
                  processingStartTime: null,
                  pollingInterval: null
                });

                get().addToHistory(result);
              } else if (summaryStatus === 'failed') {
                // Clear polling interval
                if (currentState.pollingInterval) {
                  clearInterval(currentState.pollingInterval);
                }

                set({ 
                  status: 'failed',
                  error: 'Summary generation failed',
                  isProcessing: false,
                  processingStartTime: null,
                  pollingInterval: null
                });
              }
              // If status is still 'processing', continue polling
            } catch (error: any) {
              console.error('Polling error:', error);
              
              // Clear polling interval on error
              if (currentState.pollingInterval) {
                clearInterval(currentState.pollingInterval);
              }

              set({ 
                status: 'failed',
                error: 'Failed to check summary status',
                isProcessing: false,
                processingStartTime: null,
                pollingInterval: null
              });
            }
          }, 7000); // Poll every 7 seconds

          set({ pollingInterval });
        },

        // Cancel operation
        cancelOperation: () => {
          const state = get();
          
          // Clear polling interval if it exists
          if (state.pollingInterval) {
            clearInterval(state.pollingInterval);
          }
          
          set({ 
            status: 'cancelled',
            isUploading: false,
            isProcessing: false,
            progress: 0,
            error: null,
            uploadStartTime: null,
            processingStartTime: null,
            pollingInterval: null
          });
        },

        // Reset session
        resetSession: () => {
          const state = get();
          
          // Clear polling interval if it exists
          if (state.pollingInterval) {
            clearInterval(state.pollingInterval);
          }
          
          set({
            selectedFile: null,
            fileId: null,
            summaryId: null,
            summaryContent: null,
            status: 'idle',
            progress: 0,
            error: null,
            isUploading: false,
            isProcessing: false,
            uploadStartTime: null,
            processingStartTime: null,
            pollingInterval: null
          });
        },

        // Start new summary (keeps completed result accessible but allows new upload)
        startNewSummary: () => {
          const state = get();
          
          // Clear polling interval if it exists
          if (state.pollingInterval) {
            clearInterval(state.pollingInterval);
          }
          
          set({
            selectedFile: null,
            status: 'idle',
            progress: 0,
            error: null,
            isUploading: false,
            isProcessing: false,
            uploadStartTime: null,
            processingStartTime: null,
            pollingInterval: null
            // Keep summaryContent, summaryId, fileId so user can still view previous result
          });
        },

        // Add to history
        addToHistory: (result: SummaryResult) => {
          const state = get();
          const newHistory = [result, ...state.summaryHistory];
          set({ summaryHistory: newHistory });
        },

        clearHistory: () => {
          set({ summaryHistory: [] });
        },

        getLatestHistory: (count = 5) => {
          const state = get();
          return state.summaryHistory.slice(0, count);
        }
      }),
      {
        name: 'summary-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          summaryHistory: state.summaryHistory,
          summaryContent: state.summaryContent,
          summaryId: state.summaryId,
          fileId: state.fileId,
          status: state.status === 'completed' ? state.status : 'idle', // Only persist completed status
          selectedFile: null, // Don't persist File object as it's not serializable
        }),
      }
    )
  )
);
