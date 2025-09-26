import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  userId: string;
  userName: string;
  email: string;
  avatar: string;
}

interface UserState {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoggedIn: false,
      login: (user, token) => set({ user, token, isLoggedIn: true }),
      logout: () => set({ user: null, token: null, isLoggedIn: false }),
    }),
    {
      name: 'user-storage',
    }
  )
);
