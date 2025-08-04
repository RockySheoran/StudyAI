import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';

interface UserData {
  name: string | null;
  email: string | null;
  avatar: string | null;
}

interface UserState extends UserData {
  token: string | null;
  setProfile: (data: Partial<UserData>) => void;
  setToken: (token: string | null) => void;
  clearUser: () => void;
  clearToken: () => void;
}
 

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set, get) => ({
        name: null,
        email: null,
        token: null,
        avatar: null,
        
        
        setProfile: (data: Partial<UserData>) => {
          set((state) => ({
            ...state,
            ...data,
          }), false, 'setProfile');
        },
        
        setToken: (token: string | null) => {
          set((state) => ({
            ...state,
            token,
          }), false, 'setToken');
        },
        
        clearUser: () => {
          set({ 
            name: null, 
            email: null,
            avatar: null,
          
          }, false, 'clearUser');
        },
        
        clearToken: () => {
          set({ 
            token: null,
        
          }, false, 'clearToken');
        },
        
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
            };
          }
          return persistedState;
        },
        partialize: (state) => ({
          // Only persist these fields
          token: state.token,
          name: state.name,
          email: state.email,
          avatar: state.avatar
        })
      }
    ),
    {
      name: 'userStore',
      enabled: process.env.NODE_ENV !== 'production',
    }
  )
);