# Companion — DIY Rive Guide (no designer)

**Goal:** build Phase 1 `companion.riv` yourself so engineering can plug it in.  
**Time:** ~1 weekend if you stay ruthless about “good enough.”  
**Contract you must match:** [`COMPANION_SPEC.md`](./COMPANION_SPEC.md)  
**Style reference:** [`COMPANION_CHARACTER_BIBLE.md`](./COMPANION_CHARACTER_BIBLE.md) (palette lock) · [`COMPANION_PIPELINE.md`](./COMPANION_PIPELINE.md) · Soul for personality only  

You are not trying to beat Miss Minutes. You are trying to ship a cute sprout that blinks, waves, and celebrates.

---

## Weekend plan

| Block | Hours | Outcome |
| --- | --- | --- |
| A — Setup + character draw | 2–3 | Static sprout on 256×256 artboard |
| B — Rig + idle | 2–3 | Bones + breathing + blink loop |
| C — 7 activities + walk | 3–4 | Timeline clips for each activity |
| D — State machine + export | 2–3 | Inputs named exactly; `.riv` in `public/` |

If something is hard, **cut scope** in this order (keep the contract names):

1. Skip celebrate B/C (only A) — add later  
2. Skip peek lean complexity — reuse idle with a tilt  
3. Skip stretch yawn mouth — arms up is enough  
4. Never skip: artboard name, state machine name, input names  

---

## 0. Install

1. Create a free account at [https://rive.app](https://rive.app)  
2. Download **Rive Editor** (desktop) — browser works, desktop is nicer  
3. New file → save as `welcome-companion` (this is your `.rev` source)  
4. Watch one short video: search YouTube for **“Rive state machine tutorial”** (10–15 min). That’s enough theory.

Optional: skim [Rive Editor docs](https://rive.app/docs/editor) if you get stuck on bones.

---

## 1. Artboard (must match Spec)

1. Create artboard named exactly: **`Companion`**  
2. Size: **256 × 256**  
3. Background: transparent  
4. Draw the character **facing right** (app mirrors for left)

### Draw it simply (recommended for DIY)

Do **not** import a complex AI PNG as the final character (hard to rig). Draw with Rive’s vector tools:

| Part | How |
| --- | --- |
| Body | Soft oval / rounded rect, cream `#FFF2D8` |
| Outline | Dark green `#1F3D2A`, medium stroke |
| Sprout | Two small leaf shapes on head `#4EA353` |
| Limbs / boots | Forest green `#3D7B3A` |
| Eyes | Two big black circles + tiny white glint dots |
| Blush | Two soft pink ellipses |
| Mouth | Small path (smile) — separate object |
| Arms | Thin green “sausages” + white circle gloves |
| Legs | Short green sausages + green boot ovals `#3D7B3A` |
| Shadow | Soft dark ellipse under feet |

**Silhouette test:** zoom out until the artboard is ~64 px tall. If you still recognise a little sprout with eyes, you’re good.

### Optional: AI as reference only

Use the master prompt in `COMPANION_SOUL.md` §8 to generate a reference image. Put it on a locked guide layer at low opacity, then **redraw** with vectors on top. Delete the guide before export.

---

## 2. Name your layers (before bones)

Rename hierarchy clearly:

```
shadow
body
  sprout
head
  eye_L
  eye_R
  glint_L
  glint_R
  brow_L
  brow_R
  blush_L
  blush_R
  mouth
arm_L
  hand_L
arm_R
  hand_R
leg_L
  foot_L
leg_R
  foot_R
```

This makes Phase 2 (eyes/mouth) possible later without redrawing.

---

## 3. Bones (simple puppet)

Create a bone chain:

```
root (at feet / shadow centre)
  └── hip / body
        ├── spine → head
        ├── upperArm_L → lowerArm_L → hand_L
        ├── upperArm_R → lowerArm_R → hand_R
        ├── upperLeg_L → lowerLeg_L → foot_L
        └── upperLeg_R → lowerLeg_R → foot_R
```

Bind shapes to bones (Rive: select shape → bind to bone / weight paint lightly).

**DIY tip:** if full mesh deform scares you, parent whole shapes to bones (rigid) first. Squash/stretch can be scale keys on `body` for Phase 1.

---

## 4. Timeline animations to create

Create these **Timeline** clips (names suggested — state machine will reference them):

| Timeline | Loop? | Length | What to key |
| --- | --- | --- | --- |
| `idle` | Yes | 4 s | Body scale breathe (1.00 ↔ 1.03), slight sway, blink every ~2–3 s |
| `wave` | Yes or 1-shot loop | 1.2 s | Right arm rotate up/down; soft smile |
| `peek` | Yes | 2 s | Lean body + head toward “edge”; brows up |
| `stretch` | 1-shot or loop | 1.5 s | Both arms up; head tilt back; mouth O optional |
| `celebrate_A` | 1-shot | 1.0 s | Jump (Y up) + arms V + big grin |
| `celebrate_B` | 1-shot | 1.0 s | Spin-ish torso + clap arms |
| `celebrate_C` | 1-shot | 1.0 s | Double hop + wave |
| `nap` | Yes | 3 s | Eyes closed (scale lids or hide eyes), slow sway |
| `point` | Yes | 1.5 s | Right arm point forward-right; focused eyes |
| `walk` | Yes | 0.6–0.8 s | **Bounce**: body Y up/down, squash on land, stretch on rise, arms opposite |
| `appear_pop` | 1-shot | ≤ 0.4 s | Scale 0.7→1.0 + slight Y |
| `leave` | 1-shot | ≤ 0.32 s | Fade opacity 100→0 or scale down |
| `react` | 1-shot | 0.6 s | Surprise O mouth + hands up, then settle |

### Blink (bake into `idle`)

- Key `eye_L` / `eye_R` scaleY: 1 → 0.1 → 1 over ~0.12 s  
- Repeat 2–3 times across the 4 s loop  
- Optional: one double-blink  

### Walk (must bounce)

Do **not** animate left-right foot swaps like a stick figure.  
Do: whole body Y bounce + slight rotation + arm swing. Head lags ~2 frames behind body.

### Celebrate A/B/C

App only sends `activity = 4`. Inside Rive, from a **Celebrate** blend state or random transition, pick A/B/C.  
Simplest DIY approach:

1. State `Celebrate` is a **blend** or a small nested state machine  
2. On enter Celebrate, random 0 / 1 / 2 → play A, B, or C  
3. On complete → return to Idle (or hold Celebrate until `activity` changes)

If random in Rive feels hard on day one: play only `celebrate_A` for Phase 1, leave B/C timelines ready, wire random next weekend.

---

## 5. State machine (names must be exact)

1. Add State Machine named exactly: **`Companion`**  
2. Create **Inputs** (legacy Inputs panel is fine for Phase 1 — our React runtime supports them):

| Name | Type | Notes |
| --- | --- | --- |
| `activity` | Number | 0–6 |
| `talking` | Boolean | mouth cycle while true |
| `walking` | Boolean | true → walk loop |
| `appear` | Trigger | play appear, then go to activity |
| `leave` | Trigger | play leave |
| `react` | Trigger | play react, return |

### Graph (minimum viable)

```
Entry
  └── Idle          (activity == 0, default)

Any State ──appear──► Appear ──(on complete)──► (resolve by activity)
Any State ──leave───► Leave  ──(on complete)──► (Exit or hidden idle)
Any State ──react───► React  ──(on complete)──► previous / Idle

Idle / others ←── activity conditions ──→ Wave / Peek / Stretch /
                                           Celebrate / Nap / Point

When walking == true  → Walk (overrides activity hold while crossing)
When walking == false → back to activity state

When talking == true  → layer or blend a MouthTalk timeline on top
When talking == false → mouth rest
```

### Activity conditions (examples)

| Transition to | Condition |
| --- | --- |
| Idle | `activity == 0` |
| Wave | `activity == 1` |
| Peek | `activity == 2` |
| Stretch | `activity == 3` |
| Celebrate | `activity == 4` |
| Nap | `activity == 5` |
| Point | `activity == 6` |

Mix duration on transitions: **100–200 ms** so poses don’t pop.

### Talking (simple)

Add a short looping timeline `mouth_talk` (mouth scale / path morph Small→Medium→Smile).  
While `talking == true`, blend it on at low mix. While false, mouth follows the activity pose.

---

## 6. Test inside Rive before export

In the State Machine play mode:

1. Set `activity` to 0…6 — each pose must change  
2. Toggle `walking` — bounce walk plays  
3. Toggle `talking` — mouth moves  
4. Fire `appear`, `leave`, `react` — one-shots play  
5. Set `activity = 4` several times — ideally see A/B/C (or A only)  

Record a quick screen capture for yourself (Spec asks for this).

---

## 7. Export + drop into the app

1. **Export** → Runtime / `.riv` (not only save `.rev`)  
2. In the repo:

```text
public/companion/companion.riv
```

3. Keep the editor source somewhere safe:

```text
design/companion/welcome-companion.rev
```

(or Rive cloud file — either is fine)

4. Tell eng (or open a chat): “`.riv` is in `public/companion/` — wire it up.”

File size target: **&lt; 150 KB**. If bigger, simplify paths, fewer bitmaps, fewer keys.

---

## 8. Checklist (print this)

- [ ] Artboard name = `Companion`  
- [ ] State machine name = `Companion`  
- [ ] Inputs: `activity` `talking` `walking` `appear` `leave` `react` (exact spelling, lowercase)  
- [ ] Facing right  
- [ ] 256×256, transparent  
- [ ] Idle never frozen (breathe + blink)  
- [ ] Walk bounces  
- [ ] Celebrate works for `activity = 4`  
- [ ] Appear ≤ 400 ms, leave ≤ 320 ms  
- [ ] No text in the artboard  
- [ ] Exported to `public/companion/companion.riv`  

---

## 9. When you’re stuck

| Problem | Fix |
| --- | --- |
| Looks stiff | Add body scale breathe + head lag; don’t add more poses |
| Rig breaks | Unbind, parent shapes to bones rigidly, animate rotation only |
| State machine spaghetti | One transition per activity from a hub Idle; don’t cross-link everything |
| Too much time | Ship Idle + Wave + Celebrate + Walk + Leave only, map missing activities to Idle temporarily — then tell eng which numbers are stubs |
| AI art won’t rig | Redraw with 10 shapes; delete the PNG |

---

## 10. After this file exists

Engineering step (not yours unless you want it):

1. `npm i @rive-app/react-canvas`  
2. Replace SVG in `CompanionSprite.tsx` with Rive  
3. Map app `activity` / talking / walking / triggers → inputs  
4. Turn companion default on (or keep Settings toggle)  

You only need to finish **this DIY guide** for Step 1 to be done.
