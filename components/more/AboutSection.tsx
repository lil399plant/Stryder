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
          <>
            <p>
              This deployment stores data in a shared Supabase table — one household record, not
              tied to an individual account — so what either caregiver logs shows up on both
              devices. There&apos;s no login: anyone with the deployment&apos;s URL can view or
              edit this log, so treat the link the way you&apos;d treat a shared document.
              There&apos;s no third-party analytics — the only places data goes are that Supabase
              record and, for anything uploaded under Health &gt; Vaccines / vet or More &gt;
              Photos, a Supabase Storage bucket. Uploaded files are public — anyone with a
              file&apos;s link can view or download it, whether or not they have the app&apos;s
              link — so don&apos;t upload anything you wouldn&apos;t want findable by a stranger
              who guessed the URL.
            </p>
            <p>
              One limitation worth knowing: syncing isn&apos;t real-time — each device pulls the
              latest data when a page loads and pushes changes back after each edit, so if
              you&apos;re both using the app at the same moment, a screen that&apos;s already open
              won&apos;t pick up the other person&apos;s change until it&apos;s refreshed. Each
              save does re-check the server first and merges new/changed entries from both sides
              rather than one overwriting the other wholesale, so this mostly just means what you
              see on screen can be briefly stale, not that anything gets lost — the one edge case
              still worth knowing is if you both edit the exact same field (like the handoff note)
              before either refreshes, whichever save lands last wins for that one field.
            </p>
            <p>
              Every save also drops a timestamped snapshot into a separate history table on
              Supabase (kept for 90 days), and a save that looks like it would erase a lot of
              entries at once gets blocked automatically rather than applied — so a bug elsewhere
              in the app has something to recover from instead of just overwriting the log. That
              said, it&apos;s still worth keeping an occasional backup of your own — use
              Export/Import in Data to save or restore a copy of the log independent of Supabase.
            </p>
          </>
        ) : (
          <>
            <p>
              In this version, all data stays on this device in your browser&apos;s local storage.
              There is no account, no server, and nothing is sent anywhere unless you explicitly
              export a file yourself.
            </p>
            <p>
              If you clear your browser&apos;s site data, or switch devices, your log
              won&apos;t come with you automatically — use Export/Import to move it.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
