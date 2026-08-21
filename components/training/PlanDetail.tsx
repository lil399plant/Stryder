"use client";

import * as React from "react";
import { ArrowLeft, Check, Pencil, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Sheet } from "@/components/ui/sheet";
import { useStore } from "@/lib/store";
import { useSyncedState } from "@/lib/useSyncedState";
import { useToast } from "@/components/ui/toast";
import { makeId } from "@/lib/id";
import type { TrainingPlan, TrainingSession, TrainingStage, Caregiver } from "@/lib/types";
import { formatClock, formatDateShort } from "@/lib/time";
import { TRAINING_OUTCOME_LABEL } from "@/lib/timeline";
import { cn } from "@/lib/utils";
import { SessionForm, type SessionFormValues } from "./SessionForm";
import { StageEditor } from "./StageEditor";

export function PlanDetail({ plan, onBack }: { plan: TrainingPlan; onBack: () => void }) {
  const store = useStore();
  const { showToast } = useToast();
  const data = store.data!;
  const [name, setName] = useSyncedState(plan.name);
  const [goal, setGoal] = useSyncedState(plan.goal);
  const [why, setWhy] = useSyncedState(plan.whyItMatters);
  const [notes, setNotes] = useSyncedState(plan.freeformNotes);
  const [sessionSheet, setSessionSheet] = React.useState<"add" | TrainingSession | null>(null);
  const [editingStageId, setEditingStageId] = React.useState<string | null>(null);

  const sessions = data.trainingSessions
    .filter((s) => s.planId === plan.id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const currentStage = plan.stages[plan.currentStageIndex];
  const nextStage = plan.stages[plan.currentStageIndex + 1];
  const caregiverName = (id: Caregiver) => data.caregivers.find((c) => c.id === id)?.displayName ?? id;

  const updateStage = (stageId: string, patch: Partial<TrainingStage>) => {
    store.updateTrainingPlan(plan.id, {
      stages: plan.stages.map((s) => (s.id === stageId ? { ...s, ...patch } : s)),
    });
  };

  // Removing a stage shifts every later index down by one — currentStageIndex
  // needs the same shift so "current stage" still points at the same actual
  // stage (or, if the current stage itself was removed, at whatever now
  // occupies its old position, clamped in case it was the last one).
  const removeStage = (stageId: string) => {
    const idx = plan.stages.findIndex((s) => s.id === stageId);
    if (idx === -1) return;
    const nextStages = plan.stages.filter((s) => s.id !== stageId);
    const nextIndex =
      idx < plan.currentStageIndex
        ? plan.currentStageIndex - 1
        : Math.min(plan.currentStageIndex, Math.max(0, nextStages.length - 1));
    store.updateTrainingPlan(plan.id, { stages: nextStages, currentStageIndex: nextIndex });
    if (editingStageId === stageId) setEditingStageId(null);
  };

  const addStage = () => {
    const id = makeId();
    store.updateTrainingPlan(plan.id, { stages: [...plan.stages, { id, title: "" }] });
    setEditingStageId(id);
  };

  const handleDeletePlan = () => {
    // Archive rather than hard-delete — trainingSessions reference this
    // plan by id, and a hard delete (or an undo that re-creates it with a
    // fresh id) would orphan that history. Archived plans are just filtered
    // out of the list in app/training/page.tsx.
    store.updateTrainingPlan(plan.id, { archived: true });
    showToast("Plan deleted", () => store.updateTrainingPlan(plan.id, { archived: false }));
    onBack();
  };

  return (
    <div>
      <button
        onClick={onBack}
        className="mb-3 flex items-center gap-1.5 text-[13.5px] font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        All plans
      </button>

      <div className="flex flex-col gap-1.5">
        <Label>Plan name</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => {
            if (name !== plan.name) store.updateTrainingPlan(plan.id, { name });
          }}
          className="text-[16px] font-semibold"
        />
      </div>
      <div className="mt-3 flex flex-col gap-1.5">
        <Label>Goal</Label>
        <Textarea
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          onBlur={() => {
            if (goal !== plan.goal) store.updateTrainingPlan(plan.id, { goal });
          }}
          rows={2}
        />
      </div>
      <div className="mt-3 flex flex-col gap-1.5">
        <Label>Why it matters</Label>
        <Textarea
          value={why}
          onChange={(e) => setWhy(e.target.value)}
          onBlur={() => {
            if (why !== plan.whyItMatters) store.updateTrainingPlan(plan.id, { whyItMatters: why });
          }}
          rows={2}
        />
      </div>

      <Card className="mt-4">
        <CardContent className="p-4">
          <p className="mb-3 text-[12.5px] font-semibold uppercase tracking-wide text-muted-foreground">
            Stages — tap to set current stage
          </p>
          <div className="flex flex-col gap-1.5">
            {plan.stages.map((stage, idx) => {
              if (editingStageId === stage.id) {
                return (
                  <StageEditor
                    key={stage.id}
                    stage={stage}
                    onChange={(patch) => updateStage(stage.id, patch)}
                    onRemove={() => removeStage(stage.id)}
                    onDone={() => setEditingStageId(null)}
                  />
                );
              }
              const state =
                idx < plan.currentStageIndex ? "done" : idx === plan.currentStageIndex ? "current" : "upcoming";
              return (
                <div key={stage.id} className="flex items-center gap-1.5">
                  <button
                    onClick={() => store.updateTrainingPlan(plan.id, { currentStageIndex: idx })}
                    className={cn(
                      "flex flex-1 items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors",
                      state === "current" && "border-forest bg-forest-soft",
                      state === "done" && "border-border bg-background text-muted-foreground",
                      state === "upcoming" && "border-dashed border-border-strong"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                        state === "current" && "bg-forest text-forest-foreground",
                        state === "done" && "bg-border-strong text-foreground",
                        state === "upcoming" && "bg-transparent text-muted-foreground"
                      )}
                    >
                      {state === "done" ? <Check className="h-3.5 w-3.5" /> : idx + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "block text-[13.5px]",
                          state === "current" ? "font-semibold text-forest-soft-foreground" : "font-medium"
                        )}
                      >
                        {stage.title.trim() || "Untitled step"}
                      </span>
                      {stage.description && (
                        <span className="block text-[11.5px] font-normal text-muted-foreground">
                          {stage.description}
                        </span>
                      )}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingStageId(stage.id)}
                    aria-label="Edit step"
                    className="shrink-0 rounded-full p-1.5 text-muted-foreground hover:bg-surface-raised"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
          <button
            type="button"
            onClick={addStage}
            className="mt-2 self-start text-[13.5px] font-medium text-forest"
          >
            + Add step
          </button>
          <p className="mt-3 text-[11.5px] leading-snug text-muted-foreground">
            No fixed timeline — move a stage whenever it feels right, forward or back.
          </p>
        </CardContent>
      </Card>

      <Card className="mt-3 border-blue/20 bg-blue-soft">
        <CardContent className="flex items-start gap-2.5 p-4">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-blue-soft-foreground/70" />
          <div>
            <p className="text-[12.5px] font-semibold uppercase tracking-wide text-blue-soft-foreground/80">
              Tiny next step
            </p>
            <p className="mt-0.5 text-[13.5px] leading-snug text-blue-soft-foreground">
              {nextStage
                ? nextStage.title.trim() || "Untitled step"
                : `Keep reinforcing "${currentStage?.title ?? "the current stage"}" — no next stage queued.`}
            </p>
            {nextStage?.description && (
              <p className="mt-1 text-[12px] leading-snug text-blue-soft-foreground/80">{nextStage.description}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="mt-4">
        <p className="mb-1.5 text-[12.5px] font-semibold uppercase tracking-wide text-muted-foreground">
          Notes — what&apos;s worked
        </p>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => {
            if (notes !== plan.freeformNotes) store.updateTrainingPlan(plan.id, { freeformNotes: notes });
          }}
          rows={3}
          placeholder="Optional"
        />
      </div>

      <div className="mt-3 flex items-center justify-between rounded-xl border border-border bg-surface px-3.5 py-3">
        <div>
          <p className="text-[14px] font-medium">Reminder</p>
          <p className="text-[11.5px] text-muted-foreground">Off by default — this app doesn&apos;t send notifications.</p>
        </div>
        <Switch
          checked={plan.reminderEnabled}
          onCheckedChange={(v) => store.updateTrainingPlan(plan.id, { reminderEnabled: v })}
        />
      </div>

      <div className="mt-5 flex items-center justify-between">
        <p className="text-[12.5px] font-semibold uppercase tracking-wide text-muted-foreground">
          Session history
        </p>
        <Button size="sm" variant="secondary" className="gap-1.5" onClick={() => setSessionSheet("add")}>
          <Plus className="h-3.5 w-3.5" />
          Log session
        </Button>
      </div>

      <div className="mt-2 flex flex-col gap-2">
        {sessions.length === 0 && (
          <p className="rounded-xl border border-dashed border-border-strong px-3.5 py-6 text-center text-[13px] text-muted-foreground">
            No sessions logged yet for this plan.
          </p>
        )}
        {sessions.map((s) => (
          <button
            key={s.id}
            onClick={() => setSessionSheet(s)}
            className="rounded-xl border border-border bg-surface px-3.5 py-3 text-left"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[13px] text-muted-foreground">
                {formatDateShort(s.timestamp.slice(0, 10))} · {formatClock(s.timestamp)}
              </span>
              <Badge variant={s.outcome === "too-hard" ? "concern" : s.outcome === "easy-win" ? "forest" : "neutral"}>
                {TRAINING_OUTCOME_LABEL[s.outcome]}
              </Badge>
            </div>
            <p className="mt-1 text-[14px] font-medium">{s.skillLabel}</p>
            <p className="text-[12.5px] text-muted-foreground">
              {s.durationMinutes} min · {caregiverName(s.caregiver)} · {s.setting}
            </p>
            {s.notes && <p className="mt-1 text-[13px] text-muted-foreground">{s.notes}</p>}
            {s.repeatNextTime && (
              <p className="mt-1 text-[11.5px] font-medium text-forest">Repeat this next time</p>
            )}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={handleDeletePlan}
        className="mt-5 block w-full pb-1 text-center text-[13px] font-medium text-concern"
      >
        Delete plan
      </button>

      {sessionSheet && (
        <Sheet
          open
          onOpenChange={(o) => !o && setSessionSheet(null)}
          title={sessionSheet === "add" ? "Log a session" : "Edit session"}
        >
          <SessionForm
            initial={
              sessionSheet === "add"
                ? {
                    timestamp: new Date().toISOString(),
                    planId: plan.id,
                    skillLabel: currentStage ? `${plan.name} — ${currentStage.title}` : plan.name,
                    durationMinutes: 10,
                    caregiver: data.handoff.onDuty,
                    setting: "Studio apartment",
                    reward: "",
                    outcome: "neutral",
                    notes: "",
                    repeatNextTime: false,
                  }
                : sessionSheet
            }
            caregivers={data.caregivers}
            submitLabel={sessionSheet === "add" ? "Log session" : "Save"}
            onSubmit={(values: SessionFormValues) => {
              if (sessionSheet === "add") {
                store.addTrainingSession(values);
                showToast("Session logged");
              } else {
                store.updateTrainingSession(sessionSheet.id, values);
                showToast("Session updated");
              }
              setSessionSheet(null);
            }}
            onCancel={() => setSessionSheet(null)}
            onDelete={
              sessionSheet !== "add"
                ? () => {
                    store.deleteTrainingSession(sessionSheet.id);
                    showToast("Session deleted");
                    setSessionSheet(null);
                  }
                : undefined
            }
          />
        </Sheet>
      )}
    </div>
  );
}
