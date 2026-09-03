import { createContext, useCallback, useContext, useRef, useState } from "react";
import type { ReactNode } from "react";

interface Toast {
  id: number;
  msg: string;
}

interface ToastContextValue {
  notify: (msg: string) => void;
}

const ToastContext = createContext<ToastContextValue>({ notify: () => {} });

export function useToast(): ToastContextValue {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const notify = useCallback((msg: string) => {
    idRef.current += 1;
    const id = idRef.current;
    setToasts((prev) => [...prev, { id, msg }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div key={t.id} className="rounded bg-gray-900 px-4 py-2 text-sm text-white shadow-lg">
            {t.msg}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
