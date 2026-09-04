import { useEffect, useState } from "react";

function formatCountdown(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

/** Ticking "HH:MM:SS" countdown to `target`. Returns null when target is missing, invalid, or in the past. */
export function useCountdown(target: string | Date | null): string | null {
  const key = target instanceof Date ? target.toISOString() : target;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (key == null) return;
    const ms = new Date(key).getTime();
    if (Number.isNaN(ms) || ms - Date.now() <= 0) return;
    const id = setInterval(() => {
      if (new Date(key).getTime() - Date.now() <= 0) clearInterval(id);
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(id);
  }, [key]);

  if (key == null) return null;
  const ms = new Date(key).getTime();
  if (Number.isNaN(ms)) return null;
  const diff = ms - now;
  if (diff <= 0) return null;
  return formatCountdown(diff);
}
