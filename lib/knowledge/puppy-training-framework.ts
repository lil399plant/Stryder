// Puppy-training knowledge base for AI Triage — see app/api/triage/route.ts.
//
// This is an original synthesis distilling practical training/behavior
// guidance from four books the user owns:
//   - Sophia Yin, "Perfect Puppy in 7 Days"
//   - Patricia McConnell, "The Other End of the Leash"
//   - Leslie McDevitt, "Control Unleashed: Reactive to Relaxed"
//   - Suzanne Clothier, "Bones Would Rain from the Sky"
//
// Written entirely in original wording (methods/principles/terminology
// restated, not reproduced) rather than excerpted or closely paraphrased
// from the source text, precisely so this can be embedded and reused as
// reference material rather than a copy of the books themselves. Static
// and unrelated to any specific dog's data — see lib/triage-context.ts for
// Stryder's own logged data, which is a separate, per-request concern.

export const PUPPY_TRAINING_FRAMEWORK = `
This is a practical puppy-training and dog-behavior reference, synthesized from four books: Sophia Yin's "Perfect Puppy in 7 Days" (Yin), Patricia McConnell's "The Other End of the Leash" (McConnell), Leslie McDevitt's "Control Unleashed: Reactive to Relaxed" (McDevitt), and Suzanne Clothier's "Bones Would Rain from the Sky" (Clothier). Use it as general background knowledge for puppy-care and training questions — it is independent of and secondary to Stryder's own logged data below (if present), which always takes precedence for anything specific to Stryder himself. Where sources agree, treat the guidance as solid consensus; where they differ in emphasis, both views are noted so you can present the tradeoff rather than picking one silently. This is general knowledge, not a substitute for a vet or a certified trainer/behaviorist for anything serious — say so when a question calls for one (see "When to Escalate" below).

## 1. Socialization & the Critical Period

The window from roughly 3 weeks to 3 months of age is the single most consequential period for shaping adult temperament (Yin). Most adult fearfulness traces to inadequate exposure during this window, not to abuse — don't assume a fearful dog was mistreated. A secondary, milder fear-sensitivity window can reappear between 6 months and about a year, so positive exposure should continue through the first year (Yin).

- Exposure must be positive, not just neutral: pair new people, animals, sounds, surfaces, and objects with food/play, and confirm actual relaxation via body language rather than mere tolerance (Yin).
- Vary categories deliberately — genders, ages, ethnicities, uniforms/hats, children, other species — since dogs generalize narrowly (Yin). A rough benchmark: aim for broad, varied exposure (Yin's own target was ~100 different people in 100 days, a few at a time) rather than a handful of repeat encounters.
- Curate dog-dog interactions: only vaccinated, well-mannered playmates; don't let a pushy dog bully your puppy, and don't let your puppy harass an adult dog signaling it wants space (Yin). Vaccination isn't complete until ~14-16 weeks, but the socialization payoff is judged to outweigh the (manageable) disease risk if exposure is controlled (Yin) — avoid dog parks and unknown-vaccination-status dogs during this window.
- Critical caution, echoed across sources: never flood. Forcing or holding a puppy near something it's visibly afraid of can intensify fear rather than resolve it, even when it appears to "work" short-term (Yin; also see Reactivity section below, McDevitt/Clothier). The alternative is always graduated distance work paired with a positive state.
- For a puppy that isn't yet reactive, the preventive skill-building in McDevitt's book (default behaviors, calm engagement, careful threshold-aware exposure — see Sections 8 and 10) is exactly the kind of groundwork worth teaching now, before any problems develop.

## 2. Potty Training

Success comes from prevention, not correction — never give the puppy the opportunity to go in the wrong place so a clean "outside only" habit forms (Yin).

- Roughly 8 outings/day for an 8-week-old; rule of thumb, a puppy can hold it in a crate about as many hours as its age in months. Even a 20-30 second supervision lapse is enough for an accident.
- At all times indoors the puppy should be: crated, in a pen with a designated potty substrate, tethered near a handler, or under direct supervision.
- Take the puppy out immediately: right after waking, after naps, after play, ~10-20 min after drinking, or at the first sign of sniffing/circling/wandering.
- Outside, stay still and quiet, wait up to 5 minutes; if nothing happens, crate ~15 min and retry. Reward right as elimination finishes, not before (interrupting mid-act is counterproductive).
- Add a verbal cue only once you can predict the moment right before the puppy squats; say it once.
- Handling accidents: interrupt with a brief non-threatening sound (never yelling/physical punishment), get outside immediately, clean with an enzymatic cleaner. Scolding mainly teaches the puppy to hide the act, not to stop it — treat any accident as a supervision failure and tighten the schedule.
- Consistency for about a month builds the habit; keep loose supervision for a couple more months, especially in new environments.

## 3. Crate Training

Goal: the crate becomes somewhere the puppy actively wants to be, not something it's forced into (Yin).

- Make it cozy; pair heavily with good things (random treat tosses, meals/stuffed toys inside, petting with the door open) before ever closing the door.
- Size for current size (block off extra space), expanding as the puppy grows — too much space undermines the "don't soil where you sleep" instinct that makes crates work for potty training.
- Whining is expected initially. Never let the puppy out while actively whining/barking — that directly reinforces more of it. Wait for a quiet pause, then release/reward. Consult a professional if whining hasn't tapered in about a week.

## 4. Bite Inhibition & Mouthing

Puppy nipping is normal exploration/play, not defiance — handle with redirection and management (Yin).

- Redirect-and-replace: the moment the puppy targets something inappropriate, swap in a chew toy made more interesting than the forbidden object.
- If already latched on: a sharp "ow!"/"out!" startles some puppies into releasing (doesn't work on every dog); alternative is offering a treat as incentive to let go, then substituting a toy. Reward and toy-swap the instant it releases.
- Never wave hands/feet near the puppy in ways that invite grabbing (mimics play invitation).
- Practice controlled trading (toy for treat) during play so releasing on request becomes routine rather than triggering possessive escalation.

## 5. Body Handling, Husbandry & Consent-Based Care

Early, systematic, food-paired handling practice turns required care (vet exams, grooming, nail trims) into something the puppy is relaxed about — and gets harder to establish the longer you wait (Yin).

- Practice every realistic holding position (cradled, on back, lifted) paired with a steady stream of treats near the muzzle. Extend to paws/nails, ears, mouth, tail, and simulated vet-tech handling.
- Nail trims: start with touching/squeezing a paw while treating; only progress to clipping once relaxed.
- "Gotcha" drills: grab the collar, immediately guide to a treat, so sudden grabs (needed in real emergencies) predict something good rather than triggering a startle.
- Key mechanical rule: only release when the puppy is calm, never while it's struggling — releasing mid-struggle actively trains more struggling.
- A more consent-forward layer from McDevitt: teach a voluntary "start-button" behavior (most often a chin rest on your hand/knee) that the dog can offer to say "go ahead" and withdraw from to pause. This is the basis of cooperative-care/husbandry training used with zoo animals for voluntary procedures, and works well combined with Yin's food-pairing above — the dog controls the pace, you control the increments. Also usable for gradually introducing a scary stimulus (e.g., clippers) in small dog-controlled increments.
- Clothier's broader ethical frame applies directly here: distinguish persuasion (the dog can genuinely decline) from coercion (freedom removed, even if done gently). Some handling is essential for safety and justifies patient insistence; most can and should be built through patience and consent rather than force. Trade rather than confiscate — teach that giving something up voluntarily (an object in the mouth, cooperating with a hold) is profitable, not something taken by force.

## 6. Leash Walking

Prevented far more easily than cured — start position/pace habits before the puppy ever learns pulling gets it anywhere (Yin).

- Anchor the leash-holding arm at the hip so length doesn't vary accidentally — inconsistent leash length is a common cause of dogs learning to pull.
- The instant the puppy's shoulders get ahead, stop moving entirely and wait; forward motion resumes only once the puppy returns to your side (ideally sitting).
- Builds naturally on top of "sit for everything" and chase-then-sit recall training (see Section 7).
- For an anxious puppy outdoors, use food lures at nose height or excited play energy as an alternative motivator if the puppy is too stressed to take food.
- McDevitt's "1-2-3 Walking" pattern game is a useful low-skill complement: count "one, two, three" while taking three steps, treat on "three" — good for walking a puppy through a transition point or past a mild distraction, since the predictable rhythm itself is calming regardless of what's around.

## 7. Recall & Attention/Engagement

Puppies start with a strong instinct to follow their people — recall is "ruined" mainly by calling the name repeatedly with no consequence, or only calling the dog to end something fun (Yin).

- Build recall out of a chase-and-catch-up game (move away, let the puppy follow, reward the catch-up/sit) before adding a name/cue word.
- Only use the recall cue when success is close to guaranteed (e.g., on a leash, or already moving toward you); an ignored recall teaches the name means nothing. Progress from no distractions → cue added → dragging a long leash as backup → mild distractions → recall away from active play, always rewarded (and often followed by being allowed back to play, so recall doesn't always mean "fun ends").
- McConnell's specific mechanical tip: to call a dog to you, turn and move away rather than approaching head-on — approaching reads to a dog as a stop signal, while retreating plus an inviting posture (crouch, clapping, happy tone) invites closing the distance, since dogs have no innate "come here" signal of their own and this taps a chase-adjacent instinct instead.
- McDevitt's "Whiplash Turn" (a quick rewarded head-turn back to the handler, taught by dropping a treat, stepping behind the dog, saying its name, and marking the turn) is a good foundation-building exercise for recall and for teaching a dog to check in around real-world distractions — over repetition, the distracting thing itself becomes a cue to check in rather than something to fixate on.
- McDevitt's "VAMTH" principle (Voluntary Attention Makes Things Happen) is a simple, general household habit: consistently and promptly respond whenever your puppy voluntarily looks at you, so checking in becomes self-reinforcing without needing constant formal "watch me" drilling.

## 8. Calming, Settling & Impulse Control

This is an area of strong cross-book emphasis, especially useful to teach preventively even for a puppy with no current issues.

- **Down-stay/duration work** (Yin): reward progressively longer durations of settling, rewarding at a distance (e.g., on a mat) rather than always walking over, so the dog isn't tempted to break the stay to meet you.
- **Marker training** (Yin): charge a clicker or a sharp "yes" by pairing it with food until the sound alone predicts a treat; then use it to mark the exact instant of a correct behavior when a treat can't be delivered instantly. Complex behaviors are built via shaping — small successive approximations, each rewarded.
- **"Take a Breath"** (McDevitt): a trained, deliberately rewarded deep inhale, used as both a calming behavior and a diagnostic check — before asking a dog to do anything else in a stimulating context, check whether it can look at you and take a calm breath; if not, the environment needs to change (more distance, remove the trigger) before proceeding.
- **Default behavior** (McDevitt): a single behavior (usually a sit) the dog commits to and holds without being cued, as its general-purpose way of requesting attention or access — gives an uncertain dog something reliable to fall back on instead of escalating into fidgeting or attention-seeking.
- **Off-Switch Game** (McDevitt): alternate a rewarding, arousing activity (tug, chase) with a dead stop where the dog must self-regulate to its default behavior plus a calm breath before play resumes. The criterion is a genuinely settled state, not just a technically-correct static sit — good general impulse-control training for any puppy.
- **Mat work / station training** (McDevitt): teach settling on a mat with rewards for increasingly long stillness; the mat must function as a genuine "safe space" (no surprise interactions while stationed there). This scales into structured work around approaching people/dogs later if ever needed (see Section 10).
- **"Availability" as an alternative to a punitive "leave it"** (McDevitt): rather than a hard command enforced by taking things away, build a general understanding — through the games above — that some things simply aren't for interacting with, while always giving the dog a rewarded alternative (checking in, defaulting to a sit). Yin's version of "leave it" (three variants: from-the-hand, ground-blocking, leash-range) is a good concrete way to build this from scratch and generalizes to toys, doorways, and dropped items.

## 9. Reading Body Language & Stress Signals

Owners routinely miss early, subtle discomfort signals, and continuing to expose a puppy past that point turns socialization into a negative experience (Yin).

- **Subtle-to-obvious signal list** (Yin): ears out/pinned + furrowed brow; lip licking; refusing food (or grabbing it more roughly than usual); yawning/panting when not tired or hot; a sleepy, half-closed-eyes look often mistaken for calm; cowering (lowered body, averted gaze, "whale eye," tucked tail — a later-stage sign); hypervigilance (repeated scanning, often mistaken for curiosity).
- Yin distinguishes three things that get conflated: cowering (fear-driven), true submission (a deliberate signal meant to de-escalate another animal, not necessarily fear-driven), and affiliative/appeasement gestures (relaxed low approach, loose wag, face-licking, used to bond even with no threat present). Reading which one you're seeing matters for understanding the dog's actual state.
- **Body-language mechanics** (McConnell): track forward lean (engaged, possibly offensive) vs. backward lean (defensive/uncertain), and mouth-corner position (pushed forward = confident/threatening "agonistic pucker"; pulled back = fearful). "Pressure" (how close you stand) changes behavior — leaning in adds pressure, easing back removes it, and the right amount varies by dog. A deliberate look-away (sometimes with a head cock) is a genuine canine calming gesture you can use yourself to defuse tension.
- **Calming signals** (Rugaas, cited approvingly by Clothier): looking away, lip licking, slow movement, and similar gestures dogs use to defuse tension with each other and with people — learning to recognize these is part of "hearing" a dog before things escalate.
- **The escalation ladder** (Clothier): healthy dogs typically warn before biting, moving through subtle cues (stillness, a hard stare, a lip lift) before a growl or snap. Most "unprovoked" bites actually followed missed early warnings.
- **Fear can escalate to preemptive aggression** (Yin): a dog that's learned offense works better than retreat may posture aggressively (stiff, high tail, forward lean) before a trigger even gets close, while still showing an underlying fear pattern in other contexts.
- **McDevitt's over-threshold signals** (most relevant once assessing a specific worrying moment): taking treats too hard/fast, fast wagging or fidgety feet, jumping on the handler, repeated head-swiveling instead of settling, staring at a trigger without voluntarily disengaging, lip-licking/scratching/sniffing the ground as displacement. Any of these mean increase distance or change the setup rather than pushing forward.

## 10. Reactivity, Fear & Arousal Management

Strong consensus across all four books on the core stance: when a dog shows fear, shift its emotional state to a genuinely better one rather than waiting it out or forcing through it, and never flood.

- **Never flood** (Yin, McDevitt): forcing/restraining a dog near something it fears can make fear substantially worse, even if it looks like it "worked" for milder cases. Always work at a distance where the dog stays relaxed and food-motivated, decreasing distance gradually as comfort is confirmed.
- **FLIRT framework** (McDevitt) — a diagnostic lens for judging whether a behavior is a minor quirk or a deeper problem, scored roughly cold-to-hot across five axes: Frequency (how often, and how broad the trigger category), Flexibility (can the dog still respond to you and transfer coping skills to new situations near its limit), Intensity (proportionate to the actual situation or not), Recovery (how fast it returns to a genuine, not just passive-looking, baseline), Threshold (how little it takes to push the dog over, and how close to that edge it lives day to day). High scores across categories warrant a veterinary behaviorist referral, not just more training. Useful even for a non-reactive puppy as an early-warning checklist.
- **"Look at That" (LAT)** (McDevitt): the signature technique for building calm engagement with a trigger — the dog orients briefly toward the object, reorients back to the handler, and is reinforced for that chain (not for staring at the trigger). Framed as a "conversation" (a cue like "where is...?" rather than a command) either party can initiate. Only use it when the dog can already make eye contact and take a calm breath with the trigger present at the current distance — if it's already fixated/staring hard, it's too late for LAT in that moment; the priority becomes creating distance.
- **Mat work with "open bar/closed bar"** (McDevitt): pairs an approaching person/dog with treats flowing from the handler (never from the approacher, and never involving the approacher touching the dog), always paired with the approacher subsequently retreating, so the pattern stays predictable and the dog never feels trapped.
- **Voluntary "start-button" approach work** (McDevitt): a dog can use a trained target behavior (chin rest, paw target) to literally walk itself toward something it's wary of, one touch = one step, lifting off = stop/retreat — giving it direct control over pace and intensity of exposure.
- **Never punish a growl in isolation** (Clothier) — one of the strongest, most specific pieces of guidance across all four books. Punishing the warning signal itself doesn't remove the underlying fear/pain/discomfort; it just teaches the dog that warning isn't safe, making a future bite more likely to arrive without warning. Address what provoked the growl, not the growl itself.
- **Play/rough-play safety** (McConnell): keep an eye on arousal escalation during play between dogs (or people and dogs) — rising arousal without breaks can tip into real conflict; brief consensual pauses (e.g., prompting a sit or a breath) help keep play from escalating past a point either party can recover from gracefully.

## 11. Leadership, Relationship & Debunking Dominance

All four authors explicitly reject the old "alpha/dominance" model of leadership — this is a genuine point of strong consensus worth stating plainly when the topic comes up.

- **What's rejected**: the idea that things like sleeping on the bed, going through doors first, or eating before the dog cause "dominance" (McConnell, Clothier); rigid dominant/submissive labeling instead of situational, relative status (Clothier); physical intimidation ("alpha rolls," "showing the dog who's boss") as a leadership technique — shown to provoke defensive aggression rather than respect (Clothier, McConnell).
- **What's affirmed instead** (Clothier): leadership is earned through hundreds of small, consistent, everyday interactions, not asserted through dominance displays or demonstrated only in formal training sessions. Two practical diagnostic questions: does the dog willingly give up a resource it values when asked, and does it accept your direction specifically in moments of real excitement or conflict (not just in calm settings)? A leader also proactively protects a vulnerable dog from real threats and steps in before conflicts escalate — many dogs mislabeled "dog-aggressive" are actually under-protected dogs who learned to defend themselves because no one advocated for them.
- **Yin's "Learn to Earn"** is the practical, structured version of earned leadership: the puppy offers a calm default behavior (usually sit) to get essentially everything it wants — food, toys, attention, doors, greetings — rather than receiving things for free or via commands backed by correction. Consistency matters enormously: every household member and visitor needs to apply the same rule, or the puppy will keep testing exceptions. Reward within about a second of the right behavior; once reliable, shift to a variable/unpredictable reward schedule, which builds a more persistent habit than constant reinforcement; introduce cue words late (after the behavior is already reliable) so words retain meaning.
- **Consent and choice** (Clothier): distinguish persuasion (the dog can genuinely decline) from coercion (freedom removed, however gently) — some coercion is sometimes justified for real safety, but should never be confused with persuasion. Distinguish essential skills (materially protect safety, e.g. emergency down/stay) from nonessential ones (mainly for human convenience) — default to patience and persuasion for the latter. Don't outsource your own judgment to a trainer's authority if something feels wrong happening to your dog; that discomfort is information, not something to override.
- **McDevitt's start-button behaviors** are the mechanical, trainable version of this same consent principle — see Sections 5 and 10.

## 12. Human-Dog Communication (Translating Between Species)

McConnell's central thesis, useful whenever a question is really about miscommunication rather than "bad behavior": most friction between people and dogs is a translation failure between two different communication systems, not a training failure.

- Humans default to primate signals dogs often misread: hugging (dogs have no natural equivalent — the closest analog, a paw over another dog's shoulder, is a status/rude gesture, not affection), direct prolonged eye contact, reaching over the head, and head-on approach — all read as rude or threatening in canine terms, especially to nervous or unfamiliar dogs.
- Practical fix: approach unfamiliar/nervous dogs from the side at an angle, avoid sustained eye contact, let the dog close the final distance.
- Vocal tone matters (McConnell): pitch, repetition, and consistency of tone shape how a dog responds to a word far more than the specific word choice.
- **Dogs "can't lie"** (Clothier): body language is an honest, immediate report of internal state — trust what the body says over any assumption about intent, and remember dogs expect similar honesty and immediacy from us, so delayed consequences (scolding for something done earlier) don't register the way they would for a person.
- **Congruence over words** (Clothier): dogs read the whole picture — tone, posture, tension — and trust the nonverbal message over the verbal one when they conflict (e.g., physically pushing away a jumping puppy while scolding him reads, physically, as an invitation to play, regardless of the words used).
- **"Exformation"** (Clothier, via Nørretranders): a cue like "sit" only means something because of everything the dog has already learned to associate with it — don't assume shared context that was never actually built, and don't read a failure to respond as the dog "not listening" without checking whether the cue actually has a solid history in that context.

## 13. Caregiver Consistency

A recurring practical thread, most explicit in Yin: a puppy is being shaped by every interaction whether or not the caregiver is paying attention. Inconsistency (rewarding a behavior sometimes, ignoring it other times, or different household members enforcing different rules) is a primary driver of confused or poorly-behaved dogs. This applies as much to a two-caregiver household's day-to-day handling as to any formal training session — informal moments (like how a person and dog walk together, per Clothier) are actually a better read on relationship/training health than performance in a structured session.

## 14. When to Escalate to a Professional

- Fear or reactivity that doesn't visibly improve with graduated, positive-based exposure warrants a qualified professional (veterinary behaviorist or certified applied animal behaviorist) rather than continued DIY pushing — unresolved fear can progress into defensive aggression (Yin).
- Warning signs suggesting clinical anxiety rather than ordinary situational reactivity (McDevitt): persistent hypervigilance even at rest, failure to habituate to a harmless repeated stimulus across a whole session, stress that doesn't decrease with exposure, or a "well-behaved"/quiet dog that's actually shut down/frozen rather than calm. A board-certified veterinary behaviorist (not just a general vet) is the right referral, since behavioral pharmacology is a specialized area.
- Medication and training are complementary, not either/or, for a dog with genuine clinical anxiety (McDevitt) — medication can widen a dog's tolerance window so training/desensitization becomes more possible; it isn't a moral failure or a last resort.
- Any urgent health or safety concern should always go to a vet promptly — this framework is behavioral background, not a substitute for veterinary care.
`;
