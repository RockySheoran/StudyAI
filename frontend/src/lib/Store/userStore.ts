import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';

interface UserData {
  name: string | null;
  email: string | null;
  avtar: string | null;
}

interface UserState extends UserData {
  token: string | null;
  isLoading: boolean;
  error: string | null;
  setProfile: (data: Partial<UserData>) => void;
  setToken: (token: string | null) => void;
  clearUser: () => void;
  clearToken: () => void;
  isAuthenticated: () => boolean;
  initializeAuth: (token: string) => Promise<void>;
}

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set, get) => ({
        name: null,
        email: null,
        token: null,
        avtar: null,
        isLoading: false,
        error: null,
        
        setProfile: (data: Partial<UserData>) => {
          set((state) => ({
            ...state,
            ...data,
            error: null // Clear errors on successful profile update
          }), false, 'setProfile');
        },
        
        setToken: (token: string | null) => {
          set((state) => ({
            ...state,
            token,
            error: null // Clear errors on token set
          }), false, 'setToken');
        },
        
        clearUser: () => {
          set({ 
            name: null, 
            email: null,
            avtar: null,
            error: null
          }, false, 'clearUser');
        },
        
        clearToken: () => {
          set({ 
            token: null,
            error: null
          }, false, 'clearToken');
        },
        
        isAuthenticated: () => {
          return !!get().token;
        },
        
        // Combined method to initialize authentication
        initializeAuth: async (token: string) => {
          if (get().isLoading) return;
          
          set({ isLoading: true, error: null }, false, 'initializeAuth/start');
          
          try {
            // Here you would typically call your API to validate the token
            // and fetch user data. For example:
            // const userData = await fetchUserProfile(token);
            
            set({
              token,
              isLoading: false,
              // name: userData.name,
              // email: userData.email,
              // profile: userData.profile
            }, false, 'initializeAuth/success');
            
          } catch (error) {
            set({
              token: null,
              isLoading: false,
              error: error instanceof Error ? error.message : 'Authentication failed'
            }, false, 'initializeAuth/error');
          }
        }
      }),
      {
        name: 'user-storage',
        storage: createJSONStorage(() => localStorage),
        version: 1,
        migrate: (persistedState: any, version: number) => {
          // Migration example when adding new fields
          if (version === 0) {
            return { 
              ...persistedState,
              isLoading: false,
              error: null
            };
          }
          return persistedState;
        },
        partialize: (state) => ({
          // Only persist these fields
          token: state.token,
          name: state.name,
          email: state.email,
          avtar: state.avtar
        })
      }
    ),
    {
      name: 'UserStore',
      enabled: process.env.NODE_ENV !== 'production',
    }
  )
);