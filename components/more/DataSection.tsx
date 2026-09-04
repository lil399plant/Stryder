"use client";

import * as React from "react";
import { Download, Upload, RotateCcw, DatabaseZap, CloudCheck, CloudOff, CloudAlert, TriangleAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useStore, useSyncStatus } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import { downloadJson, readFileAsText } from "@/lib/export";
import { ImportTextSheet } from "@/components/more/ImportTextSheet";

export function DataSection() {
  const store = useStore();
  const syncStatus = useSyncStatus();
  const { showToast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const json = store.exportJson();
    const date = new Date().toISOString().slice(0, 10);
    downloadJson(`stryder-export-${date}.json`, json);
    showToast("Export downloaded");
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const confirmed = window.confirm(
      "Importing will replace all current Stryder data on this device with the contents of this file. Continue?"
    );
    if (!confirmed) return;
    const text = await readFileAsText(file);
    const result = store.importJson(text);
    if (result.ok) showToast("Data imported");
    else showToast(result.error ?? "Import failed");
  };

  const handleReset = () => {
    const confirmed = window.confirm(
      "This permanently erases every logged entry and returns Stryder's profile, training plans, and cues to their starting defaults. This can't be undone. Continue?"
    );
    if (!confirmed) return;
    store.resetToSeed();
    showToast("Reset to blank state");
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-2 pb-2">
        <DatabaseZap className="h-4 w-4 text-muted-foreground" />
        <CardTitle>Data export &amp; import</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-0">
        {syncStatus.possibleDataLoss && (
          <div className="flex items-start gap-2.5 rounded-xl border border-concern/30 bg-concern-soft px-3.5 py-3">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-concern" />
            <div>
              <Badge variant="concern">Sync paused</Badge>
              <p className="mt-1.5 text-[12.5px] leading-snug text-concern-soft-foreground">
                A sync just now would have removed a bunch of logged entries, so it was blocked
                instead of applied — nothing was lost. This shouldn&apos;t normally happen; if it
                keeps showing up, export a backup below and get in touch about it.
              </p>
            </div>
          </div>
        )}
        {syncStatus.configured ? (
          <div className="flex items-start gap-2.5 rounded-xl border border-forest/20 bg-forest-soft px-3.5 py-3">
            <CloudCheck className="mt-0.5 h-4 w-4 shrink-0 text-forest-soft-foreground/70" />
            <div>
              <Badge variant="forest">Shared storage connected</Badge>
              <p className="mt-1.5 text-[12.5px] leading-snug text-forest-soft-foreground">
                Logging syncs through Supabase, so Me and Ribo see the same data on any device.
                {syncStatus.lastError && " The last sync attempt failed — this device will retry."}
              </p>
            </div>
          </div>
        ) : syncStatus.checked ? (
          <div className="flex items-start gap-2.5 rounded-xl border border-border bg-surface-raised px-3.5 py-3">
            <CloudOff className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div>
              <Badge variant="neutral">Local only</Badge>
              <p className="mt-1.5 text-[12.5px] leading-snug text-muted-foreground">
                No shared storage linked yet — this device&apos;s data stays in its own browser.
                Connect Supabase (see README) so both caregivers see the same log.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-2.5 rounded-xl border border-border bg-surface-raised px-3.5 py-3">
            <CloudAlert className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <p className="text-[12.5px] leading-snug text-muted-foreground">Checking shared storage…</p>
          </div>
        )}
        <CardDescription>
          Export a backup any time, or move data between devices with an import.
        </CardDescription>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" className="gap-1.5" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export JSON
          </Button>
          <Button variant="outline" className="gap-1.5" onClick={handleImportClick}>
            <Upload className="h-4 w-4" />
            Import JSON
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
        <p className="text-[12.5px] text-muted-foreground">
          &ldquo;Import JSON&rdquo; above replaces all data on this device with the file&apos;s contents
          (a full backup restore). The AI import below is different — it only ever adds new entries on
          top of what&apos;s already logged.
        </p>
        <div className="flex flex-wrap gap-2">
          <ImportTextSheet />
        </div>
        <div className="mt-2 border-t border-border pt-3">
          <Button variant="ghost" className="gap-1.5 text-muted-foreground" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" />
            Erase all data
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
