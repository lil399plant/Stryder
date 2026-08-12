import type { ChipOption } from "@/components/ui/choice-chips";

export const POTTY_TYPE_OPTIONS: ChipOption[] = [
  { value: "pee", label: "Pee" },
  { value: "poop", label: "Poop" },
  { value: "both", label: "Pee & poop" },
  { value: "accident", label: "Accident" },
];

export const POTTY_LOCATION_OPTIONS: ChipOption[] = [
  { value: "usual-spot", label: "Usual potty spot" },
  { value: "alternate-outdoor", label: "Alternate outdoor spot" },
  { value: "building-lobby-elevator", label: "Building / lobby / elevator" },
  { value: "inside-pad", label: "Inside, near pad" },
  { value: "other", label: "Other" },
];

export const OUTDOOR_TRIP_OPTIONS: ChipOption[] = [
  { value: "direct-potty-trip", label: "Direct potty trip" },
  { value: "potty-circuit", label: "Potty circuit" },
  { value: "walk-first", label: "Walk first" },
  { value: "after-nap", label: "After nap" },
  { value: "after-meal", label: "After meal" },
  { value: "before-bed", label: "Before bed" },
];

export const SUCCESS_OPTIONS: ChipOption[] = [
  { value: "went-promptly", label: "Went promptly" },
  { value: "took-a-while", label: "Took a while" },
  { value: "distracted", label: "Distracted" },
  { value: "did-not-go", label: "Did not go" },
  { value: "accident", label: "Accident" },
];

export const POOP_QUALITY_OPTIONS: ChipOption[] = [
  { value: "normal", label: "Normal" },
  { value: "soft", label: "Soft" },
  { value: "loose", label: "Loose" },
  { value: "hard-dry", label: "Hard / dry" },
  { value: "unknown", label: "Unknown" },
];

export const POTTY_TAG_OPTIONS: ChipOption[] = [
  { value: "pigeons", label: "Pigeons" },
  { value: "other-dogs", label: "Other dogs" },
  { value: "heat", label: "Heat" },
  { value: "long-play", label: "Long play" },
  { value: "excitement", label: "Excitement" },
  { value: "new-food", label: "New food" },
  { value: "elevator-lobby", label: "Elevator / lobby" },
  { value: "unknown", label: "Unknown" },
];

export const MEAL_TYPE_OPTIONS: ChipOption[] = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "treat", label: "Treat" },
  { value: "enrichment", label: "Enrichment" },
];

export const APPETITE_OPTIONS: ChipOption[] = [
  { value: "finished", label: "Finished" },
  { value: "most", label: "Most" },
  { value: "some", label: "Some" },
  { value: "refused", label: "Refused" },
];

export const ADD_ON_OPTIONS: ChipOption[] = [
  { value: "plain-greek-yogurt", label: "Plain Greek yogurt" },
  { value: "chicken", label: "Chicken" },
  { value: "blueberries", label: "Blueberries" },
  { value: "cucumber", label: "Cucumber" },
  { value: "pumpkin", label: "Pumpkin" },
  { value: "other", label: "Other" },
];

export const NAP_LOCATION_OPTIONS: ChipOption[] = [
  { value: "kitchen", label: "Kitchen" },
  { value: "foot-of-bed", label: "Foot of bed" },
  { value: "couch", label: "Couch" },
  { value: "crate", label: "Crate" },
  { value: "pen", label: "Pen" },
  { value: "other", label: "Other" },
];

export const SETTLING_OPTIONS: ChipOption[] = [
  { value: "fell-asleep-independently", label: "Fell asleep independently" },
  { value: "needed-chew-lick-mat", label: "Needed chew / lick mat" },
  { value: "needed-caregiver-nearby", label: "Needed caregiver nearby" },
  { value: "overtired-struggled", label: "Overtired / struggled" },
];

export const NAP_QUALITY_OPTIONS: ChipOption[] = [
  { value: "normal", label: "Normal" },
  { value: "short", label: "Short" },
  { value: "long", label: "Long" },
  { value: "interrupted", label: "Interrupted" },
];

export const INCIDENT_CATEGORY_OPTIONS: ChipOption[] = [
  { value: "new-behavior", label: "New behavior observed" },
  { value: "chewing", label: "Chewing" },
  { value: "digging", label: "Digging" },
  { value: "pigeons-prey-interest", label: "Pigeons / prey interest" },
  { value: "overstimulation", label: "Overstimulation" },
  { value: "possible-stomach-issue", label: "Possible stomach issue" },
  { value: "new-environmental-change", label: "New environmental change" },
  { value: "other", label: "Other" },
];

export const SEVERITY_OPTIONS: ChipOption[] = [
  { value: "note", label: "Note" },
  { value: "watch", label: "Watch" },
  { value: "needs-follow-up", label: "Needs follow-up" },
];

export const TRAINING_OUTCOME_OPTIONS: ChipOption[] = [
  { value: "easy-win", label: "Easy win" },
  { value: "neutral", label: "Neutral" },
  { value: "too-hard", label: "Too hard" },
  { value: "needs-easier-step", label: "Needs easier step" },
];

export const CAREGIVER_OPTIONS: ChipOption[] = [
  { value: "me", label: "Me" },
  { value: "ribo", label: "Ribo" },
];

export const SPECIAL_EVENT_CATEGORY_OPTIONS: ChipOption[] = [
  { value: "vet", label: "Vet visit" },
  { value: "training-class", label: "Training class" },
  { value: "restaurant", label: "Restaurant" },
  { value: "groomer", label: "Groomer" },
  { value: "playdate", label: "Playdate" },
  { value: "travel", label: "Travel" },
  { value: "pet-store", label: "Pet store" },
  { value: "other", label: "Other" },
];
