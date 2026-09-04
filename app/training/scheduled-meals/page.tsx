"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ScheduledMealsForm } from "@/components/training/ScheduledMealsForm";

export default function ScheduledMealsPage() {
  return (
    <div>
      <Link
        href="/training"
        className="mb-3 flex items-center gap-1.5 text-[13.5px] font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Training
      </Link>
      <h1 className="text-[22px] font-semibold leading-tight">Scheduled meals</h1>
      <p className="mb-4 mt-1 text-[13px] text-muted-foreground">
        Set a daily time for each meal so whoever&apos;s on duty gets a heads-up before it&apos;s due.
      </p>
      <ScheduledMealsForm />
    </div>
  );
}
