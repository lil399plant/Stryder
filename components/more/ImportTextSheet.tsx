"use client";

import * as React from "react";
import { Sparkles, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sheet } from "@/components/ui/sheet";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import { readFileAsText } from "@/lib/export";
import type { ImportExtraction } from "@/lib/import-text";
import { countExtraction } from "@/lib/import-text";
import { commitExtraction } from "@/lib/import-commit";
import { ImportPreviewList } from "@/components/import/ImportPreviewList";

// "Import from text" — paste (or upload) freeform notes, DeepSeek extracts
// candidate log entries, the caregiver reviews them here, and only on
// confirm do they get appended via commitExtraction (lib/import-commit.ts)
// — additive only, this can never wipe out data that's already logged.

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
    const total = commitExtraction(store, extraction);
    showToast(`Added ${total} ${total === 1 ? "entry" : "entries"} to the log`);
    setOpen(false);
    reset();
  };

  const total = extraction ? countExtraction(extraction) : 0;

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
            <ImportPreviewList extraction={extraction} caregiverName={caregiverName} />
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
