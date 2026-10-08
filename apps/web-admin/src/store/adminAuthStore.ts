import { create } from "zustand";
import type { User } from "../types";
import { api } from "../api/client";

interface AdminAuthState {
  admin: User | null;
  token: string | null;
  isLoading: boolean;
  setAuth: (admin: User, token: string) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAdminAuthStore = create<AdminAuthState>((set) => ({
  admin: null,
  token: localStorage.getItem("ugnay_admin_token"),
  isLoading: true,

  setAuth: (admin: User, token: string) => {
    localStorage.setItem("ugnay_admin_token", token);
    set({ admin, token, isLoading: false });
  },

  logout: () => {
    localStorage.removeItem("ugnay_admin_token");
    set({ admin: null, token: null, isLoading: false });
  },

  checkAuth: async () => {
    const token = localStorage.getItem("ugnay_admin_token");
    if (!token) {
      set({ admin: null, token: null, isLoading: false });
      return;
    }

    try {
      const response = await api.get<User>("/auth/me");
      if (response.data.role !== "admin") {
        // Not an admin! Log out
        localStorage.removeItem("ugnay_admin_token");
        set({ admin: null, token: null, isLoading: false });
        return;
      }
      set({ admin: response.data, token, isLoading: false });
    } catch {
      localStorage.removeItem("ugnay_admin_token");
      set({ admin: null, token: null, isLoading: false });
    }
  },
}));
