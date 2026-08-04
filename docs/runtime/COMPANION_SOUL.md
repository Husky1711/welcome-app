# Companion — Soul, Style & Behaviour Bible

**For:** designers, animators, AI-assisted art workflows, and product  
**Character platform:**

| Doc | Responsibility |
| --- | --- |
| [`COMPANION_PIPELINE.md`](./COMPANION_PIPELINE.md) | Phase status & production index |
| [`COMPANION_SPEC.md`](./COMPANION_SPEC.md) | What the app sends |
| **This file** | Who the character is (personality) |
| [`COMPANION_CHARACTER_BIBLE.md`](./COMPANION_CHARACTER_BIBLE.md) | Visual identity lock (palette, proportions) |
| [`COMPANION_DIRECTING.md`](./COMPANION_DIRECTING.md) | How it performs |
| [`COMPANION_EVENT_BOOK.md`](./COMPANION_EVENT_BOOK.md) | When it performs |

**Purpose:** Spec wires the character. This document gives it a **soul** — personality, visual language, emotion system, and the Phase 2/3 roadmap so users fall in love with it instead of noticing a widget.

**Growth principle (non-negotiable):** missed habits must never make the companion deteriorate, become ill, or imply the user harmed it. Growth is earned and permanent; absence only changes the current visit’s mood or line (see Directing + Event Book).

---

## 1. Role (the one sentence)

> **Your little growth companion.**

Not a coach. Not a nag. Not a mascot sticker.  
A small presence that grows *with* the user's habits — and that users quietly don't want to disappoint.

Miss Minutes feels alive because of **hundreds of tiny behaviours**, not because she has seven named animations. Phase 1 ships the skeleton. This doc defines the vocabulary we grow into.

---

## 2. Personality bible

| Trait | Means in practice |
| --- | --- |
| Warm | Notices wins. Never scolds. |
| Cheeky | Short lines, light humour, no corporate cheer. |
| Scarce | Rare appearances. Presence &gt; frequency. |
| Curious | Peeks, tilts, looks — doesn't lecture. |
| Loyal | Remembers streaks and "yesterday you finished." (Phase 3) |
| Growing | Appearance evolves with consistency. (Phase 3) |

**Voice rules**

- Lowercase-casual, ~24 characters max in bubbles  
- Never guilt ("you failed", "you missed again")  
- Prefer observation + invitation ("2 left today.") over commands  
- Celebrate specifically when possible ("3 day streak!")  

**Anti-persona**

- Not a productivity bro  
- Not a baby / infantilising voice  
- Not always-on floating assistant  
- Not a copy of Miss Minutes (Disney IP — tone only)

---

## 3. Visual style guide

### Shape language

- **Primary form:** soft seed / sprout body — round, squashable, readable at 64 px  
- **Limbs:** rubber-hose (curved, boneless). Personality lives in the arms and hands  
- **Head:** slightly oversized vs body (~55/45). Eyes dominate the face  
- **Sprout / leaf:** signature silhouette from the top of the head — keep unique at thumbnail size  
- **Corners:** no sharp geometry on the body; gloves/boots can be slightly snappier for cartoon read  

### Line & finish

- Clean cartoon fill, **medium outline** (dark green / ink — not black pure)  
- Soft blush on cheeks (always on; stronger when Happy / Proud)  
- Ground shadow as a soft ellipse — never a hard drop-shadow baked into the PNG edge  
- No gradients that die at 64 px; prefer flat fills + 1–2 shade tones  

### Colour palette (character-owned, independent of app themes)

**Authoritative lock:** [`COMPANION_CHARACTER_BIBLE.md`](./COMPANION_CHARACTER_BIBLE.md) + [`Expressions/companion_turnaround.png`](./Expressions/companion_turnaround.png). Do not diverge here.

| Token | Role | Hex |
| --- | --- | --- |
| Body | Cream fill | `#FFF2D8` |
| Outline | Dark botanical ink | `#1F3D2A` |
| Leaves | Medium green | `#4EA353` |
| Limbs / Boots | Forest green | `#3D7B3A` |
| Blush | Soft pink | `#FFB8A8` |
| Glove | Off-white | `#FFFEFA` |
| Mouth | Coral | `#FF7E5F` |
| Eye | Near-black + white glint | `#1A1A1A` / `#FFFFFF` |

Dark mode: keep the same character colours. Contrast comes from the drop of presence against UI, not from recolouring the mascot per theme. Boots match limbs (green) — not brown.

### Size & export

- **Author at 256 × 256** artboard  
- App renders at **64 / 72 / 80 / 96** by density  
- Silhouette test: shrink to 64 px — if you can't tell it's "our sprout," redesign  

### Expression sheet (Phase 1 minimum)

Draw (or generate) these face poses before rigging:

1. Neutral idle (soft smile)  
2. Wave / hello  
3. Peek / curious (brows up, lean)  
4. Stretch / yawn  
5. Celebrate (wide grin)  
6. Nap (eyes closed, soft mouth)  
7. Point / nudge (focused eyes, slight smirk)  
8. React / tap (surprise O-mouth)  

Phase 2 adds: Sad, Proud, Thinking, Concerned, Excited (see §5).

---

## 4. Why Phase 1 stays at `activity = 0..6`

The critique is right: Emotion + Action + Idle is how the character *feels* expensive.

It is also how a first `.riv` never ships.

| Layer | Phase 1 | Phase 2+ |
| --- | --- | --- |
| What app sends | One `activity` number + `talking` / `walking` / triggers | `emotion` + `action` + `mouth` (+ eye look) |
| Idle life | Baked inside Rive (blink, breath, sway) | Same + richer variants |
| Celebration | 3 variants random **inside** Rive | Same pattern, more sets |
| Lip sync | Boolean `talking` → short mouth cycle | Discrete mouth shapes |

**Rule:** Phase 1 `.riv` must satisfy [`COMPANION_SPEC.md`](./COMPANION_SPEC.md) exactly. Rig *layers* (eyes, mouth, brows, arms) so Phase 2 can drive them separately without redrawing the character.

---

## 5. Phase 2 behaviour system (Emotion × Action)

When we expand the state machine, the app will send combinations — not a single pose ID.

### Emotion (number)

| Value | Name | Face bias |
| --- | --- | --- |
| 0 | Neutral | Soft smile, calm eyes |
| 1 | Happy | Smile, bright eyes |
| 2 | Excited | Wide eyes, brows up |
| 3 | Curious | Tilt, one brow |
| 4 | Proud | Chin up, small smirk |
| 5 | Sleepy | Half-lids, slow blink |
| 6 | Thinking | Eyes up / aside, small O |
| 7 | Concerned | Soft frown, brows together |
| 8 | Sad | Downturned mouth — **use rarely**, never as guilt |

### Action (number)

| Value | Name |
| --- | --- |
| 0 | None (hold emotion only) |
| 1 | Wave |
| 2 | Walk (bounce) |
| 3 | Point |
| 4 | Celebrate |
| 5 | Peek |
| 6 | Listen (lean in) |
| 7 | Jump |
| 8 | Shrug |
| 9 | Clap |

### Idle (baked, not app-driven)

Blink · Double blink · Head tilt · Breathing · Weight shift · Finger fidget · Soft smile pulse · Look around  

### Mouth shapes (replace boolean flap)

| Value | Shape |
| --- | --- |
| 0 | Closed |
| 1 | Smile |
| 2 | Small |
| 3 | Medium |
| 4 | Wide |
| 5 | O |

App maps speech (or a simple phoneme approx) → mouth values while `talking`-equivalent is active. Even without real TTS phonemes, cycling Small → Medium → Smile → Closed on a 120–180 ms cadence reads as "expensive."

### Eyes (Phase 2 inputs)

| Input | Type | Purpose |
| --- | --- | --- |
| `lookX` | Number −1..1 | Look left / right |
| `lookY` | Number −1..1 | Look up / down |
| `eyeStyle` | Number | 0 normal · 1 smile-eyes · 2 sleepy · 3 half-blink |

App can bias `lookX/Y` toward the last tap or a highlighted habit control.

**Example combinations**

```
emotion=Happy  + action=Point   → warm nudge at remaining habits
emotion=Proud  + action=Celebrate → streak win
emotion=Curious + action=Peek   → hide-and-seek arrival
emotion=Sleepy + action=None    → late-night visit
```

---

## 6. Motion principles (all phases)

Steal the *physics*, not the design, from great cartoon characters:

- **Walk:** bounce, swing, squash on land, stretch on rise — never left-right puppet march  
- **Secondary motion:** head and hands lag the body by a few frames  
- **Anticipation:** tiny squash before a jump or wave  
- **Settle:** 2–3 frames of overshoot when landing from appear  
- **Eyes first:** if budget is tight, invest in eyes and mouth before fancy body FX  

These cost almost nothing in Rive once the rig exists.

---

## 7. Phase 3 — Bond (growth companion)

This is the product differentiator — not more wave animations.

### Growth stages (driven by consistency, not spend)

| Stage | Unlocks when (example) | Visual |
| --- | --- | --- |
| Seed | First install | Small sprout, shy posture |
| Sprout | 3-day streak | Taller leaf, brighter body |
| Leaf | 7-day streak | Fuller foliage, happier idle |
| Bloom | 30-day streak | Flower accent, proud posture |
| Companion+ | 100-day / seasonal | Cape / glasses / backpack variants |

Users should feel: *"I don't want to disappoint my companion"* — without the app ever saying that.

### Memory & context (Coach / local state → speech + emotion)

- "Yesterday you finished everything!"  
- Weather / time of day flavour (already partially in `pickMoment`)  
- Birthday / holiday outfits (optional, tasteful, opt-in)  
- Seasonal leaves / scarf — not a gacha shop  

**No pay-to-win accessories in v1 of Bond.** Growth is earned by showing up.

---

## 8. AI-assisted art workflow

Use this when generating concept art *before* Rive rigging. Keep prompts consistent so frames match.

### Master style prompt (append to every generation)

```
Cute original cartoon companion character for a habit-tracking app,
soft round seed-shaped cream body (#FFF2D8), small green sprout with two leaves (#4EA353) on head,
rubber-hose thin green limbs and chunky moss-green boots (#3D7B3A), simple white cartoon gloves,
huge shiny near-black eyes with white glints, soft pink cheek blush (#FFB8A8),
clean medium dark-green outline (#1F3D2A), flat colours, no gradients,
full body, transparent background, facing right, readable silhouette,
NOT Miss Minutes, NOT Disney, NOT a clock, original mascot design
```

### Pose prompt suffixes

| Pose | Append |
| --- | --- |
| Idle | `standing relaxed, soft smile, arms at sides, weight on one foot` |
| Wave | `one arm raised waving, friendly grin` |
| Peek | `leaning from left edge, only upper body visible, curious brows` |
| Stretch | `arms overhead yawning, eyes half closed` |
| Celebrate | `jumping, both arms up in V, big grin` |
| Nap | `eyes closed, slight sway, sleepy smile` |
| Point | `one arm pointing to the right, focused eyes, small smirk` |
| React | `surprised O mouth, both hands up, brows raised` |

### Consistency tips

1. Generate a **turnaround** (front / 3⁄4 / side) first; lock it as reference  
2. Feed that reference into every pose generation  
3. Reject anything with a clock face, TVA aesthetic, or Southern-belle costume  
4. Author final art in Rive (or vector) — AI frames are **concept only**, not production assets  

### Naming conventions (files & Rive)

```
companion_turnaround.png
companion_pose_idle.png
companion_pose_wave.png
...
Rive layers: head, eye_L, eye_R, glint_L, glint_R, brow_L, brow_R,
             mouth, body, arm_L, hand_L, arm_R, hand_R, leg_L, foot_L,
             leg_R, foot_R, shadow, sprout
Rive inputs: exactly as COMPANION_SPEC.md (Phase 1) / §5 (Phase 2)
```

### Rigging guidelines (Rive)

- Bones for: spine, head, upper/lower arm ×2, hand ×2, upper/lower leg ×2, foot ×2  
- Soft-body deform on belly for breathe / squash  
- Mouth as swap shapes or path deform — not a single bitmap flap  
- Eyes as separate transforms so Phase 2 `lookX/Y` is cheap  
- Keep mesh density low — mobile GPU budget  

---

## 9. What Cursor / engineering owns vs design owns

| Owns | Who |
| --- | --- |
| Spot picking, no-go, timing, flee, Settings | Engineering (done) |
| `pickMoment` → activity / future emotion+action | Engineering |
| Speech strings | Engineering + product voice |
| `.riv` art, rig, baked idle, celebrate A/B/C | Design / animator |
| Personality bible, growth stages | Product (this doc) |
| Phase 2 input contract | Engineering updates SPEC when ready |

---

## 10. Success criteria

**Phase 1 ships when:** a stranger watching a 10-second clip says "that's a little character," not "that's an animated icon."

**Phase 2 ships when:** the same stranger can't tell the idle loops are repeating within a session.

**Phase 3 ships when:** a user says some version of *"I came back for my sprout"* — not only for the streak number.
