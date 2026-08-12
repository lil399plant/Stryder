# Stryder 🐾

A calm, shared command center for two caregivers raising a puppy — built for **Me & Ribo** and their 11-week-old Borzoi, **Stryder**, in a NYC studio apartment.

Stryder is not a pet-wellness gamification app. It exists to answer two questions in under 10 seconds:

- **What does Stryder need next?**
- **What happened today?**

...and to make handing off "who's on Stryder" between two people effortless, without turning normal puppy variation into anxiety.

This is a **local-first MVP** — no accounts, no analytics pipeline. There's still no login and no per-user data: every screen reads/writes one shared household record. That record lives in your browser's `localStorage` by default, and optionally mirrors to **Redis** (see [Shared storage](#shared-storage-redis) below) so it's the same log on both caregivers' devices, not just one browser.

---

## Quick start

Requirements: Node.js 20.9+ and npm.

```bash
cd Stryder
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — it redirects to `/today`.

The app starts genuinely blank — no fabricated logs. First load writes a starter record (Stryder's real name/breed/age, the ten training plan templates, the cue dictionary) to `localStorage`; every event array (potty, meals, naps, outings, notes, training sessions, vaccines) is empty until you log something or import real data (More → Data → Import JSON).

**Production build:**

```bash
npm run build
npm run start
```

**Lint / typecheck:**

```bash
npm run lint
npx tsc --noEmit
```

### Resetting or starting fresh

Go to **More → Data export & import → Erase all data** to wipe everything back to the blank starter state. Or, in your browser devtools, delete the `stryder-data-v2` key from `localStorage`.

---

## Shared storage (Redis)

Without this section, Stryder still works fully — it just keeps each device's log to itself. Linking Redis makes it one shared log between caregivers.

**Recommended — via Vercel:** Project → **Storage** tab → **Create Database** → **Redis** (this is Upstash under the hood). Vercel injects `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` into the project automatically; redeploy (or it redeploys itself) and it's live — no copying secrets anywhere.

**Manual / local dev:** create a free database at [console.upstash.com](https://console.upstash.com), open its **REST API** tab, and copy those same two values into a `.env.local` file in this folder (see `.env.example`):

```bash
cp .env.example .env.local
# then fill in UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
```

**More → Data** shows a live "Shared storage connected" / "Local only" badge so you can confirm it's wired up. There's no auth in this version, so it's one record for the whole household (key `stryder:data`) — not per-user.

---

## Deploying

The repo is set up for Vercel:

1. Push this repo to GitHub (already done if you're reading this from the repo).
2. In Vercel: **Add New → Project**, import the GitHub repo, keep the auto-detected Next.js settings, deploy.
3. Optionally attach Redis as described above — the app works either way.

---

## What's in the app

Five areas, reachable from the bottom nav on mobile (a left sidebar on desktop):

1. **Today** — the main dashboard: a compact status strip (time since last pee/poop/meal, current state, who's on duty), four one-tap Quick Log buttons (Pee / Poop / Meal / Nap) plus a secondary "Log an accident" button, a rules-based (never medical, always dismissible) "what might be next" card, a vertical timeline of the day, a caregiver handoff card, and an editable "Today's plan" schedule.
2. **Log** — a Google Calendar-style **Day / Week / Month** view of everything logged. Naps and outings (walks) are duration blocks spanning their start–end time; pee, poop, meals, notes, and training sessions are point-in-time markers. Hover an event for a quick preview (tap on mobile) or click it to open and edit; clicking a day in Week/Month view jumps to that day. Adding an entry uses the same one-tap-default-plus-expandable-detail forms as everywhere else.
3. **Training** — ten default training plans (crate comfort, outdoor potty routine, calm around pigeons, etc.), each with a goal, a plain-language "why it matters," a manually-set stage tracker (no assumed timeline), a "tiny next step," session history, and a shared cue dictionary for caregiver consistency.
4. **Health** — vaccine/vet records, insurance info, and a private local-only health profile. Vaccine records start empty; anything you add can be marked as a placeholder until it's vet-confirmed.
5. **More** — Stryder's profile, caregiver names, a link to the cue dictionary and to Patterns (analytics), JSON export/import, appearance (light/dark/system) and "hide analytics" settings, and an About/privacy note.

A sixth screen, **Patterns** (`/analytics`, linked from More and from Today), shows non-judgmental visualizations — bathroom timing by day, time between potty trips, nap duration by location, appetite history, accident tags, training frequency, and a couple of cautiously-worded "what seems to help" observations. It's descriptive only: no medical claims, no causal language, and it can be hidden entirely from Settings.

### Design choices worth knowing about

- **Undo, not confirmation dialogs.** Quick Log actions apply immediately (that's the point — one tap) and show a 5-second Undo toast, rather than interrupting you with "are you sure?"
- **Every timestamp is editable.** Tap any logged entry to open its full edit form.
- **Accidents are informational, not alarming.** They're visually similar to routine potty entries — the restrained red accent is reserved for things flagged as an actual concern (an incident marked "needs follow-up" or "discuss with vet"), not normal puppy variation.
- **No push notifications, no streaks, no fake AI coaching.** Per-plan "reminder" toggles exist as a placeholder for a future version but don't currently trigger anything.

---

## Tech stack

- **Next.js 16** (App Router, TypeScript, all client-rendered — there's no server data source, so every page is a client component reading from the local store)
- **Tailwind CSS v4** (CSS-first `@theme` tokens in `app/globals.css` — no `tailwind.config.ts`)
- **Hand-rolled shadcn/ui-style primitives** in `components/ui/` (Button, Card, Sheet, Tabs, Switch, etc.) built with `class-variance-authority` + `tailwind-merge`, rather than pulling in Radix — kept the dependency surface small for an app this size
- **Lucide React** for icons
- **`localStorage` + optional Upstash Redis** for persistence (see [Shared storage](#shared-storage-redis)) — every device keeps a fast local copy, and if Redis is linked, one shared record syncs through it via a single API route. Everything is behind `lib/store.tsx`, so no screen talks to storage directly.

No accounts, no third-party analytics. `next build` is a standard Next.js server build (the one dynamic piece is `app/api/data/route.ts`, used only when Redis is configured).

---

## Data model

Everything lives in one root object, versioned and persisted as a single JSON blob under the `stryder-data-v2` key (bumped from v1 when fabricated demo logs were removed from the starter state — anything still holding v1 data is treated as stale and replaced). See [`lib/types.ts`](lib/types.ts) for the full, precisely-typed definitions — summarized here:

```ts
interface AppData {
  version: 1;
  puppy: PuppyProfile;              // name, birthday, breed, weight
  caregivers: CaregiverProfile[];   // "me" | "ribo" -> display name
  handoff: HandoffState;            // who's on duty + a note
  schedule: ScheduleBlock[];        // morning/afternoon/evening/overnight plan text

  pottyEvents: PottyEvent[];        // pee / poop / both / accident — a point in time
  mealEvents: MealEvent[];          // a point in time
  napEvents: NapEvent[];            // startTime, optional endTime = "in progress" — a duration
  outings: OutingEvent[];           // the walk itself — startTime/endTime, a duration
  incidentEvents: IncidentEvent[];  // lightweight observations, never diagnostic

  trainingPlans: TrainingPlan[];    // goal, stages, current stage index, notes
  trainingSessions: TrainingSession[];
  cues: CueEntry[];                 // shared cue dictionary

  vaccines: VaccineRecord[];
  insurance: InsuranceInfo;
  health: HealthProfile;            // private, local-only

  settings: AppSettings;            // theme, hideAnalytics, remindersEnabled
  dismissedNudges: string[];        // day-scoped ids of dismissed "next needs" cards
}
```

Design notes:

- **One root object, one storage key.** This is what makes JSON export/import trivial (`lib/export.ts` + the Data section in More): export is "serialize `AppData`," import is "validate `version === 1` and replace it."
- **A single external store, not React Context.** `lib/store.tsx` exposes `useStore()` via `useSyncExternalStore`, backed by a module-level singleton plus a `localStorage`-syncing `mutate()` function. This avoids the classic SSR/hydration trap of reading `localStorage` in a `useState` initializer, without needing a `Provider` wrapper.
- **Every mutation is additive/replaceable, never destructive by default.** Quick Log actions return the new entry's id so the calling screen can offer an exact-inverse Undo (e.g. delete-the-entry-just-added), rather than a generic "rewind everything" undo stack.
- **`lib/rules.ts`** contains the entire "what might be next" logic — a handful of plain elapsed-time rules (e.g. "2+ hours since any potty" or "just woke from a nap"), each carrying its own plain-language `basis` string so the card is transparent about why it's showing, never a black box.
- **`lib/analytics.ts`** contains every Patterns computation — counts and averages over what's actually been logged, nothing predictive or inferred.
- **`lib/timeline.ts`** defines the single `TimelineItem` union every screen renders from (Today's vertical timeline, the Log calendar, the edit sheets) — `nap` and `outing` are duration items, everything else is a point in time, so both views always agree.

---

## Project structure

```
app/
  today/ log/ training/ training/cues/ health/ more/ analytics/   # routes
  api/data/route.ts   # GET/PUT the shared Redis record (no-ops if unconfigured)
  layout.tsx        # shell: ToastProvider + AppShell (nav, theme)
  manifest.ts        # PWA manifest (installable-looking)
lib/
  types.ts           # all data types
  store.tsx           # external store + localStorage/Redis sync + typed actions
  redis.ts             # Upstash client, only ever imported server-side
  seed.ts             # blank-starter-state builder (no fabricated logs)
  rules.ts            # "next likely needs" rules engine
  analytics.ts         # Patterns page computations
  timeline.ts          # unified timeline item type + label maps
  calendar-grid.ts      # day/week/month date-grid math for the Log calendar
  options.ts           # chip option lists for forms
  time.ts / id.ts / export.ts / utils.ts / useSyncedState.ts
components/
  ui/          # Button, Card, Sheet, Tabs, Switch, ChoiceChips, Toast, …
  nav/         # BottomNav (mobile), SideNav (desktop)
  shell/       # AppShell
  theme/       # ThemeController (applies light/dark/system)
  today/       # DateHeader, StatusStrip, QuickLogButtons, NextNeedsCard, HandoffCard, PlanBlocks
  log/         # BathroomForm, MealForm, NapForm, OutingForm, IncidentForm, timelineVisual (shared
               # icon/color/label rules), TimelineRow, GroupedTimeline, Add/Edit sheets
  calendar/    # CalendarView pieces: DayView, WeekView, MonthView, DayColumn, EventBlock, EventTooltip
  training/    # PlanCard, PlanDetail, SessionForm, CueDictionary
  health/      # VaccineList/Form, InsuranceForm, ProfileForm
  more/        # ProfileSection, CaregiversSection, DataSection, SettingsSection, AboutSection
  analytics/   # Bars (HBar/VBarChart), BathroomTimingCard, OtherCards
```

---

## What this is not

- Not a medical or diagnostic tool, and it never claims to be. Health-area copy and the About/privacy note in More say this explicitly.
- Not connected to a vet, insurer, or any external service — vaccine records you add can be flagged as placeholders until they're vet-confirmed.
- Not multi-user. If Redis is linked, both caregivers see the *same* household record (no per-person accounts or permissions); without Redis, data stays on the device/browser it was entered on — use Export/Import (More → Data) to move it manually.
