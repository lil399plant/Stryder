"use client";

import * as React from "react";
import { Check } from "lucide-react";

interface ToastState {
  id: number;
  message: string;
  onUndo?: () => void;
}

interface ToastContextValue {
  showToast: (message: string, onUndo?: () => void) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = React.useState<ToastState | null>(null);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = React.useCallback((message: string, onUndo?: () => void) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const id = Date.now();
    setToast({ id, message, onUndo });
    timerRef.current = setTimeout(() => {
      setToast((t) => (t?.id === id ? null : t));
    }, 5000);
  }, []);

  const dismiss = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast(null);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex justify-center px-4 sm:bottom-6">
          <div className="pointer-events-auto flex items-center gap-3 rounded-full bg-foreground px-4 py-2.5 text-background shadow-lg animate-[riseIn_180ms_ease-out]">
            <Check className="h-4 w-4 shrink-0" />
            <span className="text-[13.5px] font-medium">{toast.message}</span>
            {toast.onUndo && (
              <button
                onClick={() => {
                  toast.onUndo?.();
                  dismiss();
                }}
                className="text-[13.5px] font-semibold text-tan underline underline-offset-2"
              >
                Undo
              </button>
            )}
          </div>
        </div>
      )}
      <style>{`
        @keyframes riseIn { from { transform: translateY(8px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
