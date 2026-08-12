"use client";

import { Droplets, Waves, UtensilsCrossed, Moon, TriangleAlert, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { NapEvent } from "@/lib/types";
import { formatDurationSince } from "@/lib/time";

interface QuickLogButtonsProps {
  onPee: () => void;
  onPoop: () => void;
  onMeal: () => void;
  onNapStart: () => void;
  onNapEnd: () => void;
  onAccident: () => void;
  activeNap: NapEvent | null;
  now: Date;
}

export function QuickLogButtons({
  onPee,
  onPoop,
  onMeal,
  onNapStart,
  onNapEnd,
  onAccident,
  activeNap,
  now,
}: QuickLogButtonsProps) {
  return (
    <div className="mb-4">
      {activeNap && (
        <div className="mb-2.5 flex items-center justify-between rounded-2xl border border-forest/30 bg-forest-soft px-4 py-3">
          <div>
            <p className="text-[13px] font-medium text-forest-soft-foreground">
              Napping in {activeNap.location.replace(/-/g, " ")}
            </p>
            <p className="text-[12px] text-forest-soft-foreground/75">
              Started {formatDurationSince(activeNap.startTime, now)}
            </p>
          </div>
          <Button size="sm" onClick={onNapEnd} className="gap-1.5">
            <Square className="h-3.5 w-3.5 fill-current" />
            End nap
          </Button>
        </div>
      )}

      <div className="grid grid-cols-4 gap-2.5">
        <Button variant="secondary" size="tap" onClick={onPee} className="rounded-2xl">
          <Droplets className="h-6 w-6" />
          Pee
        </Button>
        <Button variant="secondary" size="tap" onClick={onPoop} className="rounded-2xl">
          <Waves className="h-6 w-6" />
          Poop
        </Button>
        <Button variant="secondary" size="tap" onClick={onMeal} className="rounded-2xl">
          <UtensilsCrossed className="h-6 w-6" />
          Meal
        </Button>
        <Button
          variant="secondary"
          size="tap"
          onClick={onNapStart}
          disabled={!!activeNap}
          className="rounded-2xl"
        >
          <Moon className="h-6 w-6" />
          Nap
        </Button>
      </div>

      <button
        type="button"
        onClick={onAccident}
        className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-xl border border-border-strong bg-transparent py-2.5 text-[13px] font-medium text-muted-foreground hover:bg-surface-raised"
      >
        <TriangleAlert className="h-3.5 w-3.5" />
        Log an accident
      </button>
    </div>
  );
}
