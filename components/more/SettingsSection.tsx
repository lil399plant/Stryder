"use client";

import { SlidersHorizontal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChoiceChips } from "@/components/ui/choice-chips";
import { Switch } from "@/components/ui/switch";
import { useStore } from "@/lib/store";
import type { AppSettings } from "@/lib/types";

const THEME_OPTIONS = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

export function SettingsSection() {
  const { data, updateSettings } = useStore();
  if (!data) return null;

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-2 pb-2">
        <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
        <CardTitle>Settings</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 pt-0">
        <div>
          <p className="mb-1.5 text-[12.5px] font-medium text-muted-foreground">Appearance</p>
          <ChoiceChips
            options={THEME_OPTIONS}
            value={data.settings.theme}
            onChange={(v) => updateSettings({ theme: v as AppSettings["theme"] })}
          />
        </div>

        <div className="flex items-center justify-between rounded-xl border border-border bg-surface-raised px-3.5 py-3">
          <div className="pr-3">
            <p className="text-[14px] font-medium">Hide analytics</p>
            <p className="text-[11.5px] text-muted-foreground">
              For when you want less to look at, not more.
            </p>
          </div>
          <Switch
            checked={data.settings.hideAnalytics}
            onCheckedChange={(v) => updateSettings({ hideAnalytics: v })}
          />
        </div>

        <div className="flex items-center justify-between rounded-xl border border-border bg-surface-raised px-3.5 py-3">
          <div className="pr-3">
            <p className="text-[14px] font-medium">Reminder preferences</p>
            <p className="text-[11.5px] text-muted-foreground">
              Stryder doesn&apos;t send push notifications. This just controls whether
              per-plan reminder toggles are shown as on or off by default.
            </p>
          </div>
          <Switch
            checked={data.settings.remindersEnabled}
            onCheckedChange={(v) => updateSettings({ remindersEnabled: v })}
          />
        </div>
      </CardContent>
    </Card>
  );
}
