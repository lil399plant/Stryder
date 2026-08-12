"use client";

import { Sheet } from "@/components/ui/sheet";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import type { TimelineItem } from "@/lib/timeline";
import { BathroomForm, type BathroomFormValues } from "./BathroomForm";
import { MealForm, type MealFormValues } from "./MealForm";
import { NapForm, type NapFormValues } from "./NapForm";
import { DownstairsForm, type DownstairsFormValues } from "./DownstairsForm";
import { EventForm, type EventFormValues } from "./EventForm";
import { IncidentForm, type IncidentFormValues } from "./IncidentForm";
import { Badge } from "@/components/ui/badge";
import { formatClock } from "@/lib/time";
import { TRAINING_OUTCOME_LABEL } from "@/lib/timeline";
import { withoutIdAndKind } from "@/lib/utils";

interface EntryEditSheetProps {
  item: TimelineItem | null;
  onClose: () => void;
}

const TITLES: Record<TimelineItem["kind"], string> = {
  potty: "Edit bathroom entry",
  meal: "Edit meal",
  nap: "Edit nap",
  downstairs: "Edit downstairs trip",
  event: "Edit event",
  incident: "Edit note",
  training: "Training session",
};

const DELETED_LABELS: Record<TimelineItem["kind"], string> = {
  potty: "Bathroom entry",
  meal: "Meal",
  nap: "Nap",
  downstairs: "Downstairs trip",
  event: "Event",
  incident: "Note",
  training: "Training session",
};

export function EntryEditSheet({ item, onClose }: EntryEditSheetProps) {
  const store = useStore();
  const { showToast } = useToast();
  const caregivers = store.data?.caregivers ?? [];

  if (!item) return null;

  // Deleting is available from any past or present entry — one tap on the
  // trash icon in the header, no confirmation dialog, but always undoable
  // (re-adds the exact entry) via the toast, matching how the rest of the
  // app handles destructive one-taps.
  const handleDelete = () => {
    switch (item.kind) {
      case "potty": {
        const rest = withoutIdAndKind(item.data);
        store.deletePotty(item.data.id);
        showToast("Bathroom entry deleted", () => store.addPotty(rest));
        break;
      }
      case "meal": {
        const rest = withoutIdAndKind(item.data);
        store.deleteMeal(item.data.id);
        showToast("Meal deleted", () => store.addMeal(rest));
        break;
      }
      case "nap": {
        const rest = withoutIdAndKind(item.data);
        store.deleteNap(item.data.id);
        showToast("Nap deleted", () => store.addNap(rest));
        break;
      }
      case "downstairs": {
        const rest = withoutIdAndKind(item.data);
        store.deleteDownstairsTrip(item.data.id);
        showToast("Downstairs trip deleted", () => store.addDownstairsTrip(rest));
        break;
      }
      case "event": {
        const rest = withoutIdAndKind(item.data);
        store.deleteEvent(item.data.id);
        showToast("Event deleted", () => store.addEvent(rest));
        break;
      }
      case "incident": {
        const rest = withoutIdAndKind(item.data);
        store.deleteIncident(item.data.id);
        showToast("Note deleted", () => store.addIncident(rest));
        break;
      }
      case "training":
        return; // not deletable from here — see the read-only panel below
    }
    onClose();
  };

  const canDelete = item.kind !== "training";

  return (
    <Sheet
      open
      onOpenChange={(o) => !o && onClose()}
      title={TITLES[item.kind]}
      onDelete={canDelete ? handleDelete : undefined}
      deleteLabel={canDelete ? `Delete ${DELETED_LABELS[item.kind].toLowerCase()}` : undefined}
    >
      {item.kind === "potty" && (
        <BathroomForm
          initial={item.data}
          caregivers={caregivers}
          startExpanded
          onSubmit={(values: BathroomFormValues) => {
            store.updatePotty(item.data.id, values);
            showToast("Bathroom entry updated");
            onClose();
          }}
          onCancel={onClose}
        />
      )}
      {item.kind === "meal" && (
        <MealForm
          initial={item.data}
          caregivers={caregivers}
          startExpanded
          onSubmit={(values: MealFormValues) => {
            store.updateMeal(item.data.id, values);
            showToast("Meal updated");
            onClose();
          }}
          onCancel={onClose}
        />
      )}
      {item.kind === "nap" && (
        <NapForm
          initial={item.data}
          caregivers={caregivers}
          startExpanded
          onSubmit={(values: NapFormValues) => {
            store.updateNap(item.data.id, values);
            showToast("Nap updated");
            onClose();
          }}
          onCancel={onClose}
        />
      )}
      {item.kind === "downstairs" && (
        <DownstairsForm
          initial={item.data}
          caregivers={caregivers}
          onSubmit={(values: DownstairsFormValues) => {
            store.updateDownstairsTrip(item.data.id, values);
            showToast("Downstairs trip updated");
            onClose();
          }}
          onCancel={onClose}
        />
      )}
      {item.kind === "event" && (
        <EventForm
          initial={item.data}
          caregivers={caregivers}
          onSubmit={(values: EventFormValues) => {
            store.updateEvent(item.data.id, values);
            showToast("Event updated");
            onClose();
          }}
          onCancel={onClose}
        />
      )}
      {item.kind === "incident" && (
        <IncidentForm
          initial={item.data}
          caregivers={caregivers}
          onSubmit={(values: IncidentFormValues) => {
            store.updateIncident(item.data.id, values);
            showToast("Note updated");
            onClose();
          }}
          onCancel={onClose}
        />
      )}
      {item.kind === "training" && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-muted-foreground">{formatClock(item.data.timestamp)}</span>
            <Badge variant="forest">{TRAINING_OUTCOME_LABEL[item.data.outcome]}</Badge>
          </div>
          <p className="text-[15px] font-medium">{item.data.skillLabel}</p>
          <p className="text-[13.5px] text-muted-foreground">
            {item.data.durationMinutes} min · {item.data.setting} · reward: {item.data.reward}
          </p>
          {item.data.notes && <p className="text-[14px] leading-relaxed">{item.data.notes}</p>}
          <p className="text-[12.5px] text-muted-foreground">
            Edit or delete training sessions from the Training tab.
          </p>
        </div>
      )}
    </Sheet>
  );
}
