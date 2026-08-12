"use client";

import * as React from "react";
import { Tabs } from "@/components/ui/tabs";
import { VaccineList } from "@/components/health/VaccineList";
import { InsuranceForm } from "@/components/health/InsuranceForm";
import { ProfileForm } from "@/components/health/ProfileForm";

const TABS = [
  { value: "vaccines", label: "Vaccines / vet" },
  { value: "insurance", label: "Insurance" },
  { value: "profile", label: "Health profile" },
] as const;

type TabValue = (typeof TABS)[number]["value"];

export default function HealthPage() {
  const [tab, setTab] = React.useState<TabValue>("vaccines");

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-[22px] font-semibold leading-tight">Health</h1>
        <p className="text-[13px] text-muted-foreground">
          Records and planning — not a diagnostic tool. When in doubt, call the vet.
        </p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabValue)} tabs={[...TABS]} className="mb-4" />

      {tab === "vaccines" && <VaccineList />}
      {tab === "insurance" && <InsuranceForm />}
      {tab === "profile" && <ProfileForm />}
    </div>
  );
}
