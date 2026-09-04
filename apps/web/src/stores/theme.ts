import { create } from "zustand";

export type ThemeMode = "light" | "dark" | "auto";

const KEY = "v2-theme";

function loadMode(): ThemeMode {
  try {
    const v = localStorage.getItem(KEY);
    if (v === "light" || v === "dark" || v === "auto") return v;
  } catch {
    /* private mode — fall through to auto */
  }
  return "auto";
}

export function systemPrefersDark(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function resolveDark(mode: ThemeMode): boolean {
  return mode === "dark" || (mode === "auto" && systemPrefersDark());
}

export function applyMode(mode: ThemeMode) {
  const dark = resolveDark(mode);
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
}

interface ThemeState {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: typeof window === "undefined" ? "auto" : loadMode(),
  setMode: (mode) => {
    try {
      localStorage.setItem(KEY, mode);
    } catch {
      /* ignore */
    }
    applyMode(mode);
    set({ mode });
  },
}));

// Apply on load + follow OS changes while in "auto".
if (typeof window !== "undefined") {
  applyMode(loadMode());
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    try {
      if ((localStorage.getItem(KEY) ?? "auto") === "auto") applyMode("auto");
    } catch {
      applyMode("auto");
    }
  });
}
