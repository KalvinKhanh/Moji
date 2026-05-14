import { create } from "zustand";
import axios from "axios";

interface AuthUser {
  id: string;
  username: string;
  email: string;
  firstname: string;
  lastname: string;
}

interface AuthStore {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  signUp: (
    username: string,
    password: string,
    email: string,
    firstname: string,
    lastname: string,
  ) => Promise<void>;
  signIn: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  signUp: async (username, password, email, firstname, lastname) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/auth/signup`, {
        username,
        password,
        email,
        firstname,
        lastname,
      });
      set({ user: response.data.user, isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Đăng ký thất bại";
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  signIn: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/auth/signin`, {
        username,
        password,
      });
      set({ user: response.data.user, isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Đăng nhập thất bại";
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  logout: () => {
    set({ user: null, error: null });
  },
}));
