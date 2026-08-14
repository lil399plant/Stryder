"use client";

import * as React from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChoiceChips } from "@/components/ui/choice-chips";
import { useStore } from "@/lib/store";
import { useDeviceCaregiver, setDeviceCaregiver } from "@/lib/device-identity";
import {
  getPushSupport,
  needsHomeScreenInstall,
  isSubscribed,
  subscribeToPush,
  unsubscribeFromPush,
  type SubscribeResult,
} from "@/lib/push-client";
import type { Caregiver } from "@/lib/types";

const REASON_MESSAGE: Record<Exclude<SubscribeResult, { ok: true }>["reason"], string> = {
  unsupported: "This browser doesn't support push notifications.",
  "not-installed": "Add Stryder to your Home Screen first (Share → Add to Home Screen), then open it from there.",
  "permission-denied": "Notifications are blocked for this app — check your device's notification settings.",
  "no-vapid-key": "Push notifications aren't set up for this deployment yet.",
  "request-failed": "Something went wrong enabling notifications — try again in a moment.",
};

export function PushNotificationsSection() {
  const { data } = useStore();
  const deviceCaregiver = useDeviceCaregiver();
  const [subscribed, setSubscribed] = React.useState<boolean | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [pendingCaregiver, setPendingCaregiver] = React.useState<Caregiver | null>(null);

  React.useEffect(() => {
    // isSubscribed() already resolves to false when push isn't supported —
    // this stays async unconditionally so setSubscribed only ever runs in
    // a .then callback, not synchronously in the effect body.
    isSubscribed().then(setSubscribed);
  }, []);

  if (!data) return null;

  const support = getPushSupport();
  const askInstall = needsHomeScreenInstall();

  const enable = async (caregiver: Caregiver) => {
    setBusy(true);
    setError(null);
    const result = await subscribeToPush(caregiver);
    setBusy(false);
    if (result.ok) {
      setDeviceCaregiver(caregiver);
      setSubscribed(true);
      setPendingCaregiver(null);
    } else {
      setError(REASON_MESSAGE[result.reason]);
    }
  };

  const handleEnableClick = () => {
    if (deviceCaregiver) {
      enable(deviceCaregiver);
    } else {
      // First time on this device — ask which caregiver it belongs to
      // before subscribing, so instant notifications can be attributed.
      setPendingCaregiver(data.handoff.onDuty);
    }
  };

  const disable = async () => {
    setBusy(true);
    await unsubscribeFromPush();
    setBusy(false);
    setSubscribed(false);
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-2 pb-2">
        <Bell className="h-4 w-4 text-muted-foreground" />
        <CardTitle>Push notifications</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3.5 pt-0">
        <p className="text-[12.5px] leading-snug text-muted-foreground">
          Get notified on this device when an accident is logged, the handoff note changes, a new
          event is added, or something looks like it&apos;s probably due. Per-device — enable it
          separately on each phone or laptop you want to hear from.
        </p>

        {support === "unsupported" ? (
          <p className="text-[12.5px] text-muted-foreground">{REASON_MESSAGE.unsupported}</p>
        ) : askInstall && subscribed !== true ? (
          <p className="text-[12.5px] text-muted-foreground">{REASON_MESSAGE["not-installed"]}</p>
        ) : pendingCaregiver ? (
          <div className="flex flex-col gap-2.5 rounded-xl border border-border bg-surface-raised px-3.5 py-3">
            <p className="text-[13px] font-medium">Which caregiver is this device?</p>
            <ChoiceChips
              options={data.caregivers.map((c) => ({ value: c.id, label: c.displayName }))}
              value={pendingCaregiver}
              onChange={(v) => setPendingCaregiver(v as Caregiver)}
            />
            <div className="flex gap-2 pt-1">
              <Button size="sm" className="flex-1" onClick={() => enable(pendingCaregiver)} disabled={busy}>
                {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Continue"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setPendingCaregiver(null)} disabled={busy}>
                Cancel
              </Button>
            </div>
          </div>
        ) : subscribed === true ? (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-forest/30 bg-forest-soft px-3.5 py-3">
            <div>
              <p className="text-[13px] font-medium text-forest-soft-foreground">Enabled on this device</p>
              {deviceCaregiver && (
                <p className="text-[11.5px] text-forest-soft-foreground/75">
                  As {data.caregivers.find((c) => c.id === deviceCaregiver)?.displayName ?? deviceCaregiver}
                </p>
              )}
            </div>
            <Button size="sm" variant="outline" onClick={disable} disabled={busy} className="gap-1.5">
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <BellOff className="h-3.5 w-3.5" />}
              Turn off
            </Button>
          </div>
        ) : (
          <Button size="sm" onClick={handleEnableClick} disabled={busy} className="gap-1.5 self-start">
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Bell className="h-3.5 w-3.5" />}
            Enable notifications
          </Button>
        )}

        {error && <p className="text-[12.5px] text-concern">{error}</p>}
      </CardContent>
    </Card>
  );
}
