"use client";

import { Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import { useSyncedState } from "@/lib/useSyncedState";
import type { CaregiverProfile } from "@/lib/types";

function CaregiverRow({ caregiver }: { caregiver: CaregiverProfile }) {
  const { updateCaregiverName } = useStore();
  const [name, setName] = useSyncedState(caregiver.displayName);

  return (
    <div className="flex flex-col gap-1.5">
      <Label>{caregiver.id === "me" ? "You" : "Co-caregiver"}</Label>
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={() => {
          if (name && name !== caregiver.displayName) updateCaregiverName(caregiver.id, name);
        }}
      />
    </div>
  );
}

export function CaregiversSection() {
  const { data } = useStore();
  if (!data) return null;

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-2 pb-2">
        <Users className="h-4 w-4 text-muted-foreground" />
        <CardTitle>Caregivers</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-0">
        {data.caregivers.map((c) => (
          <CaregiverRow key={c.id} caregiver={c} />
        ))}
      </CardContent>
    </Card>
  );
}
