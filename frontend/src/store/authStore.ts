import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import localStorageAdapter from './localStorageAdapter.ts';

interface AuthState {
  user: { id: string; email: string; name?: string; role: string } | null;
  setUser: (user: {
    id: string;
    email: string;
    name?: string;
    role: string;
  }) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    {
      name: 'auth-storage',
      storage: localStorageAdapter<AuthState>(),
    },
  ),
);
