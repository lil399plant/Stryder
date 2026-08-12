"use client";

import { X, Lightbulb } from "lucide-react";
import type { Nudge } from "@/lib/rules";
import { dayScopedId } from "@/lib/rules";
import { useStore } from "@/lib/store";

export function NextNeedsCard({ nudges, now }: { nudges: Nudge[]; now: Date }) {
  const { dismissNudge } = useStore();

  if (nudges.length === 0) return null;

  return (
    <div className="mb-4 flex flex-col gap-2">
      {nudges.map((n) => (
        <div
          key={n.id}
          className="flex items-start gap-2.5 rounded-2xl border border-blue/20 bg-blue-soft px-3.5 py-3"
        >
          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-blue-soft-foreground/70" />
          <div className="flex-1">
            <p className="text-[13.5px] font-medium leading-snug text-blue-soft-foreground">{n.text}</p>
            <p className="mt-0.5 text-[11.5px] text-blue-soft-foreground/70">{n.basis}</p>
          </div>
          <button
            onClick={() => dismissNudge(dayScopedId(n.id, now))}
            aria-label="Dismiss"
            className="rounded-full p-1 text-blue-soft-foreground/60 hover:bg-black/5"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
