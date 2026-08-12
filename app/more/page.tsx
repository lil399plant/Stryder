import Link from "next/link";
import { BookOpenText, ChevronRight, BarChart3 } from "lucide-react";
import { ProfileSection } from "@/components/more/ProfileSection";
import { CaregiversSection } from "@/components/more/CaregiversSection";
import { DataSection } from "@/components/more/DataSection";
import { SettingsSection } from "@/components/more/SettingsSection";
import { NudgeRulesSection } from "@/components/more/NudgeRulesSection";
import { AboutSection } from "@/components/more/AboutSection";

export default function MorePage() {
  return (
    <div className="flex flex-col gap-3">
      <div className="mb-1">
        <h1 className="text-[22px] font-semibold leading-tight">More</h1>
        <p className="text-[13px] text-muted-foreground">Profile, caregivers, data, and settings.</p>
      </div>

      <ProfileSection />
      <CaregiversSection />

      <Link
        href="/training/cues"
        className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3.5 hover:bg-tan-soft/15"
      >
        <BookOpenText className="h-4.5 w-4.5 text-muted-foreground" />
        <div className="flex-1">
          <p className="text-[14px] font-medium">Shared cue dictionary</p>
          <p className="text-[12px] text-muted-foreground">Keep cues consistent between caregivers</p>
        </div>
        <ChevronRight className="h-4.5 w-4.5 text-muted-foreground/50" />
      </Link>

      <Link
        href="/analytics"
        className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3.5 hover:bg-tan-soft/15"
      >
        <BarChart3 className="h-4.5 w-4.5 text-muted-foreground" />
        <div className="flex-1">
          <p className="text-[14px] font-medium">Patterns &amp; analytics</p>
          <p className="text-[12px] text-muted-foreground">Gentle, non-judgmental trends over time</p>
        </div>
        <ChevronRight className="h-4.5 w-4.5 text-muted-foreground/50" />
      </Link>

      <DataSection />
      <SettingsSection />
      <NudgeRulesSection />
      <AboutSection />
    </div>
  );
}
