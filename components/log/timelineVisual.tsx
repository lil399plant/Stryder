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
import { cn } from "@/lib/utils";
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

/** Point-in-time entries that get a distinctive emoji instead of the
 * generic kind icon/color-dot, everywhere IconFor or a calendar dot
 * renders them (Today/Log timeline, Month chips, Week/Day markers). Only
 * the specific sub-types below are overridden — meal treat/enrichment
 * keep the default look. */
export function emojiFor(item: TimelineItem): string | null {
  if (item.kind === "potty") {
    if (item.data.type === "pee") return "🍋";
    if (item.data.type === "poop") return "💩";
    if (item.data.type === "both") return "🍋💩";
    if (item.data.type === "accident") return "❌";
    return null;
  }
  if (item.kind === "meal") {
    const t = item.data.mealType;
    if (t === "breakfast" || t === "lunch" || t === "dinner") return "🍗";
    return null;
  }
  return null;
}

/** True for multi-character emoji (currently just the pee+poop combo) —
 * these render smaller so both glyphs still fit the same icon slot a
 * single emoji would occupy. */
export function isEmojiCombo(emoji: string): boolean {
  return [...emoji].length > 1;
}

/** "New behavior observed" notes are deliberately kept off the calendar's
 * dot/chip system entirely — see DayNoteBadge — rather than shown as a
 * normal point marker. */
export function isDayNoteItem(item: TimelineItem): boolean {
  return item.kind === "incident" && item.data.category === "new-behavior";
}

// Maps the icon-box size classes actually used across call sites to a
// roughly matching emoji font size. Checked in order so "h-3.5" is caught
// before the shorter "h-3" (which is otherwise a substring of it).
const EMOJI_SIZE_BY_ICON_CLASS: [needle: string, textClass: string][] = [
  ["h-2.5", "text-[11px]"],
  ["h-3.5", "text-[14px]"],
  ["h-4.5", "text-[18px]"],
  ["h-3", "text-[13px]"],
];

// Roughly 60% of the single-emoji size — two glyphs at this size occupy
// about the same footprint as one at full size.
const COMBO_EMOJI_SIZE_BY_ICON_CLASS: [needle: string, textClass: string][] = [
  ["h-2.5", "text-[7px]"],
  ["h-3.5", "text-[8px]"],
  ["h-4.5", "text-[11px]"],
  ["h-3", "text-[8px]"],
];

function emojiSizeClass(className: string, combo: boolean): string {
  const table = combo ? COMBO_EMOJI_SIZE_BY_ICON_CLASS : EMOJI_SIZE_BY_ICON_CLASS;
  for (const [needle, cls] of table) {
    if (className.includes(needle)) return cls;
  }
  return combo ? "text-[9px]" : "text-[15px]";
}

export function IconFor({ item, className }: { item: TimelineItem; className?: string }) {
  const cls = className ?? "h-4.5 w-4.5";
  const emoji = emojiFor(item);
  if (emoji) {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center leading-none",
          cls,
          emojiSizeClass(cls, isEmojiCombo(emoji))
        )}
      >
        {emoji}
      </span>
    );
  }
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
    case "potty": {
      if (item.data.type === "accident") {
        const parts = [item.data.accidentWhere, item.data.accidentReason].filter(Boolean);
        return parts.length ? parts.join(" · ") : "No details yet";
      }
      return `${POTTY_LOCATION_LABEL[item.data.location]} · ${SUCCESS_LABEL[item.data.success]}`;
    }
    case "meal":
      return `${item.data.foodName || "—"} · ${APPETITE_LABEL[item.data.appetite]}`;
    case "nap": {
      const loc = item.data.location ? NAP_LOCATION_LABEL[item.data.location] : null;
      const range = !item.data.endTime
        ? `started ${formatClock(item.data.startTime)}`
        : `${formatClock(item.data.startTime)}–${formatClock(item.data.endTime)}`;
      return loc ? `${loc} · ${range}` : range;
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
