"use client";

import { Sheet } from "@/components/ui/sheet";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import type { Caregiver } from "@/lib/types";
import { BathroomForm, type BathroomFormValues } from "./BathroomForm";
import { MealForm, type MealFormValues } from "./MealForm";
import { NapForm, type NapFormValues } from "./NapForm";
import { DownstairsForm, type DownstairsFormValues } from "./DownstairsForm";
import { makeDefaultPottyMoment } from "./PottyMomentFields";
import { EventForm, type EventFormValues } from "./EventForm";
import { IncidentForm, type IncidentFormValues } from "./IncidentForm";

export type AddEntryKind = "potty" | "meal" | "nap" | "downstairs" | "event" | "incident" | null;

/** Lets a caller (e.g. Today's quick-log buttons) seed the form with
 * something other than this sheet's own defaults — e.g. pre-selecting
 * "poop" as the potty type, or today's time-appropriate meal type —
 * without needing a whole separate form-opening path of its own. A union
 * (not an intersection) because field names collide with incompatible
 * types across forms — e.g. "location" means a potty spot in one and a
 * nap spot in another — so the caller's object is only ever shaped like
 * whichever one form matches the `kind` it's paired with. */
export type AddEntryOverride =
  | Partial<BathroomFormValues>
  | Partial<MealFormValues>
  | Partial<NapFormValues>
  | Partial<DownstairsFormValues>
  | Partial<EventFormValues>
  | Partial<IncidentFormValues>;

interface AddEntrySheetProps {
  kind: AddEntryKind;
  onClose: () => void;
  initialOverride?: AddEntryOverride;
  /** "event" kind only — swaps the sheet's copy for the "Schedule event"
   * entry point (see app/log/page.tsx). Same underlying SpecialEvent either
   * way; a future-dated one gets a 2h-before reminder pushed to both
   * caregivers regardless of which button was used to create it (see
   * app/api/push/cron-nudges/route.ts) — this is purely about which words
   * the sheet shows. */
  eventMode?: "log" | "schedule";
}

export function AddEntrySheet({ kind, onClose, initialOverride, eventMode = "log" }: AddEntrySheetProps) {
  const store = useStore();
  const { showToast } = useToast();
  const data = store.data;
  if (!kind || !data) return null;

  const caregivers = data.caregivers;
  const onDuty: Caregiver = data.handoff.onDuty;
  const nowIso = new Date().toISOString();

  return (
    <>
      {kind === "potty" && (
        <Sheet open onOpenChange={(o) => !o && onClose()} title="Log bathroom trip">
          <BathroomForm
            initial={{
              timestamp: nowIso,
              type: "pee",
              location: "usual-spot",
              outdoorTripType: "direct-potty-trip",
              success: "went-promptly",
              tags: [],
              caregiver: onDuty,
              ...(initialOverride as Partial<BathroomFormValues>),
            }}
            caregivers={caregivers}
            submitLabel="Log entry"
            onSubmit={(values: BathroomFormValues) => {
              store.addPotty(values);
              showToast("Bathroom entry logged");
              onClose();
            }}
            onCancel={onClose}
          />
        </Sheet>
      )}
      {kind === "meal" && (
        <Sheet open onOpenChange={(o) => !o && onClose()} title="Log a meal">
          <MealForm
            initial={{
              timestamp: nowIso,
              mealType: "breakfast",
              foodName: data.health.currentFood || "Puppy kibble",
              amount: "",
              appetite: "finished",
              addOns: [],
              newFood: false,
              usedForCrateTraining: false,
              usedAsPottyReward: false,
              caregiver: onDuty,
              ...(initialOverride as Partial<MealFormValues>),
            }}
            caregivers={caregivers}
            submitLabel="Log meal"
            onSubmit={(values: MealFormValues) => {
              store.addMeal(values);
              showToast("Meal logged");
              onClose();
            }}
            onCancel={onClose}
          />
        </Sheet>
      )}
      {kind === "nap" && (
        <Sheet open onOpenChange={(o) => !o && onClose()} title="Log a nap">
          <NapForm
            initial={{
              startTime: nowIso,
              endTime: undefined,
              location: "kitchen",
              settling: "fell-asleep-independently",
              caregiver: onDuty,
              ...(initialOverride as Partial<NapFormValues>),
            }}
            caregivers={caregivers}
            submitLabel="Log nap"
            onSubmit={(values: NapFormValues) => {
              store.addNap(values);
              showToast("Nap logged");
              onClose();
            }}
            onCancel={onClose}
          />
        </Sheet>
      )}
      {kind === "downstairs" && (
        <Sheet open onOpenChange={(o) => !o && onClose()} title="Log a downstairs trip">
          <DownstairsForm
            initial={{
              startTime: nowIso,
              endTime: undefined,
              outdoorTripType: "walk-first",
              pottyMoments: [makeDefaultPottyMoment()],
              notes: "",
              caregiver: onDuty,
              ...(initialOverride as Partial<DownstairsFormValues>),
            }}
            caregivers={caregivers}
            submitLabel="Log trip"
            onSubmit={(values: DownstairsFormValues) => {
              store.addDownstairsTrip(values);
              showToast("Downstairs trip logged");
              onClose();
            }}
            onCancel={onClose}
          />
        </Sheet>
      )}
      {kind === "event" && (
        <Sheet
          open
          onOpenChange={(o) => !o && onClose()}
          title={eventMode === "schedule" ? "Schedule an event" : "Log an event"}
          description={
            eventMode === "schedule"
              ? "Both caregivers get a push notification 2 hours before it starts."
              : undefined
          }
        >
          <EventForm
            initial={{
              startTime: nowIso,
              endTime: undefined,
              category: "other",
              title: "",
              notes: "",
              caregiver: onDuty,
              ...(initialOverride as Partial<EventFormValues>),
            }}
            caregivers={caregivers}
            submitLabel={eventMode === "schedule" ? "Schedule event" : "Log event"}
            onSubmit={(values: EventFormValues) => {
              store.addEvent(values);
              showToast(eventMode === "schedule" ? "Event scheduled" : "Event logged");
              onClose();
            }}
            onCancel={onClose}
          />
        </Sheet>
      )}
      {kind === "incident" && (
        <Sheet open onOpenChange={(o) => !o && onClose()} title="Add a note">
          <IncidentForm
            initial={{
              timestamp: nowIso,
              category: "new-behavior",
              severity: "note",
              note: "",
              discussWithVet: false,
              caregiver: onDuty,
              ...(initialOverride as Partial<IncidentFormValues>),
            }}
            caregivers={caregivers}
            submitLabel="Save note"
            onSubmit={(values: IncidentFormValues) => {
              store.addIncident(values);
              showToast("Note saved");
              onClose();
            }}
            onCancel={onClose}
          />
        </Sheet>
      )}
    </>
  );
}
