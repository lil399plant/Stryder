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

  const onDuty = data.handoff.onDuty;

  const handlePee = () => {
    const id = store.addPotty({
      timestamp: new Date().toISOString(),
      type: "pee",
      location: "usual-spot",
      outdoorTripType: "direct-potty-trip",
      success: "went-promptly",
      tags: [],
      caregiver: onDuty,
    });
    showToast("Pee logged", () => store.deletePotty(id));
  };

  const handlePoop = () => {
    const id = store.addPotty({
      timestamp: new Date().toISOString(),
      type: "poop",
      location: "usual-spot",
      outdoorTripType: "direct-potty-trip",
      success: "went-promptly",
      poopQuality: "normal",
      tags: [],
      caregiver: onDuty,
    });
    showToast("Poop logged", () => store.deletePotty(id));
  };

  const handleMeal = () => {
    const id = store.addMeal({
      timestamp: new Date().toISOString(),
      mealType: pickMealType(new Date().getHours()),
      foodName: data.health.currentFood || "Puppy kibble",
      amount: "Usual amount",
      appetite: "finished",
      addOns: [],
      newFood: false,
      usedForCrateTraining: false,
      usedAsPottyReward: false,
      caregiver: onDuty,
    });
    showToast("Meal logged", () => store.deleteMeal(id));
  };

  const handleNapStart = () => {
    const id = store.startNap({
      startTime: new Date().toISOString(),
      location: "kitchen",
      settling: "fell-asleep-independently",
      caregiver: onDuty,
    });
    showToast("Nap started", () => store.deleteNap(id));
  };

  const handleNapEnd = () => {
    if (!activeNap) return;
    store.endNap(activeNap.id);
    showToast("Nap ended", () => store.updateNap(activeNap.id, { endTime: undefined }));
  };

  const handleDownstairsStart = () => {
    const id = store.startDownstairs({
      startTime: new Date().toISOString(),
      outdoorTripType: "walk-first",
      caregiver: onDuty,
    });
    showToast("Downstairs trip started", () => store.deleteDownstairsTrip(id));
  };

  const handleDownstairsEnd = () => {
    if (!activeDownstairs) return;
    store.endDownstairs(activeDownstairs.id);
    showToast("Downstairs trip ended", () => store.updateDownstairsTrip(activeDownstairs.id, { endTime: undefined }));
  };

  const handleEventStart = () => {
    const id = store.startEvent({
      startTime: new Date().toISOString(),
      category: "other",
      caregiver: onDuty,
    });
    showToast("Event started", () => store.deleteEvent(id));
  };

  const handleEventEnd = () => {
    if (!activeEvent) return;
    store.endEvent(activeEvent.id);
    showToast("Event ended", () => store.updateEvent(activeEvent.id, { endTime: undefined }));
  };

  const handleAccident = () => {
    const id = store.addPotty({
      timestamp: new Date().toISOString(),
      type: "accident",
      location: "inside-pad",
      success: "accident",
      tags: [],
      caregiver: onDuty,
    });
    showToast("Accident logged", () => store.deletePotty(id));
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
            onPee={handlePee}
            onPoop={handlePoop}
            onMeal={handleMeal}
            onNapStart={handleNapStart}
            onNapEnd={handleNapEnd}
            onDownstairsStart={handleDownstairsStart}
            onDownstairsEnd={handleDownstairsEnd}
            onEventStart={handleEventStart}
            onEventEnd={handleEventEnd}
            onAccident={handleAccident}
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
    </div>
  );
}
