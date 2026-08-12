"use client";

import { Sheet } from "@/components/ui/sheet";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import type { TimelineItem } from "@/lib/timeline";
import { BathroomForm, type BathroomFormValues } from "./BathroomForm";
import { MealForm, type MealFormValues } from "./MealForm";
import { NapForm, type NapFormValues } from "./NapForm";
import { OutingForm, type OutingFormValues } from "./OutingForm";
import { IncidentForm, type IncidentFormValues } from "./IncidentForm";
import { Badge } from "@/components/ui/badge";
import { formatClock } from "@/lib/time";
import { TRAINING_OUTCOME_LABEL } from "@/lib/timeline";

interface EntryEditSheetProps {
  item: TimelineItem | null;
  onClose: () => void;
}

export function EntryEditSheet({ item, onClose }: EntryEditSheetProps) {
  const store = useStore();
  const { showToast } = useToast();
  const caregivers = store.data?.caregivers ?? [];

  if (!item) return null;

  const titles: Record<TimelineItem["kind"], string> = {
    potty: "Edit bathroom entry",
    meal: "Edit meal",
    nap: "Edit nap",
    outing: "Edit outing",
    incident: "Edit note",
    training: "Training session",
  };

  const handleDelete = (fn: () => void, label: string) => {
    fn();
    showToast(`${label} deleted`);
    onClose();
  };

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()} title={titles[item.kind]}>
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
          onDelete={() => handleDelete(() => store.deletePotty(item.data.id), "Bathroom entry")}
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
          onDelete={() => handleDelete(() => store.deleteMeal(item.data.id), "Meal")}
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
          onDelete={() => handleDelete(() => store.deleteNap(item.data.id), "Nap")}
        />
      )}
      {item.kind === "outing" && (
        <OutingForm
          initial={item.data}
          caregivers={caregivers}
          onSubmit={(values: OutingFormValues) => {
            store.updateOuting(item.data.id, values);
            showToast("Outing updated");
            onClose();
          }}
          onCancel={onClose}
          onDelete={() => handleDelete(() => store.deleteOuting(item.data.id), "Outing")}
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
          onDelete={() => handleDelete(() => store.deleteIncident(item.data.id), "Note")}
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
