import type { Response } from "express";

const isProd = process.env.NODE_ENV === "production";
// Set COOKIE_DOMAIN=.plusultra.ba in prod so app.* + backend.* subdomains share auth.
const domain = process.env.COOKIE_DOMAIN || undefined;

export function setAuthCookies(res: Response, access: string, refresh: string) {
  const base = { httpOnly: true, secure: isProd, sameSite: (isProd ? "none" : "lax") as "none" | "lax", path: "/", ...(domain ? { domain } : {}) };
  res.cookie("accessToken", access, { ...base, maxAge: 15 * 60 * 1000 });
  res.cookie("refreshToken", refresh, { ...base, maxAge: 7 * 24 * 3600 * 1000 });
}

export function clearAuthCookies(res: Response) {
  const opts = { path: "/", ...(domain ? { domain } : {}) };
  res.clearCookie("accessToken", opts);
  res.clearCookie("refreshToken", opts);
}
