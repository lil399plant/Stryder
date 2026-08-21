"use client";

import * as React from "react";
import Link from "next/link";
import { BookOpenText, Plus } from "lucide-react";
import { useStore } from "@/lib/store";
import { makeId } from "@/lib/id";
import { Button } from "@/components/ui/button";
import { PlanCard } from "@/components/training/PlanCard";
import { PlanDetail } from "@/components/training/PlanDetail";

export default function TrainingPage() {
  const store = useStore();
  const { data } = store;
  const [selectedPlanId, setSelectedPlanId] = React.useState<string | null>(null);

  if (!data) return null;

  const plans = data.trainingPlans.filter((p) => !p.archived);
  const selectedPlan = plans.find((p) => p.id === selectedPlanId) ?? null;

  if (selectedPlan) {
    return <PlanDetail plan={selectedPlan} onBack={() => setSelectedPlanId(null)} />;
  }

  const handleNewPlan = () => {
    const id = store.addTrainingPlan({
      name: "New plan",
      goal: "",
      whyItMatters: "",
      stages: [{ id: makeId(), title: "Step 1" }],
      currentStageIndex: 0,
      freeformNotes: "",
      reminderEnabled: false,
    });
    setSelectedPlanId(id);
  };

  return (
    <div>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-semibold leading-tight">Training</h1>
          <p className="text-[13px] text-muted-foreground">
            Small, no-pressure steps. Progress at Stryder&apos;s pace, not a schedule.
          </p>
        </div>
        <Button size="sm" variant="secondary" className="shrink-0 gap-1.5" onClick={handleNewPlan}>
          <Plus className="h-3.5 w-3.5" />
          New plan
        </Button>
      </div>

      <Link
        href="/training/cues"
        className="mb-4 flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3.5 hover:bg-tan-soft/15"
      >
        <BookOpenText className="h-4.5 w-4.5 text-muted-foreground" />
        <div className="flex-1">
          <p className="text-[14px] font-medium">Training consistency &amp; cue dictionary</p>
          <p className="text-[12px] text-muted-foreground">Shared cues so Me and Ribo stay in sync</p>
        </div>
      </Link>

      {plans.map((plan) => {
        const sessions = data.trainingSessions.filter((s) => s.planId === plan.id);
        const lastSession = [...sessions].sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )[0];
        return (
          <PlanCard
            key={plan.id}
            plan={plan}
            sessionCount={sessions.length}
            lastSession={lastSession}
            onClick={() => setSelectedPlanId(plan.id)}
          />
        );
      })}
    </div>
  );
}
