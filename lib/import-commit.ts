"use client";

// Shared "actually write the extraction to the store" step, used by both
// components/more/ImportTextSheet.tsx and the AI Triage import suggestion
// (app/triage/page.tsx). Every call here is add-only — each store.add*
// action spreads the existing array and appends (see lib/store.tsx) — so
// this can never wipe out data that's already logged, no matter how many
// times or where it's invoked from.

import type { useStore } from "./store";
import type { ImportExtraction } from "./import-text";
import { countExtraction } from "./import-text";

type Store = ReturnType<typeof useStore>;

export function commitExtraction(store: Store, extraction: ImportExtraction): number {
  for (const e of extraction.pottyEvents) store.addPotty(e);
  for (const e of extraction.mealEvents) store.addMeal(e);
  for (const e of extraction.napEvents) store.addNap(e);
  for (const e of extraction.downstairsTrips) store.addDownstairsTrip(e);
  for (const e of extraction.events) store.addEvent(e);
  for (const e of extraction.incidentEvents) store.addIncident(e);
  return countExtraction(extraction);
}
