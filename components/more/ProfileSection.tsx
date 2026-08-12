"use client";

import * as React from "react";
import { PawPrint } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import { useSyncedState } from "@/lib/useSyncedState";
import type { PuppyProfile } from "@/lib/types";
import { ageInWeeks } from "@/lib/time";

export function ProfileSection() {
  const { data, updatePuppy } = useStore();
  const [local, setLocal] = useSyncedState<PuppyProfile | null>(data?.puppy ?? null);

  if (!local) return null;

  const set = <K extends keyof PuppyProfile>(key: K, val: PuppyProfile[K]) =>
    setLocal((v) => (v ? { ...v, [key]: val } : v));
  const commit = <K extends keyof PuppyProfile>(key: K) => {
    if (local[key] !== data?.puppy[key]) updatePuppy({ [key]: local[key] } as Partial<PuppyProfile>);
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-2 pb-2">
        <PawPrint className="h-4 w-4 text-muted-foreground" />
        <CardTitle>Stryder&apos;s profile</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 pt-0">
        <div className="flex items-center gap-3">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-tan-soft text-tan-soft-foreground">
            <PawPrint className="h-7 w-7" />
          </div>
          <p className="text-[12px] text-muted-foreground">
            Photo support is coming — this is a placeholder for now.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label>Name</Label>
            <Input value={local.name} onChange={(e) => set("name", e.target.value)} onBlur={() => commit("name")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Breed</Label>
            <Input value={local.breed} onChange={(e) => set("breed", e.target.value)} onBlur={() => commit("breed")} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label>Birthday</Label>
            <Input type="date" value={local.birthday} onChange={(e) => set("birthday", e.target.value)} onBlur={() => commit("birthday")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Current weight (lb)</Label>
            <Input value={local.currentWeightLbs} onChange={(e) => set("currentWeightLbs", e.target.value)} onBlur={() => commit("currentWeightLbs")} />
          </div>
        </div>
        <p className="text-[12.5px] text-muted-foreground">
          {local.birthday ? `About ${ageInWeeks(local.birthday)} weeks old` : ""}
        </p>
      </CardContent>
    </Card>
  );
}
