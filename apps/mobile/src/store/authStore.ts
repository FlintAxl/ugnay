import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { User } from "../types/auth";
import { api } from "../config/api";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setAuth: (user: User, token: string) => Promise<void>;
  setUser: (user: User) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,

  setAuth: async (user: User, token: string) => {
    try {
      await SecureStore.setItemAsync("ugnay_access_token", token);
    } catch (e) {
      // SecureStore fallback
    }
    set({ user, token, isLoading: false });
  },

  setUser: (user: User) => {
    set({ user });
  },

  logout: async () => {
    try {
      await SecureStore.deleteItemAsync("ugnay_access_token");
    } catch (e) {
      // ignore
    }
    set({ user: null, token: null, isLoading: false });
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const token = await SecureStore.getItemAsync("ugnay_access_token");
      if (!token) {
        set({ user: null, token: null, isLoading: false });
        return;
      }
      const response = await api.get<User>("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ user: response.data, token, isLoading: false });
    } catch (error) {
      // Token invalid or expired
      try {
        await SecureStore.deleteItemAsync("ugnay_access_token");
      } catch (e) {}
      set({ user: null, token: null, isLoading: false });
    }
  },
}));

