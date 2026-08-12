"use client";

import { Sheet } from "@/components/ui/sheet";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import type { Caregiver } from "@/lib/types";
import { BathroomForm, type BathroomFormValues } from "./BathroomForm";
import { MealForm, type MealFormValues } from "./MealForm";
import { NapForm, type NapFormValues } from "./NapForm";
import { OutingForm, type OutingFormValues } from "./OutingForm";
import { IncidentForm, type IncidentFormValues } from "./IncidentForm";

export type AddEntryKind = "potty" | "meal" | "nap" | "outing" | "incident" | null;

interface AddEntrySheetProps {
  kind: AddEntryKind;
  onClose: () => void;
}

export function AddEntrySheet({ kind, onClose }: AddEntrySheetProps) {
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
      {kind === "outing" && (
        <Sheet open onOpenChange={(o) => !o && onClose()} title="Log an outing">
          <OutingForm
            initial={{
              startTime: nowIso,
              endTime: undefined,
              outdoorTripType: "walk-first",
              notes: "",
              caregiver: onDuty,
            }}
            caregivers={caregivers}
            submitLabel="Log outing"
            onSubmit={(values: OutingFormValues) => {
              store.addOuting(values);
              showToast("Outing logged");
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
