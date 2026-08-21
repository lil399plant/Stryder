"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";
import { useSyncedState } from "@/lib/useSyncedState";
import type { TreatPreferences } from "@/lib/types";

export function TreatsForm() {
  const { data, updateTreatPreferences } = useStore();
  const [local, setLocal] = useSyncedState<TreatPreferences | null>(data?.treatPreferences ?? null);

  if (!local) return null;

  const set = <K extends keyof TreatPreferences>(key: K, val: TreatPreferences[K]) =>
    setLocal((v) => (v ? { ...v, [key]: val } : v));
  const commit = <K extends keyof TreatPreferences>(key: K) => {
    if (local[key] !== data?.treatPreferences[key]) updateTreatPreferences({ [key]: local[key] } as Partial<TreatPreferences>);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label>Chews</Label>
        <Textarea
          value={local.chews}
          onChange={(e) => set("chews", e.target.value)}
          onBlur={() => commit("chews")}
          rows={4}
          placeholder="What he likes to chew — brands, textures, what he ignores…"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Treats</Label>
        <Textarea
          value={local.treats}
          onChange={(e) => set("treats", e.target.value)}
          onBlur={() => commit("treats")}
          rows={4}
          placeholder="What he likes as treats — high-value vs. everyday, anything to avoid…"
        />
      </div>
    </div>
  );
}
