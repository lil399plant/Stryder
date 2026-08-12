"use client";

import * as React from "react";
import { FileText } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useStore } from "@/lib/store";
import { useSyncedState } from "@/lib/useSyncedState";
import type { InsuranceInfo } from "@/lib/types";

export function InsuranceForm() {
  const { data, updateInsurance } = useStore();
  const [local, setLocal] = useSyncedState<InsuranceInfo | null>(data?.insurance ?? null);

  if (!local) return null;

  const set = <K extends keyof InsuranceInfo>(key: K, val: InsuranceInfo[K]) =>
    setLocal((v) => (v ? { ...v, [key]: val } : v));

  const commit = <K extends keyof InsuranceInfo>(key: K) => {
    if (local[key] !== data?.insurance[key]) updateInsurance({ [key]: local[key] } as Partial<InsuranceInfo>);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label>Provider</Label>
          <Input value={local.provider} onChange={(e) => set("provider", e.target.value)} onBlur={() => commit("provider")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Policy number</Label>
          <Input value={local.policyNumber} onChange={(e) => set("policyNumber", e.target.value)} onBlur={() => commit("policyNumber")} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label>Effective date</Label>
          <Input type="date" value={local.effectiveDate} onChange={(e) => set("effectiveDate", e.target.value)} onBlur={() => commit("effectiveDate")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Renewal date</Label>
          <Input type="date" value={local.renewalDate} onChange={(e) => set("renewalDate", e.target.value)} onBlur={() => commit("renewalDate")} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label>Deductible</Label>
          <Input value={local.deductible} onChange={(e) => set("deductible", e.target.value)} onBlur={() => commit("deductible")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Reimburse %</Label>
          <Input value={local.reimbursementPercent} onChange={(e) => set("reimbursementPercent", e.target.value)} onBlur={() => commit("reimbursementPercent")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Annual limit</Label>
          <Input value={local.annualLimit} onChange={(e) => set("annualLimit", e.target.value)} onBlur={() => commit("annualLimit")} />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Claim notes</Label>
        <Textarea value={local.claimNotes} onChange={(e) => set("claimNotes", e.target.value)} onBlur={() => commit("claimNotes")} rows={3} />
      </div>

      <div className="flex items-center gap-2.5 rounded-xl border border-dashed border-border-strong px-3.5 py-3 text-muted-foreground">
        <FileText className="h-4 w-4 shrink-0" />
        <p className="text-[12.5px]">Document attachments aren&apos;t supported yet — noted for a future version.</p>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-border bg-surface-raised px-3.5 py-3">
        <span className="text-[14px] font-medium">Renewal reminder</span>
        <Switch checked={local.reminderEnabled} onCheckedChange={(v) => { set("reminderEnabled", v); updateInsurance({ reminderEnabled: v }); }} />
      </div>
    </div>
  );
}
