"use client";

import * as React from "react";
import { formatClock } from "@/lib/time";
import type { ImportExtraction } from "@/lib/import-text";
import {
  POTTY_TYPE_LABEL,
  POTTY_LOCATION_LABEL,
  SUCCESS_LABEL,
  MEAL_TYPE_LABEL,
  APPETITE_LABEL,
  NAP_LOCATION_LABEL,
  SPECIAL_EVENT_CATEGORY_LABEL,
  INCIDENT_CATEGORY_LABEL,
  SEVERITY_LABEL,
} from "@/lib/timeline";

// Shared review-before-import list — one-line-per-entry preview grouped by
// type, used by both the More > Data "Import from text" sheet and the AI
// Triage import suggestion, so both flows show a caregiver exactly the same
// thing before anything is written to the shared log.

export function ImportPreviewList({
  extraction,
  caregiverName,
}: {
  extraction: ImportExtraction;
  caregiverName: (id: string) => string;
}) {
  return (
    <div className="flex flex-col gap-4">
      <EntryGroup title="Bathroom">
        {extraction.pottyEvents.map((e, i) => (
          <EntryRow
            key={`p${i}`}
            time={formatClock(e.timestamp)}
            caregiver={caregiverName(e.caregiver)}
            summary={`${POTTY_TYPE_LABEL[e.type]} · ${POTTY_LOCATION_LABEL[e.location]} · ${SUCCESS_LABEL[e.success]}`}
          />
        ))}
      </EntryGroup>
      <EntryGroup title="Meals">
        {extraction.mealEvents.map((e, i) => (
          <EntryRow
            key={`m${i}`}
            time={formatClock(e.timestamp)}
            caregiver={caregiverName(e.caregiver)}
            summary={`${MEAL_TYPE_LABEL[e.mealType]}${e.foodName ? " · " + e.foodName : ""} · ${APPETITE_LABEL[e.appetite]}`}
          />
        ))}
      </EntryGroup>
      <EntryGroup title="Naps">
        {extraction.napEvents.map((e, i) => (
          <EntryRow
            key={`n${i}`}
            time={formatClock(e.startTime)}
            caregiver={caregiverName(e.caregiver)}
            summary={e.location ? `Nap · ${NAP_LOCATION_LABEL[e.location]}` : "Nap"}
          />
        ))}
      </EntryGroup>
      <EntryGroup title="Downstairs trips">
        {extraction.downstairsTrips.map((e, i) => (
          <EntryRow key={`d${i}`} time={formatClock(e.startTime)} caregiver={caregiverName(e.caregiver)} summary="Downstairs trip" />
        ))}
      </EntryGroup>
      <EntryGroup title="Events">
        {extraction.events.map((e, i) => (
          <EntryRow
            key={`e${i}`}
            time={formatClock(e.startTime)}
            caregiver={caregiverName(e.caregiver)}
            summary={`${SPECIAL_EVENT_CATEGORY_LABEL[e.category]}${e.title ? " · " + e.title : ""}`}
          />
        ))}
      </EntryGroup>
      <EntryGroup title="Incidents">
        {extraction.incidentEvents.map((e, i) => (
          <EntryRow
            key={`i${i}`}
            time={formatClock(e.timestamp)}
            caregiver={caregiverName(e.caregiver)}
            summary={`${INCIDENT_CATEGORY_LABEL[e.category]} · ${SEVERITY_LABEL[e.severity]}`}
          />
        ))}
      </EntryGroup>
    </div>
  );
}

function EntryGroup({ title, children }: { title: string; children: React.ReactNode }) {
  const items = React.Children.toArray(children).filter(Boolean);
  if (items.length === 0) return null;
  return (
    <div>
      <p className="mb-1.5 text-[11.5px] font-semibold uppercase tracking-wide text-muted-foreground/70">
        {title} · {items.length}
      </p>
      <div className="flex flex-col gap-1.5">{children}</div>
    </div>
  );
}

function EntryRow({ time, caregiver, summary }: { time: string; caregiver: string; summary: string }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-border bg-surface-raised px-3 py-2.5">
      <div>
        <p className="text-[13.5px] leading-snug text-foreground">{summary}</p>
        <p className="text-[12px] text-muted-foreground">
          {time} · {caregiver}
        </p>
      </div>
    </div>
  );
}
