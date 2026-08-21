"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TreatsForm } from "@/components/training/TreatsForm";

export default function TreatsPage() {
  return (
    <div>
      <Link
        href="/training"
        className="mb-3 flex items-center gap-1.5 text-[13.5px] font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Training
      </Link>
      <h1 className="text-[22px] font-semibold leading-tight">Treats</h1>
      <p className="mb-4 mt-1 text-[13px] text-muted-foreground">
        A running note on what Stryder prefers, so both caregivers are working off the same list.
      </p>
      <TreatsForm />
    </div>
  );
}
