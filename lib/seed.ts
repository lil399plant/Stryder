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
        id: "outdoor-potty-routine",
        name: "Outdoor potty routine",
        goal: "Reliable, prompt elimination on outdoor trips.",
        whyItMatters:
          "A studio apartment means every potty trip is a real outing — a predictable routine lowers accidents and stress for everyone.",
        stages: [
          { id: "s1", title: "Same door, same route to the usual spot" },
          { id: "s2", title: "Add a consistent cue (\"go potty\") at the spot" },
          { id: "s3", title: "Reward within seconds of going" },
          { id: "s4", title: "Generalize to the alternate spot" },
        ],
        currentStageIndex: 0,
        freeformNotes: "",
        reminderEnabled: false,
      },
      {
        id: "crate-comfort",
        name: "Crate comfort",
        goal: "Stryder rests calmly in the crate, door open or closed, without distress.",
        whyItMatters:
          "Crate comfort makes vet visits, travel, and quiet independent time far less stressful — for him and for us.",
        stages: [
          { id: "s1", title: "Explore crate with door open" },
          { id: "s2", title: "Eat in crate with door open" },
          { id: "s3", title: "Brief closed door, caregiver nearby" },
          { id: "s4", title: "Calm rest with caregiver moving around" },
          { id: "s5", title: "Short caregiver absence" },
        ],
        currentStageIndex: 0,
        freeformNotes: "",
        reminderEnabled: false,
      },
      {
        id: "independent-settling",
        name: "Independent settling",
        goal: "Stryder can settle and rest without needing a caregiver right next to him.",
        whyItMatters: "Two caregivers in one studio means he needs to be okay on his own sometimes.",
        stages: [
          { id: "s1", title: "Settle on a mat with a chew, caregiver in the room" },
          { id: "s2", title: "Caregiver moves further away while he settles" },
          { id: "s3", title: "Caregiver briefly out of sight" },
        ],
        currentStageIndex: 0,
        freeformNotes: "",
        reminderEnabled: false,
      },
      {
        id: "calm-pen-time",
        name: "Calm pen time",
        goal: "Stryder can spend short stretches in the pen calmly, without escalating to whining.",
        whyItMatters: "Gives caregivers a safe, contained option during cooking, calls, or chores.",
        stages: [
          { id: "s1", title: "Pen time with a chew, caregiver visible" },
          { id: "s2", title: "Short pen time while caregiver is out of the room" },
          { id: "s3", title: "Longer stretches during normal apartment activity" },
        ],
        currentStageIndex: 0,
        freeformNotes: "",
        reminderEnabled: false,
      },
      {
        id: "button-bell-potty-signal",
        name: "Button / bell potty signal",
        goal: "A clear, consistent way for Stryder to signal he needs to go out.",
        whyItMatters: "Reduces guesswork and missed signals in a small apartment.",
        stages: [
          { id: "s1", title: "Introduce the bell near the door, pair with going outside" },
          { id: "s2", title: "Prompt a nose touch before every outdoor trip" },
          { id: "s3", title: "Wait for an unprompted touch" },
        ],
        currentStageIndex: 0,
        freeformNotes: "",
        reminderEnabled: false,
      },
      {
        id: "leash-harness-handling",
        name: "Leash / harness handling",
        goal: "Stryder accepts the harness calmly and walks without excessive pulling or freezing.",
        whyItMatters: "Every outing starts with the harness — comfort here sets the tone for the whole walk.",
        stages: [
          { id: "s1", title: "Harness on indoors, treats, no walk attached" },
          { id: "s2", title: "Wear harness briefly during calm play" },
          { id: "s3", title: "Leash attached indoors" },
          { id: "s4", title: "Short outdoor sessions" },
        ],
        currentStageIndex: 0,
        freeformNotes: "",
        reminderEnabled: false,
      },
      {
        id: "calm-around-pigeons",
        name: "Calm around pigeons / outdoor distractions",
        goal: "Stryder can notice pigeons, dogs, or novelty without fixating or spiraling.",
        whyItMatters: "NYC sidewalks are full of stimulation — this is about giving him tools, not suppressing curiosity.",
        stages: [
          { id: "s1", title: "Notice at a distance, reward disengagement" },
          { id: "s2", title: "Shrink the distance gradually" },
          { id: "s3", title: "Hold attention near mild distraction" },
        ],
        currentStageIndex: 0,
        freeformNotes: "",
        reminderEnabled: false,
      },
      {
        id: "body-handling",
        name: "Body handling: paws, ears, collar, brushing",
        goal: "Stryder is comfortable being touched and handled for routine care.",
        whyItMatters: "Makes grooming, vet exams, and nail trims far less stressful long-term.",
        stages: [
          { id: "s1", title: "Brief touches paired with treats" },
          { id: "s2", title: "Longer holds — paws, ears" },
          { id: "s3", title: "Simulate nail trim / brushing motion" },
        ],
        currentStageIndex: 0,
        freeformNotes: "",
        reminderEnabled: false,
      },
      {
        id: "leave-it-chew-redirection",
        name: "Leave it / chew redirection",
        goal: "Stryder reliably disengages from off-limits items and redirects to an approved chew.",
        whyItMatters: "Borzoi puppies chew a lot — a strong \"leave it\" protects both him and the apartment.",
        stages: [
          { id: "s1", title: "\"Leave it\" with low-value items" },
          { id: "s2", title: "Practice with higher-value items" },
          { id: "s3", title: "Generalize around the apartment unprompted" },
        ],
        currentStageIndex: 0,
        freeformNotes: "",
        reminderEnabled: false,
      },
      {
        id: "caregiver-handoff-consistency",
        name: "Caregiver handoff consistency",
        goal: "Cues, routines, and expectations stay consistent no matter who's on duty.",
        whyItMatters: "Two caregivers means consistency has to be intentional, not assumed.",
        stages: [
          { id: "s1", title: "Shared cue dictionary in use by both caregivers" },
          { id: "s2", title: "Daily handoff note used consistently" },
          { id: "s3", title: "Weekly check-in on what's working" },
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
