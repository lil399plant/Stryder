// Stryder — core data model
// Everything a caregiver logs lives in one AppData root object that is
// persisted as a single JSON blob (see lib/store.tsx). Keeping one root
// object makes local-first persistence and JSON import/export trivial:
// export is "serialize this object", import is "replace this object".

export type Caregiver = "me" | "ribo";

export type ISODateTime = string; // new Date().toISOString()

// ---------- Bathroom ----------

export type PottyType = "pee" | "poop" | "both" | "accident";

export type PottyLocation =
  | "usual-spot"
  | "alternate-outdoor"
  | "building-lobby-elevator"
  | "inside-pad"
  | "other";

export type OutdoorTripType =
  | "direct-potty-trip"
  | "potty-circuit"
  | "walk-first"
  | "after-nap"
  | "after-meal"
  | "before-bed";

export type PottySuccess =
  | "went-promptly"
  | "took-a-while"
  | "distracted"
  | "did-not-go"
  | "accident";

export type PoopQuality = "normal" | "soft" | "loose" | "hard-dry" | "unknown";

export type PottyTag =
  | "pigeons"
  | "other-dogs"
  | "heat"
  | "long-play"
  | "excitement"
  | "new-food"
  | "elevator-lobby"
  | "unknown";

export interface PottyEvent {
  id: string;
  kind: "potty";
  timestamp: ISODateTime;
  type: PottyType;
  location: PottyLocation;
  outdoorTripType?: OutdoorTripType;
  success: PottySuccess;
  poopQuality?: PoopQuality;
  tags: PottyTag[];
  notes?: string;
  caregiver: Caregiver;
  /** Freeform — only used when type is "accident", in place of the preset
   * location chips / trigger tags, since accidents don't fit neat presets. */
  accidentWhere?: string;
  accidentReason?: string;
}

// ---------- Meals ----------

export type MealType = "breakfast" | "lunch" | "dinner" | "treat" | "enrichment";

export type Appetite = "finished" | "most" | "some" | "refused";

export type MealAddOn =
  | "plain-greek-yogurt"
  | "chicken"
  | "blueberries"
  | "cucumber"
  | "pumpkin"
  | "other";

export interface MealEvent {
  id: string;
  kind: "meal";
  timestamp: ISODateTime;
  mealType: MealType;
  foodName: string;
  amount: string;
  appetite: Appetite;
  addOns: MealAddOn[];
  newFood: boolean;
  usedForCrateTraining: boolean;
  usedAsPottyReward: boolean;
  notes?: string;
  caregiver: Caregiver;
}

// ---------- Naps ----------

export type NapLocation = "kitchen" | "foot-of-bed" | "couch" | "crate" | "pen" | "other";

export type Settling =
  | "fell-asleep-independently"
  | "needed-chew-lick-mat"
  | "needed-caregiver-nearby"
  | "overtired-struggled";

export type NapQuality = "normal" | "short" | "long" | "interrupted";

export interface NapEvent {
  id: string;
  kind: "nap";
  startTime: ISODateTime;
  endTime?: ISODateTime;
  /** Optional — leave unset rather than guessing when the spot isn't known
   * or doesn't matter for that nap. */
  location?: NapLocation;
  settling?: Settling;
  quality?: NapQuality;
  notes?: string;
  caregiver: Caregiver;
}

// ---------- Downstairs trips (go outside) ----------
// A duration event — the walk/outing itself. Any pee/poop that happened
// during it can be logged right on the trip as a PottyMoment (below);
// separately, the standalone one-tap PottyEvent quick-log still exists for
// logging pee/poop any time (including outside a trip, e.g. during a
// Special Event) and for accidents, which are never trip-scoped.

export type PottyMomentType = "pee" | "poop" | "both";

/** How a pee/poop moment went, scoped to a downstairs trip — a narrower
 * set than PottySuccess: "did-not-go" doesn't apply (you just wouldn't add
 * a moment for it), and "accident" doesn't apply (accidents are never
 * trip-scoped — see PottyEvent above). */
export type PottyMomentSuccess = "went-promptly" | "took-a-while" | "distracted";

/** One pee/poop occurrence logged as part of a DownstairsEvent. Carries its
 * own timestamp — defaulting to the trip's startTime, but independently
 * editable — so a moment logged partway through a longer walk doesn't skew
 * "time awake since last potty" math (see lib/potty.ts) toward the start of
 * the trip. */
export interface PottyMoment {
  id: string;
  timestamp: ISODateTime;
  type: PottyMomentType;
  success: PottyMomentSuccess;
  /** Only meaningful when type is "poop" or "both". */
  poopQuality?: PoopQuality;
}

export interface DownstairsEvent {
  id: string;
  kind: "downstairs";
  startTime: ISODateTime;
  endTime?: ISODateTime;
  outdoorTripType?: OutdoorTripType;
  pottyMoments: PottyMoment[];
  notes?: string;
  caregiver: Caregiver;
}

// ---------- Special events ----------
// Things outside the normal downstairs-potty-trip / indoor-play routine —
// vet visits, training classes, restaurants, travel, etc. Also a duration
// event.

export type SpecialEventCategory =
  | "vet"
  | "training-class"
  | "restaurant"
  | "groomer"
  | "playdate"
  | "travel"
  | "pet-store"
  | "other";

export interface SpecialEvent {
  id: string;
  kind: "event";
  startTime: ISODateTime;
  endTime?: ISODateTime;
  category: SpecialEventCategory;
  title?: string;
  notes?: string;
  caregiver: Caregiver;
}

// ---------- Incidents / observations ----------

export type IncidentCategory =
  | "new-behavior"
  | "chewing"
  | "digging"
  | "pigeons-prey-interest"
  | "overstimulation"
  | "possible-stomach-issue"
  | "new-environmental-change"
  | "other";

export type IncidentSeverity = "note" | "watch" | "needs-follow-up";

export interface IncidentEvent {
  id: string;
  kind: "incident";
  timestamp: ISODateTime;
  category: IncidentCategory;
  severity: IncidentSeverity;
  note: string;
  discussWithVet: boolean;
  caregiver: Caregiver;
}

export type LogEvent = PottyEvent | MealEvent | NapEvent | DownstairsEvent | SpecialEvent | IncidentEvent;

// ---------- Training ----------

export type TrainingOutcome = "easy-win" | "neutral" | "too-hard" | "needs-easier-step";

export interface TrainingStage {
  id: string;
  title: string;
  description?: string;
}

export interface TrainingPlan {
  id: string;
  name: string;
  goal: string;
  whyItMatters: string;
  stages: TrainingStage[];
  currentStageIndex: number;
  freeformNotes: string;
  reminderEnabled: boolean;
  archived?: boolean;
}

export interface TrainingSession {
  id: string;
  timestamp: ISODateTime;
  planId: string;
  skillLabel: string;
  durationMinutes: number;
  caregiver: Caregiver;
  setting: string;
  reward: string;
  outcome: TrainingOutcome;
  notes?: string;
  repeatNextTime: boolean;
}

export interface CueEntry {
  id: string;
  cue: string;
  meaning: string;
  usedBy: Caregiver[];
  /** How reliably Stryder responds to this cue, 1 (just introduced) to 5
   * (fully reliable). Undefined means not yet rated. */
  progress?: 1 | 2 | 3 | 4 | 5;
}

/** Freeform notes on what Stryder prefers — not a log, just a running
 * reference caregivers jot down and update over time (Training > Treats). */
export interface TreatPreferences {
  chews: string;
  treats: string;
}

/** Daily meal times (Training > Scheduled Meals) — a wall-clock "HH:MM",
 * 24-hour, no date/timezone, since a slot repeats every day. Undefined
 * means that slot has no reminder set. Distinct from MealEvent (the actual
 * logged meal in Log) — this is only ever a recurring reminder time. */
export interface ScheduledMealTimes {
  breakfast?: string;
  lunch?: string;
  dinner?: string;
}

/** A dog Stryder has met — a running index caregivers can jot notes on and
 * check owner contact info from later (Training > Friends). */
export interface DogFriend {
  id: string;
  name: string;
  age: string;
  /** Breed and coat/color, kept as one freeform field per how caregivers
   * actually describe a dog ("Golden retriever, cream coat"). */
  breedAndColor: string;
  personality: string;
  meetingOccasion: string;
  ownerName: string;
  ownerPhone: string;
}

// ---------- Health ----------

/** A vet/vaccine document a caregiver uploaded — a photo or PDF of the
 * actual paperwork (rabies certificate, vet invoice, etc.) rather than a
 * structured record someone re-typed by hand. The file itself lives in
 * Supabase Storage (public bucket, see lib/supabase.ts); only its URL and
 * a little metadata live here. */
export interface VaccineRecord {
  id: string;
  name: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string; // ISO
  caregiver: Caregiver;
}

export interface InsuranceInfo {
  provider: string;
  policyNumber: string;
  effectiveDate: string;
  renewalDate: string;
  deductible: string;
  reimbursementPercent: string;
  annualLimit: string;
  claimNotes: string;
  reminderEnabled: boolean;
}

export interface HealthProfile {
  vetName: string;
  vetPhone: string;
  emergencyVetName: string;
  emergencyVetPhone: string;
  microchipNumber: string;
  currentFood: string;
  sensitivities: string;
  currentMedications: string;
  notes: string;
}

// ---------- Profile / caregivers / handoff ----------

export interface PuppyProfile {
  name: string;
  birthday: string; // yyyy-mm-dd
  breed: string;
  currentWeightLbs: string;
  photoPlaceholder: boolean;
}

/** A dated photo for tracking growth/progress over time (More > Photos).
 * The file itself lives in Supabase Storage (public bucket, see
 * lib/supabase.ts); only its URL and a little metadata live here — same
 * pattern as VaccineRecord. `date` defaults to the day it was uploaded but
 * is editable, so backfilling older photos onto the right point in the
 * timeline doesn't require re-dating them externally first. */
export interface GrowthPhoto {
  id: string;
  date: string; // yyyy-mm-dd
  caption?: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string; // ISO — when the file was actually uploaded, distinct from `date`
  caregiver: Caregiver;
}

export interface CaregiverProfile {
  id: Caregiver;
  displayName: string;
}

export interface HandoffState {
  onDuty: Caregiver;
  note: string;
  updatedAt: ISODateTime;
}

export type SchedulePeriod = "morning" | "afternoon" | "evening" | "overnight";

export interface ScheduleBlock {
  id: string;
  period: SchedulePeriod;
  text: string;
}

// ---------- Settings ----------

/** Caregiver-adjustable thresholds for the Today page's "what might be
 * next" nudges — see computeNudges in lib/rules.ts, which is the single
 * source of truth for how these are used and what they default to. */
export interface NudgeThresholds {
  pottyGapHours: number;
  awakeStretchHours: number;
  mealGapHours: number;
}

export interface AppSettings {
  theme: "light" | "dark" | "system";
  hideAnalytics: boolean;
  remindersEnabled: boolean;
  nudgeThresholds: NudgeThresholds;
}

// ---------- Root ----------

export interface AppData {
  version: 1;
  puppy: PuppyProfile;
  photos: GrowthPhoto[];
  caregivers: CaregiverProfile[];
  handoff: HandoffState;
  schedule: ScheduleBlock[];
  pottyEvents: PottyEvent[];
  mealEvents: MealEvent[];
  napEvents: NapEvent[];
  downstairsTrips: DownstairsEvent[];
  events: SpecialEvent[];
  incidentEvents: IncidentEvent[];
  trainingPlans: TrainingPlan[];
  trainingSessions: TrainingSession[];
  cues: CueEntry[];
  treatPreferences: TreatPreferences;
  scheduledMeals: ScheduledMealTimes;
  friends: DogFriend[];
  vaccines: VaccineRecord[];
  insurance: InsuranceInfo;
  health: HealthProfile;
  settings: AppSettings;
  dismissedNudges: string[];
}

export type EntryKind = "potty" | "meal" | "nap" | "incident" | "training";
