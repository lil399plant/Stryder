"use client";

import { EyeOff } from "lucide-react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  bathroomTimingPoints,
  averageGapBetweenPee,
  averageGapBetweenPoop,
  napDurationHistogram,
  daysSinceLastAccident,
  trainingSessionsPerDay,
  correlationCards,
} from "@/lib/analytics";
import { BathroomTimingCard } from "@/components/analytics/BathroomTimingCard";
import {
  PottyGapCard,
  NapCard,
  DaysWithoutAccidentCard,
  TrainingOverTimeCard,
  CorrelationCards,
} from "@/components/analytics/OtherCards";

export default function AnalyticsPage() {
  const { data, updateSettings } = useStore();
  if (!data) return null;

  if (data.settings.hideAnalytics) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border-strong px-6 py-16 text-center">
        <EyeOff className="h-6 w-6 text-muted-foreground/60" />
        <p className="text-[14px] font-medium">Analytics are hidden</p>
        <p className="max-w-xs text-[13px] text-muted-foreground">
          You turned these off in Settings for a calmer view. You can bring them back any time.
        </p>
        <Button variant="secondary" onClick={() => updateSettings({ hideAnalytics: false })}>
          Show analytics
        </Button>
      </div>
    );
  }

  const now = new Date();

  return (
    <div className="flex flex-col gap-3">
      <div className="mb-1">
        <h1 className="text-[22px] font-semibold leading-tight">Patterns</h1>
        <p className="text-[13px] text-muted-foreground">
          Gentle observations from what&apos;s been logged — never medical advice, never a verdict.
        </p>
      </div>

      <BathroomTimingCard points={bathroomTimingPoints(data)} />
      <PottyGapCard pee={averageGapBetweenPee(data)} poop={averageGapBetweenPoop(data)} />
      <NapCard stats={napDurationHistogram(data)} />
      <DaysWithoutAccidentCard days={daysSinceLastAccident(data, now)} />
      <TrainingOverTimeCard data={trainingSessionsPerDay(data, 14, now)} />
      <CorrelationCards cards={correlationCards(data)} />
    </div>
  );
}
