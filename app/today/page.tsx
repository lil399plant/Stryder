"use client";

import * as React from "react";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import { addDays, isToday as checkIsToday } from "@/lib/time";
import { getTimelineForDay, type TimelineItem } from "@/lib/timeline";
import {
  computeNudges,
  getActiveNap,
  getActiveDownstairs,
  getActiveEvent,
  caregiverName as caregiverNameFor,
} from "@/lib/rules";
import { DateHeader } from "@/components/today/DateHeader";
import { StatusStrip } from "@/components/today/StatusStrip";
import { QuickLogButtons } from "@/components/today/QuickLogButtons";
import { NextNeedsCard } from "@/components/today/NextNeedsCard";
import { HandoffCard } from "@/components/today/HandoffCard";
import { PlanBlocks } from "@/components/today/PlanBlocks";
import { TimelineList } from "@/components/log/TimelineList";
import { EntryEditSheet } from "@/components/log/EntryEditSheet";
import { AddEntrySheet, type AddEntryKind, type AddEntryOverride } from "@/components/log/AddEntrySheet";
import type { Caregiver } from "@/lib/types";

function pickMealType(hour: number): "breakfast" | "lunch" | "dinner" | "treat" {
  if (hour < 11) return "breakfast";
  if (hour < 15) return "lunch";
  if (hour < 20) return "dinner";
  return "treat";
}

export default function TodayPage() {
  const store = useStore();
  const { data } = store;
  const { showToast } = useToast();
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [now, setNow] = React.useState(new Date());
  const [editingItem, setEditingItem] = React.useState<TimelineItem | null>(null);
  const [addingKind, setAddingKind] = React.useState<AddEntryKind>(null);
  const [addingOverride, setAddingOverride] = React.useState<AddEntryOverride | undefined>(undefined);

  React.useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  if (!data) return null;

  const showingToday = checkIsToday(selectedDate);
  const items = getTimelineForDay(data, selectedDate);
  const activeNap = getActiveNap(data);
  const activeDownstairs = getActiveDownstairs(data);
  const activeEvent = getActiveEvent(data);
  const nudges = showingToday ? computeNudges(data, now) : [];
  const caregiverName = (id: Caregiver) => caregiverNameFor(data, id);

  // Each quick-log tap opens the full entry form (pre-filled with sensible
  // defaults) instead of logging silently at "now" — lets you confirm or
  // adjust the time and details before anything is actually saved.
  const openPotty = (type: "pee" | "poop" | "accident") => {
    setAddingKind("potty");
    setAddingOverride(
      type === "accident"
        ? { type, location: "inside-pad", success: "accident" }
        : { type, poopQuality: type === "poop" ? "normal" : undefined }
    );
  };

  const openMeal = () => {
    setAddingKind("meal");
    setAddingOverride({ mealType: pickMealType(new Date().getHours()), amount: "Usual amount" });
  };

  const openNapStart = () => {
    setAddingKind("nap");
    setAddingOverride(undefined);
  };

  const handleNapEnd = () => {
    if (!activeNap) return;
    store.endNap(activeNap.id);
    showToast("Nap ended", () => store.updateNap(activeNap.id, { endTime: undefined }));
  };

  const openDownstairsStart = () => {
    setAddingKind("downstairs");
    setAddingOverride(undefined);
  };

  const handleDownstairsEnd = () => {
    if (!activeDownstairs) return;
    store.endDownstairs(activeDownstairs.id);
    showToast("Downstairs trip ended", () => store.updateDownstairsTrip(activeDownstairs.id, { endTime: undefined }));
  };

  const openEventStart = () => {
    setAddingKind("event");
    setAddingOverride(undefined);
  };

  const handleEventEnd = () => {
    if (!activeEvent) return;
    store.endEvent(activeEvent.id);
    showToast("Event ended", () => store.updateEvent(activeEvent.id, { endTime: undefined }));
  };

  return (
    <div>
      <DateHeader
        date={selectedDate}
        onPrev={() => setSelectedDate((d) => addDays(d, -1))}
        onNext={() => setSelectedDate((d) => addDays(d, 1))}
        onToday={() => setSelectedDate(new Date())}
      />

      {showingToday && (
        <>
          <StatusStrip data={data} now={now} />
          <QuickLogButtons
            onPee={() => openPotty("pee")}
            onPoop={() => openPotty("poop")}
            onMeal={openMeal}
            onNapStart={openNapStart}
            onNapEnd={handleNapEnd}
            onDownstairsStart={openDownstairsStart}
            onDownstairsEnd={handleDownstairsEnd}
            onEventStart={openEventStart}
            onEventEnd={handleEventEnd}
            onAccident={() => openPotty("accident")}
            activeNap={activeNap}
            activeDownstairs={activeDownstairs}
            activeEvent={activeEvent}
            now={now}
          />
          <NextNeedsCard nudges={nudges} now={now} />
        </>
      )}

      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">
          {showingToday ? "Today's timeline" : "Timeline"}
        </h2>
        <span className="text-[12px] text-muted-foreground">{items.length} entries</span>
      </div>
      <TimelineList
        items={items}
        caregiverName={caregiverName}
        onSelect={setEditingItem}
        emptyLabel={
          showingToday
            ? "Nothing logged yet today — quick-log buttons above take one tap."
            : "Nothing was logged this day."
        }
      />

      {showingToday && (
        <>
          <div className="mt-2" />
          <HandoffCard data={data} />
          <PlanBlocks blocks={data.schedule} />
        </>
      )}

      <EntryEditSheet item={editingItem} onClose={() => setEditingItem(null)} />
      <AddEntrySheet
        kind={addingKind}
        onClose={() => setAddingKind(null)}
        initialOverride={addingOverride}
      />
    </div>
  );
}
