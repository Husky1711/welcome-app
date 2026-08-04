# Companion — Character & Animation Spec (Phase 1)

**For:** the designer/animator building the companion artwork  
**Companion docs (character platform):**

| Doc | Responsibility |
| --- | --- |
| [`COMPANION_PIPELINE.md`](./COMPANION_PIPELINE.md) | Phase status & full production index |
| **This file** | What the app sends (API / Rive contract) |
| [`COMPANION_STATE_MACHINE.md`](./COMPANION_STATE_MACHINE.md) | Animator-facing inputs / clips / transitions |
| [`COMPANION_SOUL.md`](./COMPANION_SOUL.md) | Who the character is (personality, growth vision) |
| [`COMPANION_CHARACTER_BIBLE.md`](./COMPANION_CHARACTER_BIBLE.md) | Visual identity lock |
| [`COMPANION_DIRECTING.md`](./COMPANION_DIRECTING.md) | How it performs (acting, mood, restraint) |
| [`COMPANION_EVENT_BOOK.md`](./COMPANION_EVENT_BOOK.md) | When it performs (product moments → performance) |
| [`COMPANION_PIPELINE.md`](./COMPANION_PIPELINE.md) | Frozen production pipeline & build levels |
| [`COMPANION_RIVE_BUILD_GUIDE.md`](./COMPANION_RIVE_BUILD_GUIDE.md) | Rive editor playbook (after SVG passes) |
| [`COMPANION_TEST_PLAN.md`](./COMPANION_TEST_PLAN.md) | QA before every `.riv` / release |
| [`COMPANION_RIVE_DIY.md`](./COMPANION_RIVE_DIY.md) | Weekend DIY notes (obey Build Guide + Spec) |

**Deliverable:** one `.riv` file (Rive) — see [Deliverable](#6-deliverable)  
**Status:** app-side integration is built and waiting. Artwork is the only missing piece. Companion is **off by default** until real art ships.

> This document is the *wiring contract*. Do not expand the Phase 1 `.riv` to match the full Soul/Directing vision; ship the MVP machine first.

---

## 1. What this is

A small character that lives on top of the app. It is **not** always on screen. It appears for about 7 seconds every 45–90 seconds, does one short thing, and leaves.

It is a habit-tracking app. The companion's job is emotional: make the user feel noticed when they complete something, and gently missed when they don't. It is never a nag and never blocks the interface.

**Role (one line):** *Your little growth companion* — see Soul doc for the full personality bible.

**Reference tone:** Miss Minutes (Loki) — cartoon, rubber-hose limbs, big expressive eyes, warm and slightly cheeky. **Do not copy the design** — Disney IP. Original character in that *spirit* only.

**Current placeholder:** hand-coded SVG sprout. Treat as a rough sketch, not a brief. You may redesign freely within the Soul style guide.

---

## 2. Character requirements

| Requirement | Detail |
| --- | --- |
| Artboard | Design and rig at **256 × 256**. App renders at 64 / 72 / 80 / 96 depending on screen density. |
| Silhouette | Must still read clearly when rendered at **64 px**. |
| Contrast | Visible over photos, white cards, and dark mode. Busy backgrounds are the default. |
| Facing | Drawn facing **right**. App mirrors horizontally for left-facing. |
| Palette | Independent of the six app themes. See Character Bible (turnaround lock). |
| Limbs | Arms with hands + legs with feet. Rubber-hose preferred. |
| Face | Big eyes with glints, separate mouth layer, brows. Eyes carry ~60% of the personality. |
| Walk | **Bounce / squash / stretch** — not left-right puppet steps. Exaggerate body motion. |

### Required layers

Head · Eyes (+ glints) · Eyebrows · Mouth · Body · L/R arm + hand · L/R leg + foot · Ground shadow

---

## 3. State machine contract (Phase 1)

This must match exactly. The app already emits these values (or will map 1:1 on Rive integration).

**Artboard name:** `Companion`  
**State machine name:** `Companion`

### Inputs the app will set

| Input | Type | Fired when |
| --- | --- | --- |
| `activity` | Number (0–6) | Which pose to hold. Mapping below. |
| `talking` | Boolean | True while a speech bubble is on screen. Drive a short mouth cycle (not a single flap). |
| `walking` | Boolean | True while crossing the screen. Use bounce-walk, not march. |
| `appear` | Trigger | Entrance → settle into `activity`. |
| `leave` | Trigger | Exit → fully transparent. |
| `react` | Trigger | User tapped once. One-shot surprise/greeting, then return. |

### `activity` value mapping

| Value | Name | What it should read as |
| --- | --- | --- |
| 0 | `idle` | Standing, breathing, weight shift, blink. Never frozen. |
| 1 | `wave` | Friendly hello with one arm. |
| 2 | `peek` | Half-hidden, leaning from an edge. Curious. |
| 3 | `stretch` | Morning yawn, arms overhead. Waking up. |
| 4 | `celebrate` | Jump / arms up / big grin. **Bake 3 random variants (A/B/C)** inside Rive — app only sends `4`. |
| 5 | `nap` | Drowsy, eyes closed, soft sway. Late night. |
| 6 | `point` | Points off to one side. Soft nudge toward unfinished habits. |

> Phase 2 will split this into **Emotion + Action + Mouth shape** (see Soul doc). Phase 1 keeps a single `activity` number so the first `.riv` stays shippable.

### Entrance / exit

App places the character via CSS; the `.riv` needs three flavours on `appear`:

- **Edge** — slides in from left or right  
- **Perch** — pops up from behind a UI card (lower body can stay hidden)  
- **Cross** — bounce-walks across; `walking` stays true the whole way  

Entrances ≤ **400 ms**. Exits ≤ **320 ms**. Match the app's position transitions.

---

## 4. Bake into the state machine (app will not drive these)

These are free personality — put them in Rive so the character never feels like a static sticker:

- Blink every 2–5 s, randomised; occasional double-blink  
- Breathing (~4 s cycle)  
- Idle weight shift / sway  
- Occasional head tilt between loops  
- Arm / head lag on walk and celebrate (secondary motion)  
- Celebrate A / B / C chosen at random inside Rive  
- Walk = bounce + squash/stretch, not robotic steps  

Eyes looking at taps / Emotion layer / lip-sync mouths = **Phase 2** (Soul doc).

---

## 5. Hard constraints

- **File size:** target **&lt; 150 KB** for the Phase 1 `.riv`  
- **Frame rate:** 60 fps on mid-range Android  
- **No text in artwork** — bubbles are app UI  
- **Reduced motion:** app hides the companion entirely  
- **Transparent artboard**; ground shadow layer is fine  

---

## 6. Deliverable

1. `companion.riv` — artboard `Companion`, state machine `Companion`, inputs exactly as §3  
2. Source `.rev` (editable)  
3. Screen recording of each `activity` (incl. 3 celebrate variants) and each trigger  

Drop at: `public/companion/companion.riv`

---

## 7. What the app already handles

You do **not** need to solve:

- Spot picking / collision / no-go zones (`companionStage.ts`)  
- Scarcity timing (`companion.ts` — ~1 s first peek, then 45–90 s, hold ~7 s)  
- Moment selection from habits / time / streak (`pickMoment`)  
- Tap → react → second tap → Coach  
- Scroll-flee, facing mirror, Settings toggle  

Integration replaces the SVG in `CompanionSprite.tsx` with a Rive canvas. Placement and behaviour stay.

---

## 8. Speech lines (app-owned)

Lines live in `src/utils/companion.ts`. Voice: short, lowercase-casual, never guilt-tripping. Cap ~24 characters.

> "Hey there." · "Just passing by." · "Morning!" · "3 day streak!" · "2 left today." · "Nothing ticked yet." · "Winding down?"

---

## 9. Phased roadmap (summary)

| Phase | Scope | Doc |
| --- | --- | --- |
| **1 — MVP** | This contract. ~7 activities + baked idle + 3 celebrate variants. | This file |
| **2 — Alive** | Emotion × Action, mouth shapes, eye look, ~25 animations. | Soul § Phase 2 |
| **3 — Bond** | Growth stages, accessories, memory lines, seasons. | Soul § Phase 3 |
