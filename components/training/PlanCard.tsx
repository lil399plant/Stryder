"use client";

import { ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TrainingPlan, TrainingSession } from "@/lib/types";

interface PlanCardProps {
  plan: TrainingPlan;
  sessionCount: number;
  lastSession?: TrainingSession;
  onClick: () => void;
}

export function PlanCard({ plan, sessionCount, lastSession, onClick }: PlanCardProps) {
  const currentStage = plan.stages[plan.currentStageIndex];
  const nextStage = plan.stages[plan.currentStageIndex + 1];

  return (
    <Card
      className="mb-2.5 cursor-pointer transition-colors hover:bg-tan-soft/15 active:scale-[0.99]"
      onClick={onClick}
    >
      <CardContent className="flex items-center gap-3 p-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-[15px] font-semibold leading-tight">{plan.name}</p>
            {sessionCount === 0 && (
              <Badge variant="tan" className="shrink-0">
                Not started
              </Badge>
            )}
          </div>
          <p className="mt-1 text-[12.5px] text-muted-foreground">
            Stage {plan.currentStageIndex + 1} of {plan.stages.length}
            {currentStage ? ` · ${currentStage.title}` : ""}
          </p>
          {nextStage && (
            <p className="mt-1 text-[12.5px] text-forest-soft-foreground">
              Next: {nextStage.title}
            </p>
          )}
          {lastSession && (
            <p className="mt-1 text-[11.5px] text-muted-foreground/80">
              Last session {new Date(lastSession.timestamp).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </p>
          )}
        </div>
        <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground/50" />
      </CardContent>
    </Card>
  );
}
