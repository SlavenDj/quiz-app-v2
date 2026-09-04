import { isDemo } from "./demo";

/** Avatar image source. In demo mode avatars are generated initial-based
 *  SVG data URIs (fully offline); otherwise the backend uploads URL. */
export function avatarSrc(avatarFile: string | null | undefined, fallbackSeed: string): string | null {
  if (!avatarFile) return null;
  if (isDemo) {
    const initial = (fallbackSeed.trim().charAt(0) || "?").toUpperCase();
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" rx="48" fill="#E9D5FF"/><text x="48" y="62" font-size="42" text-anchor="middle" fill="#835B92" font-family="sans-serif">${initial}</text></svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  }
  const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
  return `${API_URL}/uploads/${avatarFile}`;
}
