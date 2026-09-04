import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { useAuthStore } from "../../stores/auth";

export interface ProfileUser {
  id: number;
  email: string;
  role: string;
  firstName?: string | null;
  lastName?: string | null;
  country?: string | null;
  city?: string | null;
  bio?: string | null;
  nickname?: string | null;
  username?: string | null;
  avatarFile?: string | null;
  notifyNewQuiz?: boolean;
}

export interface UpdateMeInput {
  firstName?: string;
  lastName?: string;
  country?: string;
  city?: string;
  bio?: string;
  nickname?: string;
  username?: string;
  notifyNewQuiz?: boolean;
}

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

function syncUserCache(qc: ReturnType<typeof useQueryClient>, setUser: (u: never) => void, user: ProfileUser) {
  qc.setQueryData(["me"], user);
  setUser(user as never);
}

export function useUpdateMe() {
  const qc = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: (body: UpdateMeInput) =>
      api("/api/me", { method: "PATCH", body: JSON.stringify(body) }) as Promise<{ user: ProfileUser }>,
    onSuccess: (data) => syncUserCache(qc, setUser, data.user),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (body: { currentPassword: string; newPassword: string }) =>
      api("/api/me/password", { method: "PUT", body: JSON.stringify(body) }) as Promise<{ ok: boolean }>,
  });
}

export function useUploadAvatar() {
  const qc = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append("image", file);
      const res = await fetch(`${API_URL}/api/me/avatar`, {
        method: "POST",
        credentials: "include",
        body: form,
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message ?? "Request failed");
      return res.json() as Promise<{ user: ProfileUser }>;
    },
    onSuccess: (data) => syncUserCache(qc, setUser, data.user),
  });
}

export function useDeleteAvatar() {
  const qc = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: () => api("/api/me/avatar", { method: "DELETE" }) as Promise<{ user: ProfileUser }>,
    onSuccess: (data) => syncUserCache(qc, setUser, data.user),
  });
}
