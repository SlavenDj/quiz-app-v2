import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { useAuthStore } from "../../stores/auth";

export function useMe() {
  const setUser = useAuthStore((s) => s.setUser);
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const data = await api("/api/me");
      setUser(data.user);
      return data.user;
    },
    retry: false,
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (body: { firstName: string; lastName: string; email: string; password: string; country: string; city: string }) =>
      api("/api/auth/register", { method: "POST", body: JSON.stringify(body) }),
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: (body: { userId: number; code: string }) =>
      api("/api/auth/verify-email", { method: "POST", body: JSON.stringify(body) }),
  });
}

export function useLogin() {
  const setUser = useAuthStore((s) => s.setUser);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { email: string; password: string }) =>
      api("/api/auth/login", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: (data) => {
      setUser(data.user);
      qc.setQueryData(["me"], data.user);
    },
  });
}

export function useLogout() {
  const setUser = useAuthStore((s) => s.setUser);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api("/api/auth/logout", { method: "POST" }),
    onSuccess: () => {
      setUser(null);
      qc.clear();
    },
  });
}
