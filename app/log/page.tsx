"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Droplets, UtensilsCrossed, Moon, Footprints, StickyNote } from "lucide-react";
import { useStore } from "@/lib/store";
import { Tabs } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import type { TimelineItem } from "@/lib/timeline";
import { caregiverName as caregiverNameFor } from "@/lib/rules";
import type { Caregiver } from "@/lib/types";
import { addDays, isToday } from "@/lib/time";
import { getWeekStart, weekRangeLabel, monthLabel, dayLabel } from "@/lib/calendar-grid";
import { DayView } from "@/components/calendar/DayView";
import { WeekView } from "@/components/calendar/WeekView";
import { MonthView } from "@/components/calendar/MonthView";
import { EntryEditSheet } from "@/components/log/EntryEditSheet";
import { AddEntrySheet, type AddEntryKind } from "@/components/log/AddEntrySheet";
import { KIND_STYLES } from "@/components/log/timelineVisual";

const VIEW_TABS = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
] as const;

type ViewMode = (typeof VIEW_TABS)[number]["value"];

const ADD_BUTTONS: { kind: Exclude<AddEntryKind, null>; label: string; icon: typeof Droplets }[] = [
  { kind: "potty", label: "Bathroom", icon: Droplets },
  { kind: "meal", label: "Meal", icon: UtensilsCrossed },
  { kind: "nap", label: "Nap", icon: Moon },
  { kind: "outing", label: "Outing", icon: Footprints },
  { kind: "incident", label: "Note", icon: StickyNote },
];

const LEGEND = [
  { label: "Bathroom", dot: KIND_STYLES.potty.dot },
  { label: "Meal", dot: KIND_STYLES.meal.dot },
  { label: "Nap", dot: KIND_STYLES.nap.dot },
  { label: "Outing", dot: KIND_STYLES.outing.dot },
  { label: "Notes / training", dot: KIND_STYLES.incident.dot },
];

export default function LogPage() {
  const { data } = useStore();
  const [viewMode, setViewMode] = React.useState<ViewMode>("day");
  const [anchorDate, setAnchorDate] = React.useState(new Date());
  const [editingItem, setEditingItem] = React.useState<TimelineItem | null>(null);
  const [addingKind, setAddingKind] = React.useState<AddEntryKind>(null);
  const [now] = React.useState(new Date());

  if (!data) return null;

  const caregiverName = (id: Caregiver) => caregiverNameFor(data, id);

  const goPrev = () => {
    if (viewMode === "day") setAnchorDate((d) => addDays(d, -1));
    else if (viewMode === "week") setAnchorDate((d) => addDays(d, -7));
    else setAnchorDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  };
  const goNext = () => {
    if (viewMode === "day") setAnchorDate((d) => addDays(d, 1));
    else if (viewMode === "week") setAnchorDate((d) => addDays(d, 7));
    else setAnchorDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  };
  const goToday = () => setAnchorDate(new Date());

  const rangeLabel =
    viewMode === "day" ? dayLabel(anchorDate) : viewMode === "week" ? weekRangeLabel(anchorDate) : monthLabel(anchorDate);

  const showTodayButton =
    viewMode === "month"
      ? anchorDate.getFullYear() !== now.getFullYear() || anchorDate.getMonth() !== now.getMonth()
      : viewMode === "week"
      ? getWeekStart(anchorDate).getTime() !== getWeekStart(now).getTime()
      : !isToday(anchorDate);

  return (
    <div>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-semibold leading-tight">Log</h1>
          <p className="text-[13px] text-muted-foreground">
            Calendar view — naps and outings span time, everything else is a point in time.
          </p>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        {ADD_BUTTONS.map(({ kind, label, icon: Icon }) => (
          <button
            key={kind}
            onClick={() => setAddingKind(kind)}
            className="flex items-center gap-1.5 rounded-full border border-border-strong bg-surface-raised px-3 py-1.5 text-[12.5px] font-medium hover:bg-tan-soft/30"
          >
            <Icon className="h-3.5 w-3.5" />+ {label}
          </button>
        ))}
      </div>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)} tabs={[...VIEW_TABS]} />
        <div className="flex items-center gap-1.5">
          {showTodayButton && (
            <Button variant="ghost" size="sm" onClick={goToday}>
              Today
            </Button>
          )}
          <Button variant="outline" size="icon" onClick={goPrev} aria-label="Previous">
            <ChevronLeft className="h-4.5 w-4.5" />
          </Button>
          <Button variant="outline" size="icon" onClick={goNext} aria-label="Next">
            <ChevronRight className="h-4.5 w-4.5" />
          </Button>
        </div>
      </div>

      <p className="mb-3 text-[14px] font-medium">{rangeLabel}</p>

      {viewMode === "day" && (
        <DayView date={anchorDate} data={data} caregiverName={caregiverName} onSelect={setEditingItem} now={now} />
      )}
      {viewMode === "week" && (
        <WeekView
          anchorDate={anchorDate}
          data={data}
          caregiverName={caregiverName}
          onSelect={setEditingItem}
          now={now}
          onSelectDay={(d) => {
            setAnchorDate(d);
            setViewMode("day");
          }}
        />
      )}
      {viewMode === "month" && (
        <MonthView
          anchorDate={anchorDate}
          data={data}
          caregiverName={caregiverName}
          onSelect={setEditingItem}
          onSelectDay={(d) => {
            setAnchorDate(d);
            setViewMode("day");
          }}
        />
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
        {LEGEND.map((l) => (
          <span key={l.label} className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
            <span className={`h-2 w-2 rounded-full ${l.dot}`} />
            {l.label}
          </span>
        ))}
      </div>
      <p className="mt-1.5 text-[11px] text-muted-foreground">
        Hover an event to preview it (tap on mobile) — click to open and edit.
      </p>

      <EntryEditSheet item={editingItem} onClose={() => setEditingItem(null)} />
      <AddEntrySheet kind={addingKind} onClose={() => setAddingKind(null)} />
    </div>
  );
}
