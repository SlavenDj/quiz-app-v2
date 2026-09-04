/** Shared service helpers: portable logic only (no DB-vendor specifics). */

export const GRACE_SEC = 30;

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function normalizeText(s: string) {
  return s.toLowerCase().trim().replace(/\s+/g, " ");
}

export function imageUrl(file: string | null) {
  if (!file) return null;
  return `${process.env.API_PUBLIC_URL ?? "http://localhost:3000"}/uploads/${file}`;
}

export function httpError(status: number, message: string) {
  const err: any = new Error(message);
  err.status = status;
  return err;
}
