"use client";

import { Bell } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import { useSyncedState } from "@/lib/useSyncedState";
import type { ScheduledMealTimes } from "@/lib/types";

const SLOTS: { key: keyof ScheduledMealTimes; label: string }[] = [
  { key: "breakfast", label: "Breakfast" },
  { key: "lunch", label: "Lunch" },
  { key: "dinner", label: "Dinner" },
];

export function ScheduledMealsForm() {
  const { data, updateScheduledMeals } = useStore();
  const [local, setLocal] = useSyncedState<ScheduledMealTimes | null>(data?.scheduledMeals ?? null);

  if (!local) return null;

  const setTime = (key: keyof ScheduledMealTimes, value: string) => {
    setLocal((v) => (v ? { ...v, [key]: value || undefined } : v));
    updateScheduledMeals({ [key]: value || undefined } as Partial<ScheduledMealTimes>);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2.5 rounded-xl border border-border bg-surface px-3.5 py-3 text-muted-foreground">
        <Bell className="h-4 w-4 shrink-0" />
        <p className="text-[12.5px]">
          Whoever&apos;s on duty gets a push notification 10 minutes before each time set below — needs push
          notifications enabled first (More &gt; Push notifications). Leave a slot blank for no reminder.
        </p>
      </div>

      {SLOTS.map((slot) => (
        <div key={slot.key} className="flex flex-col gap-1.5">
          <Label>{slot.label}</Label>
          <Input type="time" value={local[slot.key] ?? ""} onChange={(e) => setTime(slot.key, e.target.value)} />
        </div>
      ))}
    </div>
  );
}
