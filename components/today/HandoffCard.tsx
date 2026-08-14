"use client";

import * as React from "react";
import { ArrowRightLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChoiceChips } from "@/components/ui/choice-chips";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { useSyncedState } from "@/lib/useSyncedState";
import type { AppData } from "@/lib/types";
import { formatClock } from "@/lib/time";
import { lastPottyOfType, lastMeal, getActiveNap, lastCompletedNap, caregiverName as caregiverNameFor } from "@/lib/rules";
import { POTTY_TYPE_LABEL, SEVERITY_LABEL } from "@/lib/timeline";
import { useDeviceCaregiver } from "@/lib/device-identity";
import { notifyOtherCaregiver } from "@/lib/push-notify";

export function HandoffCard({ data }: { data: AppData }) {
  const { setHandoff } = useStore();
  const [note, setNote] = useSyncedState(data.handoff.note);
  const deviceCaregiver = useDeviceCaregiver();

  const lastPotty = lastPottyOfType(data, ["pee", "poop"]);
  const meal = lastMeal(data);
  const activeNap = getActiveNap(data);
  const completedNap = lastCompletedNap(data);
  const openConcern = [...data.incidentEvents]
    .filter((i) => i.severity !== "note" || i.discussWithVet)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

  return (
    <Card className="mb-4">
      <CardHeader className="flex-row items-center justify-between gap-2 pb-3">
        <div className="flex items-center gap-2">
          <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
          <CardTitle>Handoff</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-0">
        <div>
          <p className="mb-1.5 text-[12.5px] font-medium text-muted-foreground">I&apos;m on Stryder</p>
          <ChoiceChips
            options={data.caregivers.map((c) => ({ value: c.id, label: c.displayName }))}
            value={data.handoff.onDuty}
            onChange={(v) => setHandoff({ onDuty: v as AppData["handoff"]["onDuty"] })}
          />
        </div>

        <div>
          <p className="mb-1.5 text-[12.5px] font-medium text-muted-foreground">Handoff note</p>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onBlur={() => {
              if (note !== data.handoff.note) {
                setHandoff({ note });
                if (note.trim()) {
                  const who = deviceCaregiver ? caregiverNameFor(data, deviceCaregiver) : null;
                  notifyOtherCaregiver(
                    deviceCaregiver,
                    "Handoff note updated",
                    who ? `${who}: ${note.trim()}` : note.trim(),
                    "/today"
                  );
                }
              }
            }}
            rows={2}
            placeholder="Anything the next caregiver should know…"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-xl bg-background px-3 py-2.5 text-[12.5px]">
          <div>
            <p className="text-muted-foreground">Last potty</p>
            <p className="font-medium">
              {lastPotty ? `${POTTY_TYPE_LABEL[lastPotty.type]} · ${formatClock(lastPotty.timestamp)}` : "—"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Last food</p>
            <p className="font-medium">{meal ? formatClock(meal.timestamp) : "—"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Last nap</p>
            <p className="font-medium">
              {activeNap
                ? `In progress since ${formatClock(activeNap.startTime)}`
                : completedNap
                ? `${formatClock(completedNap.startTime)}–${formatClock(completedNap.endTime as string)}`
                : "—"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Current concern</p>
            {openConcern ? (
              <Badge variant={openConcern.severity === "needs-follow-up" ? "concern" : "tan"}>
                {SEVERITY_LABEL[openConcern.severity]}
              </Badge>
            ) : (
              <p className="font-medium">None noted</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
