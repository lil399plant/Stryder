"use client";

import * as React from "react";
import { Lock } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";
import { useSyncedState } from "@/lib/useSyncedState";
import type { HealthProfile } from "@/lib/types";

export function ProfileForm() {
  const { data, updateHealthProfile } = useStore();
  const [local, setLocal] = useSyncedState<HealthProfile | null>(data?.health ?? null);

  if (!local) return null;

  const set = <K extends keyof HealthProfile>(key: K, val: HealthProfile[K]) =>
    setLocal((v) => (v ? { ...v, [key]: val } : v));
  const commit = <K extends keyof HealthProfile>(key: K) => {
    if (local[key] !== data?.health[key]) updateHealthProfile({ [key]: local[key] } as Partial<HealthProfile>);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2.5 rounded-xl border border-border bg-surface px-3.5 py-3 text-muted-foreground">
        <Lock className="h-4 w-4 shrink-0" />
        <p className="text-[12.5px]">Private, local-only — stays on this device unless you export it.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label>Vet name</Label>
          <Input value={local.vetName} onChange={(e) => set("vetName", e.target.value)} onBlur={() => commit("vetName")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Vet phone</Label>
          <Input value={local.vetPhone} onChange={(e) => set("vetPhone", e.target.value)} onBlur={() => commit("vetPhone")} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label>Emergency vet</Label>
          <Input value={local.emergencyVetName} onChange={(e) => set("emergencyVetName", e.target.value)} onBlur={() => commit("emergencyVetName")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Emergency phone</Label>
          <Input value={local.emergencyVetPhone} onChange={(e) => set("emergencyVetPhone", e.target.value)} onBlur={() => commit("emergencyVetPhone")} />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Microchip number</Label>
        <Input value={local.microchipNumber} onChange={(e) => set("microchipNumber", e.target.value)} onBlur={() => commit("microchipNumber")} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Current food</Label>
        <Input value={local.currentFood} onChange={(e) => set("currentFood", e.target.value)} onBlur={() => commit("currentFood")} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Known preferences / sensitivities</Label>
        <Textarea value={local.sensitivities} onChange={(e) => set("sensitivities", e.target.value)} onBlur={() => commit("sensitivities")} rows={2} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Current medications / supplements</Label>
        <Textarea value={local.currentMedications} onChange={(e) => set("currentMedications", e.target.value)} onBlur={() => commit("currentMedications")} rows={2} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Notes</Label>
        <Textarea value={local.notes} onChange={(e) => set("notes", e.target.value)} onBlur={() => commit("notes")} rows={2} />
      </div>
    </div>
  );
}
