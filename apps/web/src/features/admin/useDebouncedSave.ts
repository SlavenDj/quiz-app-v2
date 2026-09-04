import { useEffect, useRef, useState } from "react";

export function useDebouncedSave(delayMs = 800) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef<(() => Promise<unknown>) | null>(null);
  const [saved, setSaved] = useState(true);
  const [saveError, setSaveError] = useState<string | null>(null);
  const save = (fn: () => Promise<unknown>) => {
    pending.current = fn;
    setSaved(false);
    setSaveError(null);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const toRun = pending.current;
      pending.current = null;
      timer.current = null;
      if (!toRun) return;
      try {
        await toRun();
        setSaved(true);
      } catch {
        setSaveError("Greska pri snimanju");
      }
    }, delayMs);
  };
  useEffect(() => () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    if (pending.current) {
      const toRun = pending.current;
      pending.current = null;
      toRun()
        .then(() => setSaved(true))
        .catch(() => setSaveError("Greska pri snimanju"));
    }
  }, []);
  return { save, saved, saveError };
}
