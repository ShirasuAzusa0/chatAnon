import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface IUser {
  userId: string;
  userName: string;
  email: string;
  avatar: string;
}

interface UserState {
  user: IUser | null;
  token: string | null;
  isLoggedIn: boolean;
  login: (user: IUser, token: string) => void;
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
