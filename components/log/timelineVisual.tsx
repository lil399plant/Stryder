import {
  Droplets,
  UtensilsCrossed,
  Moon,
  Footprints,
  Sparkles,
  StickyNote,
  Target,
  AlertTriangle,
} from "lucide-react";
import { formatClock } from "@/lib/time";
import type { TimelineItem } from "@/lib/timeline";
import {
  POTTY_TYPE_LABEL,
  POTTY_LOCATION_LABEL,
  SUCCESS_LABEL,
  MEAL_TYPE_LABEL,
  APPETITE_LABEL,
  NAP_LOCATION_LABEL,
  OUTDOOR_TRIP_LABEL,
  SPECIAL_EVENT_CATEGORY_LABEL,
  INCIDENT_CATEGORY_LABEL,
  SEVERITY_LABEL,
  TRAINING_OUTCOME_LABEL,
} from "@/lib/timeline";

/** Shared rendering rules for a logged entry — used by both the vertical
 * timeline (Today / Log list) and the calendar day/week/month views, so an
 * entry looks and reads the same everywhere it appears. */

export const KIND_STYLES: Record<TimelineItem["kind"], { bg: string; fg: string; dot: string }> = {
  potty: { bg: "bg-blue-soft", fg: "text-blue-soft-foreground", dot: "bg-blue" },
  meal: { bg: "bg-tan-soft", fg: "text-tan-soft-foreground", dot: "bg-tan" },
  nap: { bg: "bg-forest-soft", fg: "text-forest-soft-foreground", dot: "bg-forest" },
  downstairs: { bg: "bg-blue-soft", fg: "text-blue-soft-foreground", dot: "bg-blue" },
  event: { bg: "bg-tan-soft", fg: "text-tan-soft-foreground", dot: "bg-tan" },
  incident: { bg: "bg-surface-raised", fg: "text-muted-foreground", dot: "bg-muted-foreground" },
  training: { bg: "bg-surface-raised", fg: "text-muted-foreground", dot: "bg-muted-foreground" },
};

export function IconFor({ item, className }: { item: TimelineItem; className?: string }) {
  const cls = className ?? "h-4.5 w-4.5";
  switch (item.kind) {
    case "potty":
      return <Droplets className={cls} />;
    case "meal":
      return <UtensilsCrossed className={cls} />;
    case "nap":
      return <Moon className={cls} />;
    case "downstairs":
      return <Footprints className={cls} />;
    case "event":
      return <Sparkles className={cls} />;
    case "training":
      return <Target className={cls} />;
    case "incident":
      return item.data.severity === "needs-follow-up" ? (
        <AlertTriangle className={cls} />
      ) : (
        <StickyNote className={cls} />
      );
  }
}

export function titleFor(item: TimelineItem): string {
  switch (item.kind) {
    case "potty":
      return POTTY_TYPE_LABEL[item.data.type];
    case "meal":
      return MEAL_TYPE_LABEL[item.data.mealType];
    case "nap":
      return item.data.endTime ? "Nap" : "Nap (in progress)";
    case "downstairs":
      return item.data.outdoorTripType ? OUTDOOR_TRIP_LABEL[item.data.outdoorTripType] : "Downstairs";
    case "event":
      return item.data.title?.trim() || SPECIAL_EVENT_CATEGORY_LABEL[item.data.category];
    case "incident":
      return INCIDENT_CATEGORY_LABEL[item.data.category];
    case "training":
      return item.data.skillLabel;
  }
}

export function subtitleFor(item: TimelineItem): string {
  switch (item.kind) {
    case "potty":
      return `${POTTY_LOCATION_LABEL[item.data.location]} · ${SUCCESS_LABEL[item.data.success]}`;
    case "meal":
      return `${item.data.foodName || "—"} · ${APPETITE_LABEL[item.data.appetite]}`;
    case "nap": {
      const loc = NAP_LOCATION_LABEL[item.data.location];
      if (!item.data.endTime) return `${loc} · started ${formatClock(item.data.startTime)}`;
      return `${loc} · ${formatClock(item.data.startTime)}–${formatClock(item.data.endTime)}`;
    }
    case "downstairs": {
      if (!item.data.endTime) return `Started ${formatClock(item.data.startTime)}`;
      return `${formatClock(item.data.startTime)}–${formatClock(item.data.endTime)}`;
    }
    case "event": {
      const cat = SPECIAL_EVENT_CATEGORY_LABEL[item.data.category];
      if (!item.data.endTime) return `${cat} · started ${formatClock(item.data.startTime)}`;
      return `${cat} · ${formatClock(item.data.startTime)}–${formatClock(item.data.endTime)}`;
    }
    case "incident":
      return SEVERITY_LABEL[item.data.severity] + (item.data.discussWithVet ? " · flagged for vet" : "");
    case "training":
      return `${item.data.durationMinutes} min · ${TRAINING_OUTCOME_LABEL[item.data.outcome]}`;
  }
}

export function isDurationItem(item: TimelineItem): boolean {
  return item.kind === "nap" || item.kind === "downstairs" || item.kind === "event";
}

/** End of an item's span for calendar layout — duration items use their
 * real (or "still going") end; point items are treated as a short blip. */
export function endTimeFor(item: TimelineItem, now: Date): Date {
  if (item.kind === "nap" || item.kind === "downstairs" || item.kind === "event") {
    return item.data.endTime ? new Date(item.data.endTime) : now;
  }
  return new Date(item.time);
}
