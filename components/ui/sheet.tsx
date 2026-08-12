"use client";

import * as React from "react";
import { X, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** When provided, shows a trash icon in the header — always visible, no
   * scrolling through the form required. Deletion itself isn't confirmed
   * here; callers are expected to make it undoable (toast + Undo), per
   * this app's "undo, not confirmation dialogs" convention. */
  onDelete?: () => void;
  deleteLabel?: string;
}

function Sheet({ open, onOpenChange, title, description, children, footer, onDelete, deleteLabel }: SheetProps) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-black/35 backdrop-blur-[1px] animate-[fadeIn_150ms_ease-out]"
        onClick={() => onOpenChange(false)}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "relative z-10 flex max-h-[88vh] w-full flex-col overflow-hidden rounded-t-3xl border border-border bg-surface shadow-xl sm:max-w-md sm:rounded-3xl",
          "animate-[slideUp_200ms_ease-out]"
        )}
      >
        <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <h2 className="text-[16px] font-semibold leading-tight">{title}</h2>
            {description && <p className="mt-0.5 text-[13px] text-muted-foreground">{description}</p>}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {onDelete && (
              <button
                onClick={onDelete}
                aria-label={deleteLabel ?? "Delete"}
                className="flex h-9 w-9 items-center justify-center rounded-full text-concern hover:bg-concern-soft"
              >
                <Trash2 className="h-[18px] w-[18px]" />
              </button>
            )}
            <button
              onClick={() => onOpenChange(false)}
              aria-label="Close"
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-surface-raised"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <div className="safe-bottom border-t border-border px-5 py-3">{footer}</div>
        )}
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(24px); opacity: 0.6 } to { transform: translateY(0); opacity: 1 } }
      `}</style>
    </div>
  );
}

export { Sheet };
