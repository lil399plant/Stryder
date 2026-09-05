import { makeId } from "./id";
import type { AppData } from "./types";
import { DEFAULT_NUDGE_THRESHOLDS } from "./rules";

// The app's starting state for a brand-new install (or after "Reset").
// No hypothetical/fabricated logs — every event array starts empty so the
// timeline, calendar, and Patterns page are genuinely blank until real
// entries are logged or imported. What's kept is real facts (Stryder's
// name/breed/age) and reusable scaffolding the user asked for by name in
// the original spec (training plan stages, the cue dictionary, schedule
// block labels) — none of that is a "log," it's the app's template.

function ageAdjustedBirthday(now: Date, weeksOld: number): string {
  const d = new Date(now);
  d.setDate(d.getDate() - weeksOld * 7);
  return d.toISOString().slice(0, 10);
}

export function buildStarterData(): AppData {
  const now = new Date();

  return {
    version: 1,
    puppy: {
      name: "Stryder",
      birthday: ageAdjustedBirthday(now, 11), // ~11 weeks old
      breed: "Borzoi",
      currentWeightLbs: "",
      photoPlaceholder: true,
    },
    photos: [],
    caregivers: [
      { id: "me", displayName: "Me" },
      { id: "ribo", displayName: "Ribo" },
    ],
    handoff: {
      onDuty: "me",
      note: "",
      updatedAt: now.toISOString(),
    },
    schedule: [
      { id: makeId(), period: "morning", text: "" },
      { id: makeId(), period: "afternoon", text: "" },
      { id: makeId(), period: "evening", text: "" },
      { id: makeId(), period: "overnight", text: "" },
    ],
    pottyEvents: [],
    mealEvents: [],
    napEvents: [],
    downstairsTrips: [],
    events: [],
    incidentEvents: [],
    trainingPlans: [
      {
        id: "cgc-friendly-stranger",
        name: "CGC 1: Accepting a friendly stranger",
        goal: "Stryder greets an approaching stranger calmly at the handler's side — no jumping, lunging, resentment, or shyness.",
        whyItMatters:
          "First item on the AKC Canine Good Citizen test, and the pattern behind every doorman, delivery person, and neighbor encounter.",
        stages: [
          { id: "s1", title: "Sit calmly at the handler's side while a stranger approaches and greets the handler, not the dog" },
          { id: "s2", title: "Hold position through a brief handler-to-stranger exchange (a \"pretend handshake\")" },
          { id: "s3", title: "No jumping, rushing, or shyness across a variety of strangers" },
          { id: "s4", title: "Generalize to real everyday strangers (doorman, delivery, neighbors)" },
        ],
        currentStageIndex: 0,
        freeformNotes: "",
        reminderEnabled: false,
      },
      {
        id: "cgc-sit-for-petting",
        name: "CGC 2: Sitting politely for petting",
        goal: "Stryder accepts being petted on the head and body by a friendly stranger without shying away or jumping up.",
        whyItMatters: "Needed for vets, groomers, and every friend who wants to say hi.",
        stages: [
          { id: "s1", title: "Accept a hand toward the head from a seated position with a familiar person" },
          { id: "s2", title: "Stay settled through petting from a mild stranger" },
          { id: "s3", title: "Generalize across different people (appearance, voice, height)" },
          { id: "s4", title: "Hold position through petting with mild ambient distraction" },
        ],
        currentStageIndex: 0,
        freeformNotes: "",
        reminderEnabled: false,
      },
      {
        id: "cgc-appearance-grooming",
        name: "CGC 3: Appearance and grooming",
        goal: "Stryder allows a stranger (groomer, vet) to brush him, check his ears, and pick up each paw without struggling.",
        whyItMatters: "Every vet visit and grooming session depends on this — sets him up to be an easy patient for life.",
        stages: [
          { id: "s1", title: "Accept brushing/combing from the handler" },
          { id: "s2", title: "Accept ear checks and paw handling from the handler" },
          { id: "s3", title: "Accept the same handling from an unfamiliar person" },
          { id: "s4", title: "Hold still for a full head-to-tail once-over without excessive wiggling" },
        ],
        currentStageIndex: 0,
        freeformNotes: "",
        reminderEnabled: false,
      },
      {
        id: "cgc-loose-leash-walk",
        name: "CGC 4: Out for a walk (loose leash)",
        goal: "Stryder walks attentively at the handler's side on a loose leash, responding to turns and stops without constant tight pulling.",
        whyItMatters: "The CGC's core leash-walking test, and the single most-used skill on every outing.",
        stages: [
          { id: "s1", title: "Loose leash for short stretches indoors" },
          { id: "s2", title: "Respond to a stop without needing a sit cue" },
          { id: "s3", title: "Follow a right turn, left turn, and about-turn on leash" },
          { id: "s4", title: "Maintain attentiveness and a loose leash on a real outdoor route with turns" },
        ],
        currentStageIndex: 0,
        freeformNotes: "",
        reminderEnabled: false,
      },
      {
        id: "cgc-walking-through-crowd",
        name: "CGC 5: Walking through a crowd",
        goal: "Stryder moves politely near several people without jumping on them, straining, or hiding behind the handler.",
        whyItMatters: "NYC sidewalks are basically this test every single day — directly the environment he lives in.",
        stages: [
          { id: "s1", title: "Walk calmly past one person at a moderate distance" },
          { id: "s2", title: "Walk past multiple people at a closer distance without straining" },
          { id: "s3", title: "Tolerate brief interest in a passerby, then move on promptly" },
          { id: "s4", title: "Navigate a genuinely busy sidewalk calmly" },
        ],
        currentStageIndex: 0,
        freeformNotes: "",
        reminderEnabled: false,
      },
      {
        id: "cgc-sit-down-stay",
        name: "CGC 6: Sit and down on cue / staying in place",
        goal: "Stryder sits and downs on a single cue, and holds a stay while the handler walks away and returns.",
        whyItMatters: "Foundation obedience skill and the CGC's core impulse-control test.",
        stages: [
          { id: "s1", title: "Reliable sit on cue" },
          { id: "s2", title: "Reliable down on cue" },
          { id: "s3", title: "Hold a stay (sit or down) while the handler steps a few feet away" },
          { id: "s4", title: "Hold a stay while the handler walks to the end of a 20-ft line and returns" },
        ],
        currentStageIndex: 0,
        freeformNotes: "",
        reminderEnabled: false,
      },
      {
        id: "cgc-come-when-called",
        name: "CGC 7: Coming when called",
        goal: "Stryder comes reliably to the handler from about 10 feet away when called, even with mild distraction.",
        whyItMatters: "A strong recall is a safety fundamental as much as a test item.",
        stages: [
          { id: "s1", title: "Recall from a few feet with no distraction" },
          { id: "s2", title: "Recall from 10 feet, using body language and encouragement" },
          { id: "s3", title: "Recall despite a mild distraction (another person nearby)" },
          { id: "s4", title: "Recall on the first call, without needing to be reeled in on a line" },
        ],
        currentStageIndex: 0,
        freeformNotes: "",
        reminderEnabled: false,
      },
      {
        id: "cgc-reaction-to-dog",
        name: "CGC 8: Reaction to another dog",
        goal: "Stryder shows only casual interest in another dog passing at a distance, without lunging, jumping, or fixating.",
        whyItMatters: "One of the harder skills for a lot of dogs — matters for every walk in a dog-dense city.",
        stages: [
          { id: "s1", title: "Notice another dog at a distance, stay engaged with the handler" },
          { id: "s2", title: "Hold position while the handler exchanges brief pleasantries with another handler nearby" },
          { id: "s3", title: "Allow a dog to pass at roughly 15 ft without pulling toward it" },
          { id: "s4", title: "Stay settled as the other dog and handler walk away" },
        ],
        currentStageIndex: 0,
        freeformNotes: "",
        reminderEnabled: false,
      },
      {
        id: "cgc-reaction-to-distractions",
        name: "CGC 9: Reaction to distractions",
        goal: "Stryder stays composed through a sudden sound or visual surprise (dropped object, passing bike, mobility equipment) without panicking or fixating.",
        whyItMatters: "City life is full of exactly these — sirens, doors, carts, bikes.",
        stages: [
          { id: "s1", title: "Tolerate a mild sound distraction at a distance and recover quickly" },
          { id: "s2", title: "Tolerate a mild visual distraction (person or object passing) at a distance" },
          { id: "s3", title: "Handle a closer-range version of each with only casual interest" },
          { id: "s4", title: "Recover within a few seconds of a genuine startle, no prolonged pulling or barking" },
        ],
        currentStageIndex: 0,
        freeformNotes: "",
        reminderEnabled: false,
      },
      {
        id: "cgc-supervised-separation",
        name: "CGC 10: Supervised separation",
        goal: "Stryder can be held by a trusted person for a few minutes while the handler is out of sight, without excessive distress.",
        whyItMatters: "Builds independence and confidence — relevant for vet drop-offs, groomer visits, and anyone else briefly watching him.",
        stages: [
          { id: "s1", title: "Brief handoff to a trusted person with the handler still visible" },
          { id: "s2", title: "Handler out of sight for under a minute" },
          { id: "s3", title: "Handler out of sight for a few minutes, dog supervised by another person" },
          { id: "s4", title: "Full 3-minute supervised separation without pacing, barking, or excessive distress" },
        ],
        currentStageIndex: 0,
        freeformNotes: "",
        reminderEnabled: false,
      },
    ],
    trainingSessions: [],
    cues: [
      { id: makeId(), cue: "Outside", meaning: "Leaving for potty", usedBy: ["me", "ribo"] },
      { id: makeId(), cue: "Go potty", meaning: "Eliminate at the outdoor spot", usedBy: ["me", "ribo"] },
      { id: makeId(), cue: "This way", meaning: "Disengage and move with caregiver", usedBy: ["me", "ribo"] },
      { id: makeId(), cue: "Crate / Bed", meaning: "Enter calm rest space", usedBy: ["me", "ribo"] },
      { id: makeId(), cue: "Leave it", meaning: "Disengage from an item", usedBy: ["me", "ribo"] },
    ],
    treatPreferences: { chews: "", treats: "" },
    scheduledMeals: {},
    friends: [],
    vaccines: [],
    insurance: {
      provider: "",
      policyNumber: "",
      effectiveDate: "",
      renewalDate: "",
      deductible: "",
      reimbursementPercent: "",
      annualLimit: "",
      claimNotes: "",
      reminderEnabled: false,
    },
    health: {
      vetName: "",
      vetPhone: "",
      emergencyVetName: "",
      emergencyVetPhone: "",
      microchipNumber: "",
      currentFood: "",
      sensitivities: "",
      currentMedications: "",
      notes: "",
    },
    settings: {
      theme: "system",
      hideAnalytics: false,
      remindersEnabled: false,
      nudgeThresholds: { ...DEFAULT_NUDGE_THRESHOLDS },
    },
    dismissedNudges: [],
  };
}
