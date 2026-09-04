import { create } from "zustand";

interface User {
  id: number;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  setUser: (u: User | null) => void;
}

function loadUser(): User | null {
  try {
    return JSON.parse(localStorage.getItem("v2-user") ?? "null");
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: loadUser(),
  setUser: (user) => {
    if (user) localStorage.setItem("v2-user", JSON.stringify(user));
    else localStorage.removeItem("v2-user");
    set({ user });
  },
}));
