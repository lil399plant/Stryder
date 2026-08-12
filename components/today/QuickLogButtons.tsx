"use client";

import { Droplets, Waves, UtensilsCrossed, Moon, Footprints, Sparkles, TriangleAlert, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DownstairsEvent, NapEvent, SpecialEvent } from "@/lib/types";
import { formatDurationSince } from "@/lib/time";
import { SPECIAL_EVENT_CATEGORY_LABEL } from "@/lib/timeline";

interface ActiveCardProps {
  label: string;
  detail: string;
  onEnd: () => void;
}

function ActiveCard({ label, detail, onEnd }: ActiveCardProps) {
  return (
    <div className="mb-2.5 flex items-center justify-between rounded-2xl border border-forest/30 bg-forest-soft px-4 py-3">
      <div>
        <p className="text-[13px] font-medium text-forest-soft-foreground">{label}</p>
        <p className="text-[12px] text-forest-soft-foreground/75">{detail}</p>
      </div>
      <Button size="sm" onClick={onEnd} className="gap-1.5">
        <Square className="h-3.5 w-3.5 fill-current" />
        End
      </Button>
    </div>
  );
}

interface QuickLogButtonsProps {
  onPee: () => void;
  onPoop: () => void;
  onMeal: () => void;
  onNapStart: () => void;
  onNapEnd: () => void;
  onDownstairsStart: () => void;
  onDownstairsEnd: () => void;
  onEventStart: () => void;
  onEventEnd: () => void;
  onAccident: () => void;
  activeNap: NapEvent | null;
  activeDownstairs: DownstairsEvent | null;
  activeEvent: SpecialEvent | null;
  now: Date;
}

export function QuickLogButtons({
  onPee,
  onPoop,
  onMeal,
  onNapStart,
  onNapEnd,
  onDownstairsStart,
  onDownstairsEnd,
  onEventStart,
  onEventEnd,
  onAccident,
  activeNap,
  activeDownstairs,
  activeEvent,
  now,
}: QuickLogButtonsProps) {
  return (
    <div className="mb-4">
      {activeNap && (
        <ActiveCard
          label={activeNap.location ? `Napping in ${activeNap.location.replace(/-/g, " ")}` : "Napping"}
          detail={`Started ${formatDurationSince(activeNap.startTime, now)}`}
          onEnd={onNapEnd}
        />
      )}
      {activeDownstairs && (
        <ActiveCard
          label="Downstairs"
          detail={`Started ${formatDurationSince(activeDownstairs.startTime, now)}`}
          onEnd={onDownstairsEnd}
        />
      )}
      {activeEvent && (
        <ActiveCard
          label={SPECIAL_EVENT_CATEGORY_LABEL[activeEvent.category]}
          detail={`Started ${formatDurationSince(activeEvent.startTime, now)}`}
          onEnd={onEventEnd}
        />
      )}

      <div className="grid grid-cols-3 gap-2.5">
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
        <Button
          variant="secondary"
          size="tap"
          onClick={onDownstairsStart}
          disabled={!!activeDownstairs}
          className="rounded-2xl"
        >
          <Footprints className="h-6 w-6" />
          Downstairs
        </Button>
        <Button
          variant="secondary"
          size="tap"
          onClick={onEventStart}
          disabled={!!activeEvent}
          className="rounded-2xl"
        >
          <Sparkles className="h-6 w-6" />
          Event
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
