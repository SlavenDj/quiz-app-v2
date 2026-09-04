import { isDemo, mockApi } from "./demo";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export async function api(path: string, init: RequestInit = {}) {
  if (isDemo) return mockApi(path, init);
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init.headers ?? {}) },
    ...init,
  });
  if (res.status === 401 && !path.startsWith("/api/auth/")) {
    await fetch(`${API_URL}/api/auth/refresh`, { method: "POST", credentials: "include" }).catch(() => {});
    const retry = await fetch(`${API_URL}${path}`, {
      credentials: "include",
      headers: { "Content-Type": "application/json", ...(init.headers ?? {}) },
      ...init,
    });
    if (!retry.ok) throw new Error((await retry.json().catch(() => ({}))).message ?? "Request failed");
    return retry.json();
  }
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message ?? "Request failed");
  return res.json();
}
