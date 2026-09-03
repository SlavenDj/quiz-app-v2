import type { Response } from "express";

const isProd = process.env.NODE_ENV === "production";

export function setAuthCookies(res: Response, access: string, refresh: string) {
  const base = { httpOnly: true, secure: isProd, sameSite: (isProd ? "none" : "lax") as const, path: "/" };
  res.cookie("accessToken", access, { ...base, maxAge: 15 * 60 * 1000 });
  res.cookie("refreshToken", refresh, { ...base, maxAge: 7 * 24 * 3600 * 1000 });
}

export function clearAuthCookies(res: Response) {
  res.clearCookie("accessToken", { path: "/" });
  res.clearCookie("refreshToken", { path: "/" });
}
