"use client";

import * as React from "react";
import { Sparkles, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sheet } from "@/components/ui/sheet";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import { readFileAsText } from "@/lib/export";
import { formatClock } from "@/lib/time";
import type { ImportExtraction } from "@/lib/import-text";
import {
  POTTY_TYPE_LABEL,
  POTTY_LOCATION_LABEL,
  SUCCESS_LABEL,
  MEAL_TYPE_LABEL,
  APPETITE_LABEL,
  NAP_LOCATION_LABEL,
  SPECIAL_EVENT_CATEGORY_LABEL,
  INCIDENT_CATEGORY_LABEL,
  SEVERITY_LABEL,
} from "@/lib/timeline";

// "Import from text" — paste (or upload) freeform notes, DeepSeek extracts
// candidate log entries, the caregiver reviews them here, and only on
// confirm do they get appended via the store's add* actions. Every add*
// action spreads the existing array and appends — see lib/store.tsx — so
// this can never wipe out data that's already logged.

type Phase = "idle" | "loading" | "review" | "error";

export function ImportTextSheet() {
  const store = useStore();
  const { showToast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [phase, setPhase] = React.useState<Phase>("idle");
  const [text, setText] = React.useState("");
  const [extraction, setExtraction] = React.useState<ImportExtraction | null>(null);
  const [skipped, setSkipped] = React.useState(0);
  const [errorMsg, setErrorMsg] = React.useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const reset = () => {
    setPhase("idle");
    setText("");
    setExtraction(null);
    setSkipped(0);
    setErrorMsg("");
  };

  const caregiverName = (id: string) => store.data?.caregivers.find((c) => c.id === id)?.displayName ?? id;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const content = await readFileAsText(file);
    setText(content);
  };

  const parse = async () => {
    const trimmed = text.trim();
    if (!trimmed || !store.data) return;
    setPhase("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/import-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: trimmed,
          referenceIso: new Date().toISOString(),
          tzOffsetMinutes: new Date().getTimezoneOffset(),
          caregivers: store.data.caregivers.map((c) => ({ id: c.id, displayName: c.displayName })),
        }),
      });
      const body = await res.json().catch(() => null);

      if (!res.ok || !body?.extraction) {
        if (res.status === 501) setErrorMsg("AI import isn't set up yet — add a DEEPSEEK_API_KEY to enable it.");
        else if (res.status === 422) setErrorMsg("Couldn't find any loggable entries in that text.");
        else setErrorMsg("Couldn't reach the AI right now. Try again in a moment.");
        setPhase("error");
        return;
      }

      setExtraction(body.extraction as ImportExtraction);
      setSkipped(typeof body.skipped === "number" ? body.skipped : 0);
      setPhase("review");
    } catch {
      setErrorMsg("Couldn't reach the AI right now. Try again in a moment.");
      setPhase("error");
    }
  };

  const confirmImport = () => {
    if (!extraction) return;
    for (const e of extraction.pottyEvents) store.addPotty(e);
    for (const e of extraction.mealEvents) store.addMeal(e);
    for (const e of extraction.napEvents) store.addNap(e);
    for (const e of extraction.downstairsTrips) store.addDownstairsTrip(e);
    for (const e of extraction.events) store.addEvent(e);
    for (const e of extraction.incidentEvents) store.addIncident(e);

    const total =
      extraction.pottyEvents.length +
      extraction.mealEvents.length +
      extraction.napEvents.length +
      extraction.downstairsTrips.length +
      extraction.events.length +
      extraction.incidentEvents.length;

    showToast(`Added ${total} ${total === 1 ? "entry" : "entries"} to the log`);
    setOpen(false);
    reset();
  };

  const total = extraction
    ? extraction.pottyEvents.length +
      extraction.mealEvents.length +
      extraction.napEvents.length +
      extraction.downstairsTrips.length +
      extraction.events.length +
      extraction.incidentEvents.length
    : 0;

  return (
    <>
      <Button
        variant="outline"
        className="gap-1.5"
        onClick={() => {
          reset();
          setOpen(true);
        }}
      >
        <Sparkles className="h-4 w-4" />
        Import from text (AI)
      </Button>

      <Sheet
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) reset();
        }}
        title="Import from text"
        description={
          phase === "review"
            ? "Review what the AI found before adding it to your shared log."
            : "Paste notes, texts, or a day's memory — the AI turns it into log entries. Nothing is added until you confirm."
        }
        footer={
          phase === "review" ? (
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={reset}>
                Back
              </Button>
              <Button className="flex-1" onClick={confirmImport} disabled={total === 0}>
                Add {total} {total === 1 ? "entry" : "entries"}
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,text/plain"
                className="hidden"
                onChange={handleFileChange}
              />
              <Button
                variant="outline"
                className="gap-1.5"
                onClick={() => fileInputRef.current?.click()}
                disabled={phase === "loading"}
              >
                <Upload className="h-4 w-4" />
                Upload .txt
              </Button>
              <Button className="flex-1 gap-1.5" onClick={parse} disabled={!text.trim() || phase === "loading"}>
                {phase === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {phase === "loading" ? "Reading…" : "Parse with AI"}
              </Button>
            </div>
          )
        }
      >
        {phase === "review" && extraction ? (
          <div className="flex flex-col gap-4">
            {skipped > 0 && (
              <p className="text-[12.5px] text-muted-foreground">
                Skipped {skipped} {skipped === 1 ? "item" : "items"} that didn&apos;t look like a complete log entry.
              </p>
            )}
            {total === 0 && (
              <p className="text-[13px] text-muted-foreground">
                Nothing usable was found in that text — go back and try adding more detail.
              </p>
            )}
            <EntryGroup title="Bathroom">
              {extraction.pottyEvents.map((e, i) => (
                <EntryRow
                  key={`p${i}`}
                  time={formatClock(e.timestamp)}
                  caregiver={caregiverName(e.caregiver)}
                  summary={`${POTTY_TYPE_LABEL[e.type]} · ${POTTY_LOCATION_LABEL[e.location]} · ${SUCCESS_LABEL[e.success]}`}
                />
              ))}
            </EntryGroup>
            <EntryGroup title="Meals">
              {extraction.mealEvents.map((e, i) => (
                <EntryRow
                  key={`m${i}`}
                  time={formatClock(e.timestamp)}
                  caregiver={caregiverName(e.caregiver)}
                  summary={`${MEAL_TYPE_LABEL[e.mealType]}${e.foodName ? " · " + e.foodName : ""} · ${APPETITE_LABEL[e.appetite]}`}
                />
              ))}
            </EntryGroup>
            <EntryGroup title="Naps">
              {extraction.napEvents.map((e, i) => (
                <EntryRow
                  key={`n${i}`}
                  time={formatClock(e.startTime)}
                  caregiver={caregiverName(e.caregiver)}
                  summary={`Nap · ${NAP_LOCATION_LABEL[e.location]}`}
                />
              ))}
            </EntryGroup>
            <EntryGroup title="Downstairs trips">
              {extraction.downstairsTrips.map((e, i) => (
                <EntryRow
                  key={`d${i}`}
                  time={formatClock(e.startTime)}
                  caregiver={caregiverName(e.caregiver)}
                  summary="Downstairs trip"
                />
              ))}
            </EntryGroup>
            <EntryGroup title="Events">
              {extraction.events.map((e, i) => (
                <EntryRow
                  key={`e${i}`}
                  time={formatClock(e.startTime)}
                  caregiver={caregiverName(e.caregiver)}
                  summary={`${SPECIAL_EVENT_CATEGORY_LABEL[e.category]}${e.title ? " · " + e.title : ""}`}
                />
              ))}
            </EntryGroup>
            <EntryGroup title="Incidents">
              {extraction.incidentEvents.map((e, i) => (
                <EntryRow
                  key={`i${i}`}
                  time={formatClock(e.timestamp)}
                  caregiver={caregiverName(e.caregiver)}
                  summary={`${INCIDENT_CATEGORY_LABEL[e.category]} · ${SEVERITY_LABEL[e.severity]}`}
                />
              ))}
            </EntryGroup>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={`e.g. "Ribo took him out at 7am, peed right away at the usual spot. Breakfast at 8, finished it all. Napped in the crate from 10 to 11:30..."`}
              className="min-h-40 resize-none"
              disabled={phase === "loading"}
            />
            {errorMsg && <p className="text-[12.5px] text-concern">{errorMsg}</p>}
          </div>
        )}
      </Sheet>
    </>
  );
}

function EntryGroup({ title, children }: { title: string; children: React.ReactNode }) {
  const items = React.Children.toArray(children).filter(Boolean);
  if (items.length === 0) return null;
  return (
    <div>
      <p className="mb-1.5 text-[11.5px] font-semibold uppercase tracking-wide text-muted-foreground/70">
        {title} · {items.length}
      </p>
      <div className="flex flex-col gap-1.5">{children}</div>
    </div>
  );
}

function EntryRow({ time, caregiver, summary }: { time: string; caregiver: string; summary: string }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-border bg-surface-raised px-3 py-2.5">
      <div>
        <p className="text-[13.5px] leading-snug text-foreground">{summary}</p>
        <p className="text-[12px] text-muted-foreground">
          {time} · {caregiver}
        </p>
      </div>
    </div>
  );
}
