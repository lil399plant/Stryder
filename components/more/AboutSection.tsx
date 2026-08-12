"use client";

import { ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSyncStatus } from "@/lib/store";

export function AboutSection() {
  const syncStatus = useSyncStatus();

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-2 pb-2">
        <ShieldCheck className="h-4 w-4 text-muted-foreground" />
        <CardTitle>About &amp; privacy</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2.5 pt-0 text-[13px] leading-relaxed text-muted-foreground">
        <p>
          Stryder is a shared log for two caregivers raising a puppy — not a medical or
          diagnostic tool. Patterns shown in Analytics are observations, not conclusions.
        </p>
        {syncStatus.configured ? (
          <p>
            This deployment has shared storage linked, so what either caregiver logs is saved to
            one household record (not tied to an individual account) and shows up on both
            devices. There&apos;s no login and no third-party analytics — the only place data
            goes is that shared record.
          </p>
        ) : (
          <p>
            In this version, all data stays on this device in your browser&apos;s local storage.
            There is no account, no server, and nothing is sent anywhere unless you explicitly
            export a file yourself.
          </p>
        )}
        <p>
          If you clear your browser&apos;s site data, or switch devices without shared storage
          linked, your log won&apos;t come with you automatically — use Export/Import to move it.
        </p>
      </CardContent>
    </Card>
  );
}
