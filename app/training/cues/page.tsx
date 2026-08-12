"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CueDictionary } from "@/components/training/CueDictionary";

export default function CuesPage() {
  return (
    <div>
      <Link
        href="/training"
        className="mb-3 flex items-center gap-1.5 text-[13.5px] font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Training
      </Link>
      <h1 className="text-[22px] font-semibold leading-tight">Training consistency</h1>
      <p className="mb-4 mt-1 text-[13px] text-muted-foreground">
        A shared cue dictionary so both caregivers use the same words for the same things.
      </p>
      <CueDictionary />
    </div>
  );
}
