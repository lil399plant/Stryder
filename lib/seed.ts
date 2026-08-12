import { makeId } from "./id";
import type {
  AppData,
  IncidentEvent,
  MealEvent,
  NapEvent,
  OutingEvent,
  PottyEvent,
  TrainingPlan,
  TrainingSession,
} from "./types";

// Builds a few days of plausible sample history so the timeline and
// analytics look useful the first time the app is opened. Timestamps are
// computed relative to "now" at load time, clamped so nothing in "today"
// is set in the future.

function atTime(daysAgo: number, hour: number, minute: number, now: Date): Date {
  const d = new Date(now);
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  return d;
}

function iso(d: Date): string {
  return d.toISOString();
}

export function buildSeedData(): AppData {
  const now = new Date();

  const includeIfPast = (d: Date) => d.getTime() <= now.getTime();

  const pottyEvents: PottyEvent[] = [];
  const mealEvents: MealEvent[] = [];
  const napEvents: NapEvent[] = [];
  const outings: OutingEvent[] = [];
  const incidentEvents: IncidentEvent[] = [];

  // ---- Day plan template used for the last 3 days, lightly varied ----
  const dayPlans = [
    { daysAgo: 2, caregiverBias: "me" as const },
    { daysAgo: 1, caregiverBias: "ribo" as const },
    { daysAgo: 0, caregiverBias: "me" as const },
  ];

  for (const { daysAgo, caregiverBias } of dayPlans) {
    const alt = caregiverBias === "me" ? "ribo" : "me";

    // Overnight -> morning wake potty
    const wake = atTime(daysAgo, 7, 10, now);
    if (includeIfPast(wake)) {
      pottyEvents.push({
        id: makeId(),
        kind: "potty",
        timestamp: iso(wake),
        type: "pee",
        location: "usual-spot",
        outdoorTripType: "direct-potty-trip",
        success: "went-promptly",
        tags: [],
        caregiver: caregiverBias,
      });
    }

    // Breakfast
    const breakfast = atTime(daysAgo, 7, 30, now);
    if (includeIfPast(breakfast)) {
      mealEvents.push({
        id: makeId(),
        kind: "meal",
        timestamp: iso(breakfast),
        mealType: "breakfast",
        foodName: "Puppy kibble + warm water",
        amount: "3/4 cup",
        appetite: daysAgo === 1 ? "most" : "finished",
        addOns: daysAgo === 0 ? ["plain-greek-yogurt"] : [],
        newFood: false,
        usedForCrateTraining: false,
        usedAsPottyReward: false,
        caregiver: caregiverBias,
      });
    }

    // Post-breakfast potty
    const postBreakfastPotty = atTime(daysAgo, 8, 5, now);
    if (includeIfPast(postBreakfastPotty)) {
      pottyEvents.push({
        id: makeId(),
        kind: "potty",
        timestamp: iso(postBreakfastPotty),
        type: "poop",
        location: "usual-spot",
        outdoorTripType: "after-meal",
        success: "went-promptly",
        poopQuality: "normal",
        tags: [],
        caregiver: caregiverBias,
      });
    }

    // Morning nap, kitchen
    const napStart1 = atTime(daysAgo, 9, 0, now);
    const napEnd1 = atTime(daysAgo, 10, 15, now);
    if (includeIfPast(napStart1)) {
      napEvents.push({
        id: makeId(),
        kind: "nap",
        startTime: iso(napStart1),
        endTime: includeIfPast(napEnd1) ? iso(napEnd1) : undefined,
        location: "kitchen",
        settling: "fell-asleep-independently",
        quality: "normal",
        caregiver: caregiverBias,
      });
    }

    // Wake potty
    const wakePotty1 = atTime(daysAgo, 10, 20, now);
    if (includeIfPast(wakePotty1)) {
      pottyEvents.push({
        id: makeId(),
        kind: "potty",
        timestamp: iso(wakePotty1),
        type: "pee",
        location: "usual-spot",
        outdoorTripType: "after-nap",
        success: "went-promptly",
        tags: [],
        caregiver: alt,
      });
    }

    // Midday walk / potty circuit — occasional pigeon excitement
    const middayWalkStart = atTime(daysAgo, 12, 0, now);
    const middayWalkEnd = atTime(daysAgo, 12, 25, now);
    const middayWalk = atTime(daysAgo, 12, 15, now);
    if (includeIfPast(middayWalk)) {
      const hadPigeons = daysAgo === 1;
      pottyEvents.push({
        id: makeId(),
        kind: "potty",
        timestamp: iso(middayWalk),
        type: "pee",
        location: "alternate-outdoor",
        outdoorTripType: "potty-circuit",
        success: hadPigeons ? "distracted" : "went-promptly",
        tags: hadPigeons ? ["pigeons", "excitement"] : [],
        notes: hadPigeons ? "Spotted pigeons on the walk, took a bit to settle before going." : undefined,
        caregiver: alt,
      });
      outings.push({
        id: makeId(),
        kind: "outing",
        startTime: iso(middayWalkStart),
        endTime: includeIfPast(middayWalkEnd) ? iso(middayWalkEnd) : undefined,
        outdoorTripType: "potty-circuit",
        notes: hadPigeons ? "Midday loop — pigeons across the street." : undefined,
        caregiver: alt,
      });
    }

    // Lunch (light)
    const lunch = atTime(daysAgo, 12, 45, now);
    if (includeIfPast(lunch)) {
      mealEvents.push({
        id: makeId(),
        kind: "meal",
        timestamp: iso(lunch),
        mealType: "lunch",
        foodName: "Puppy kibble",
        amount: "1/2 cup",
        appetite: "finished",
        addOns: [],
        newFood: false,
        usedForCrateTraining: false,
        usedAsPottyReward: false,
        caregiver: alt,
      });
    }

    // Afternoon nap, foot of bed
    const napStart2 = atTime(daysAgo, 13, 30, now);
    const napEnd2 = atTime(daysAgo, 15, 0, now);
    if (includeIfPast(napStart2)) {
      napEvents.push({
        id: makeId(),
        kind: "nap",
        startTime: iso(napStart2),
        endTime: includeIfPast(napEnd2) ? iso(napEnd2) : undefined,
        location: "foot-of-bed",
        settling: daysAgo === 2 ? "needed-chew-lick-mat" : "fell-asleep-independently",
        quality: daysAgo === 2 ? "short" : "normal",
        notes: daysAgo === 2 ? "Fussy going down, settled with the lick mat." : undefined,
        caregiver: caregiverBias,
      });
    }

    const wakePotty2 = atTime(daysAgo, 15, 5, now);
    if (includeIfPast(wakePotty2)) {
      pottyEvents.push({
        id: makeId(),
        kind: "potty",
        timestamp: iso(wakePotty2),
        type: "both",
        location: "usual-spot",
        outdoorTripType: "after-nap",
        success: "went-promptly",
        poopQuality: "normal",
        tags: [],
        caregiver: caregiverBias,
      });
    }

    // Afternoon play / training
    const trainingTime = atTime(daysAgo, 16, 0, now);
    if (includeIfPast(trainingTime)) {
      // handled below in trainingSessions
    }

    // Dinner
    const dinner = atTime(daysAgo, 18, 0, now);
    if (includeIfPast(dinner)) {
      mealEvents.push({
        id: makeId(),
        kind: "meal",
        timestamp: iso(dinner),
        mealType: "dinner",
        foodName: "Puppy kibble + pumpkin",
        amount: "3/4 cup",
        appetite: "finished",
        addOns: ["pumpkin"],
        newFood: false,
        usedForCrateTraining: false,
        usedAsPottyReward: false,
        caregiver: alt,
      });
    }

    const postDinnerPotty = atTime(daysAgo, 18, 40, now);
    if (includeIfPast(postDinnerPotty)) {
      pottyEvents.push({
        id: makeId(),
        kind: "potty",
        timestamp: iso(postDinnerPotty),
        type: "pee",
        location: "usual-spot",
        outdoorTripType: "after-meal",
        success: "went-promptly",
        tags: [],
        caregiver: alt,
      });
    }

    // Evening couch nap (occasional)
    if (daysAgo !== 0) {
      const napStart3 = atTime(daysAgo, 19, 30, now);
      const napEnd3 = atTime(daysAgo, 20, 15, now);
      if (includeIfPast(napStart3)) {
        napEvents.push({
          id: makeId(),
          kind: "nap",
          startTime: iso(napStart3),
          endTime: includeIfPast(napEnd3) ? iso(napEnd3) : undefined,
          location: "couch",
          settling: "needed-caregiver-nearby",
          quality: "normal",
          caregiver: caregiverBias,
        });
      }
    }

    // Late evening potty + bedtime
    const lateWalkStart = atTime(daysAgo, 21, 20, now);
    const lateWalkEnd = atTime(daysAgo, 21, 40, now);
    const lateWalk = atTime(daysAgo, 21, 30, now);
    if (includeIfPast(lateWalk)) {
      pottyEvents.push({
        id: makeId(),
        kind: "potty",
        timestamp: iso(lateWalk),
        type: "both",
        location: "usual-spot",
        outdoorTripType: "before-bed",
        success: "went-promptly",
        poopQuality: "soft",
        tags: daysAgo === 1 ? ["long-play"] : [],
        caregiver: alt,
      });
      outings.push({
        id: makeId(),
        kind: "outing",
        startTime: iso(lateWalkStart),
        endTime: includeIfPast(lateWalkEnd) ? iso(lateWalkEnd) : undefined,
        outdoorTripType: "before-bed",
        caregiver: alt,
      });
    }

    // One accident on the "yesterday" seed day, near the door — realistic, not alarming
    if (daysAgo === 1) {
      const accidentTime = atTime(daysAgo, 17, 10, now);
      if (includeIfPast(accidentTime)) {
        pottyEvents.push({
          id: makeId(),
          kind: "potty",
          timestamp: iso(accidentTime),
          type: "accident",
          location: "inside-pad",
          success: "accident",
          tags: ["long-play", "excitement"],
          notes: "Missed the signal after a long play session — cleaned up, no big deal.",
          caregiver: caregiverBias,
        });
      }
    }
  }

  // ---- Training sessions across the seeded days ----
  const trainingSessions: TrainingSession[] = [];
  const trainingSeedPlan: {
    daysAgo: number;
    hour: number;
    minute: number;
    planId: string;
    skillLabel: string;
    duration: number;
    caregiver: "me" | "ribo";
    setting: string;
    reward: string;
    outcome: TrainingSession["outcome"];
    notes?: string;
    repeat: boolean;
  }[] = [
    {
      daysAgo: 2,
      hour: 16,
      minute: 0,
      planId: "crate-comfort",
      skillLabel: "Crate comfort — door open, eating meals inside",
      duration: 10,
      caregiver: "me",
      setting: "Studio, near the window",
      reward: "Kibble + chicken bits",
      outcome: "easy-win",
      notes: "Walked in on his own for dinner, no coaxing needed.",
      repeat: true,
    },
    {
      daysAgo: 1,
      hour: 16,
      minute: 15,
      planId: "outdoor-potty-routine",
      skillLabel: "Outdoor potty routine — direct trip to usual spot",
      duration: 8,
      caregiver: "ribo",
      setting: "Sidewalk outside building",
      reward: "Verbal praise",
      outcome: "neutral",
      notes: "Went, but took a full lap first.",
      repeat: false,
    },
    {
      daysAgo: 1,
      hour: 20,
      minute: 30,
      planId: "independent-settling",
      skillLabel: "Independent settling — chew mat on the floor bed",
      duration: 15,
      caregiver: "me",
      setting: "Studio, evening wind-down",
      reward: "Lick mat",
      outcome: "easy-win",
      notes: "Settled within a few minutes, stayed down.",
      repeat: true,
    },
    {
      daysAgo: 0,
      hour: 11,
      minute: 0,
      planId: "calm-around-pigeons",
      skillLabel: "Calm around pigeons — parallel walking at distance",
      duration: 6,
      caregiver: "ribo",
      setting: "Sidewalk, pigeons across the street",
      reward: "Chicken bits",
      outcome: "too-hard",
      notes: "Fixated hard, needed a lot of distance to reset.",
      repeat: false,
    },
  ];

  for (const s of trainingSeedPlan) {
    const t = atTime(s.daysAgo, s.hour, s.minute, now);
    if (includeIfPast(t)) {
      trainingSessions.push({
        id: makeId(),
        timestamp: iso(t),
        planId: s.planId,
        skillLabel: s.skillLabel,
        durationMinutes: s.duration,
        caregiver: s.caregiver,
        setting: s.setting,
        reward: s.reward,
        outcome: s.outcome,
        notes: s.notes,
        repeatNextTime: s.repeat,
      });
    }
  }

  // ---- One lightweight incident/observation ----
  const incidentTime = atTime(1, 17, 20, now);
  if (includeIfPast(incidentTime)) {
    incidentEvents.push({
      id: makeId(),
      kind: "incident",
      timestamp: iso(incidentTime),
      category: "overstimulation",
      severity: "note",
      note: "Got zoomies after the accident cleanup — settled on his own after a few minutes.",
      discussWithVet: false,
      caregiver: "me",
    });
  }
  const incidentTime2 = atTime(0, 9, 30, now);
  if (includeIfPast(incidentTime2)) {
    incidentEvents.push({
      id: makeId(),
      kind: "incident",
      timestamp: iso(incidentTime2),
      category: "chewing",
      severity: "note",
      note: "Chewed a corner of the bath mat — swapped in a chew toy, redirected easily.",
      discussWithVet: false,
      caregiver: "ribo",
    });
  }

  // ---- Training plans ----
  const trainingPlans: TrainingPlan[] = [
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
      currentStageIndex: 1,
      freeformNotes: "Mornings are the most reliable window so far.",
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
      currentStageIndex: 1,
      freeformNotes: "No fixed timeline — advancing only when he looks relaxed at the current stage.",
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
      freeformNotes: "Haven't started yet — considering a bell over a button.",
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
      currentStageIndex: 1,
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
      freeformNotes: "Pigeons are currently the hardest trigger — more than other dogs.",
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
      currentStageIndex: 1,
      freeformNotes: "Bath mat corner incident — redirected easily to a chew toy.",
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
  ];

  return {
    version: 1,
    puppy: {
      name: "Stryder",
      birthday: iso(atTime(77, 8, 0, now)).slice(0, 10), // ~11 weeks old
      breed: "Borzoi",
      currentWeightLbs: "19",
      photoPlaceholder: true,
    },
    caregivers: [
      { id: "me", displayName: "Me" },
      { id: "ribo", displayName: "Ribo" },
    ],
    handoff: {
      onDuty: "me",
      note: "Heading into work ~1pm — Ribo's on afternoon potty + nap watch.",
      updatedAt: iso(atTime(0, 8, 0, now)),
    },
    schedule: [
      { id: makeId(), period: "morning", text: "Potty, breakfast, quiet play, independent chew, nap." },
      { id: makeId(), period: "afternoon", text: "Potty circuit, lunch, short training rep, nap." },
      { id: makeId(), period: "evening", text: "Dinner, calm play, brief crate practice, wind-down." },
      { id: makeId(), period: "overnight", text: "Last potty before bed, settle in pen near the bed." },
    ],
    pottyEvents,
    mealEvents,
    napEvents,
    outings,
    incidentEvents,
    trainingPlans,
    trainingSessions,
    cues: [
      { id: makeId(), cue: "Outside", meaning: "Leaving for potty", usedBy: ["me", "ribo"] },
      { id: makeId(), cue: "Go potty", meaning: "Eliminate at the outdoor spot", usedBy: ["me", "ribo"] },
      { id: makeId(), cue: "This way", meaning: "Disengage and move with caregiver", usedBy: ["me", "ribo"] },
      { id: makeId(), cue: "Crate / Bed", meaning: "Enter calm rest space", usedBy: ["me", "ribo"] },
      { id: makeId(), cue: "Leave it", meaning: "Disengage from an item", usedBy: ["me", "ribo"] },
    ],
    vaccines: [
      {
        id: makeId(),
        name: "DHPP (2nd round)",
        dueDate: iso(atTime(-14, 9, 0, now)).slice(0, 10),
        status: "upcoming",
        isPlaceholder: true,
        notes: "Placeholder — confirm exact date with vet.",
      },
      {
        id: makeId(),
        name: "DHPP (1st round)",
        completedDate: iso(atTime(21, 9, 0, now)).slice(0, 10),
        status: "complete",
        isPlaceholder: true,
        vet: "Placeholder — vet name",
      },
      {
        id: makeId(),
        name: "Bordetella",
        dueDate: iso(atTime(-7, 9, 0, now)).slice(0, 10),
        status: "upcoming",
        isPlaceholder: true,
        notes: "Placeholder — confirm exact date with vet.",
      },
      {
        id: makeId(),
        name: "Rabies",
        dueDate: iso(atTime(-49, 9, 0, now)).slice(0, 10),
        status: "upcoming",
        isPlaceholder: true,
        notes: "Placeholder — typically due around 12–16 weeks, confirm with vet.",
      },
    ],
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
      currentFood: "Puppy kibble (large-breed puppy formula)",
      sensitivities: "None known yet",
      currentMedications: "None",
      notes: "",
    },
    settings: {
      theme: "system",
      hideAnalytics: false,
      remindersEnabled: false,
    },
    dismissedNudges: [],
  };
}
