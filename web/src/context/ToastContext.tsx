import { createContext, useCallback, useContext, useRef, useState } from 'react';
import type { ReactNode } from 'react';

interface ToastContextValue {
  message: string | null;
  notify: (msg: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const timeoutRef = useRef<number | undefined>(undefined);

  const notify = useCallback((msg: string) => {
    window.clearTimeout(timeoutRef.current);
    setMessage(msg);
    timeoutRef.current = window.setTimeout(() => setMessage(null), 2800);
  }, []);

  return <ToastContext.Provider value={{ message, notify }}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
