"use client";

import { Droplets, UtensilsCrossed, Moon, Sun, Sunset, User } from "lucide-react";
import type { AppData } from "@/lib/types";
import { formatDurationSince } from "@/lib/time";
import { lastPottyOfType, lastMeal, computeCurrentState, onDutyCaregiverName } from "@/lib/rules";
import { cn } from "@/lib/utils";

const STATE_META: Record<string, { label: string; icon: typeof Sun }> = {
  napping: { label: "Napping", icon: Moon },
  settling: { label: "Settling", icon: Sunset },
  overnight: { label: "Overnight", icon: Moon },
  awake: { label: "Awake", icon: Sun },
};

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <div className="flex min-w-[7.5rem] flex-1 flex-col gap-1.5 rounded-2xl border border-border bg-surface px-3.5 py-3">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-[11.5px] font-medium uppercase tracking-wide">{label}</span>
      </div>
      <span className="text-[15px] font-semibold leading-none">{value}</span>
    </div>
  );
}

export function StatusStrip({ data, now }: { data: AppData; now: Date }) {
  const lastPee = lastPottyOfType(data, ["pee"]);
  const lastPoop = lastPottyOfType(data, ["poop"]);
  const meal = lastMeal(data);
  const state = computeCurrentState(data, now);
  const stateMeta = STATE_META[state];
  const StateIcon = stateMeta.icon;
  const onDuty = onDutyCaregiverName(data);

  return (
    <div className="mb-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
      <StatCard
        icon={<Droplets className="h-3.5 w-3.5" />}
        label="Last pee"
        value={lastPee ? formatDurationSince(lastPee.timestamp, now) : "No data yet"}
      />
      <StatCard
        icon={<Droplets className="h-3.5 w-3.5" />}
        label="Last poop"
        value={lastPoop ? formatDurationSince(lastPoop.timestamp, now) : "No data yet"}
      />
      <StatCard
        icon={<UtensilsCrossed className="h-3.5 w-3.5" />}
        label="Last meal"
        value={meal ? formatDurationSince(meal.timestamp, now) : "No data yet"}
      />
      <div
        className={cn(
          "flex min-w-[7.5rem] flex-1 flex-col gap-1.5 rounded-2xl border border-border px-3.5 py-3",
          "bg-forest-soft"
        )}
      >
        <div className="flex items-center gap-1.5 text-forest-soft-foreground/80">
          <StateIcon className="h-3.5 w-3.5" />
          <span className="text-[11.5px] font-medium uppercase tracking-wide">Right now</span>
        </div>
        <span className="text-[15px] font-semibold leading-none text-forest-soft-foreground">
          {stateMeta.label}
        </span>
        <div className="mt-0.5 flex items-center gap-1 text-[11.5px] text-forest-soft-foreground/80">
          <User className="h-3 w-3" />
          {onDuty} on Stryder
        </div>
      </div>
    </div>
  );
}
