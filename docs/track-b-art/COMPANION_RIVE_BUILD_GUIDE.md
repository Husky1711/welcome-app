# Companion — Rive Build Guide

| Field | Value |
| --- | --- |
| Version | 1.0.0 |
| Phase | 5 — Rive Build |
| Owner | Companion art / engineering |
| Last Updated | 2026-08-03 |
| Depends On | Pipeline v2.0 Frozen, Asset Checklist pass, Spec, Rigging Blueprint, State Machine, Animation Bible |
| Status | Locked playbook |

**Purpose:** Step-by-step editor choreography.  
**Not for:** colours, personality, new poses, or inventing inputs.  
**Authority:** If this conflicts with [`COMPANION_SPEC.md`](./COMPANION_SPEC.md), Spec wins.

**Prerequisite:** [`art/production/master_companion.svg`](../art/production/README.md) passed [`COMPANION_ASSET_CHECKLIST.md`](./COMPANION_ASSET_CHECKLIST.md).

Follow [`COMPANION_PIPELINE.md`](./COMPANION_PIPELINE.md) **build levels**. Do not skip.

---

## 0. Before you open Rive

- [ ] Asset Checklist signed (zero failures)  
- [ ] SVG is **right-facing only** (no Front/3⁄4 groups in the import file)  
- [ ] Groups named per Rigging Blueprint (`body`, `stem`, `leaf_L`, `leaf_R`, `eye_L`, …)  
- [ ] No masks, clips, rasters, text  

---

## 1. Import

1. New Rive file → save as `rive/companion.rev`  
2. Artboard size **256 × 256**, name artboard **`Companion`**  
3. **File → Import** → `art/production/master_companion.svg`  
4. Confirm no raster images came along  
5. Delete any leftover guide / turnaround layers if present  

---

## 2. Rename verification

Walk the hierarchy. Fix any `Group`, `Path`, `Union`, `Vector N`:

```text
shadow
torso / body
  head
    stem
    leaf_L
    leaf_R
    brow_L
    brow_R
    eye_L → glint_L
    eye_R → glint_R
    cheek_L
    cheek_R
    mouth → tongue (optional)
arm_L → hand_L
arm_R → hand_R
leg_L → boot_L
leg_R → boot_R
```

- [ ] Every required name present  
- [ ] `stem` exists as its own group  
- [ ] FX props (if any) are **siblings**, not inside body fill  

Eye / mouth variants: use **Solo** or discrete drawables (`eye_open`, `eye_closed`, …) — prefer swap over path morph.

---

## 3. Pivot placement

Set origins before bones:

| Node | Pivot |
| --- | --- |
| body / torso | centre of mass |
| head | upper body / neck |
| leaf_L / leaf_R | stem base |
| arm_L / arm_R | shoulder |
| hand_L / hand_R | wrist |
| leg_L / leg_R | hip |
| boot_L / boot_R | ankle |
| shadow | centre under feet |

- [ ] Scrub rotation on each part — arcs look natural  
- [ ] Feet near bottom of artboard  

---

## 4. Bones (Level 1) — FK only

Create:

```text
root
  spine
    head
      leaf_L_bone
      leaf_R_bone
  shoulder_L → elbow_L → wrist_L
  shoulder_R → elbow_R → wrist_R
  hip_L → knee_L → ankle_L
  hip_R → knee_R → ankle_R
```

Rules:

- **No IK** in Phase 1  
- **No body mesh** — breath = bone scale  
- Bind artwork to bones; verify poses don’t tear gloves/boots  
- **Save `.rev`** — do **not** export `.riv` yet  

Level 1 gate: scrub bones in editor; character holds together.

---

## 5. Animations (Levels 2–5)

Obey [`COMPANION_ANIMATION_BIBLE.md`](./COMPANION_ANIMATION_BIBLE.md) caps.

### Level 2 — first export allowed after this

| Clip | Notes |
| --- | --- |
| `idle` | Loop. Breath 100% ↔ 101.5% over ~4s. Leaf ±2°. Weight shift optional. |
| Blink | Solo/swap open→half→closed; interval 2–5s (listener or nested). Works on non-nap activities if possible. |

Export test `.riv` only after Level 2 looks alive.

### Level 3

| Clip | Notes |
| --- | --- |
| `wave` | FK shoulder→elbow→wrist; ~1.0–1.4s |
| `stretch` | Arms up; eyes closed; yawn mouth |
| `point` | One arm; look toward point |

### Level 4

| Clip | Notes |
| --- | --- |
| `celebrate_a` / `_b` / `_c` | Three short variants; random pick inside SM |
| `peek` | Lean; no SVG clip masks — hide via pose / opacity / app placement |
| `nap` | Eyes closed; leaf droop; slow sway |

### Level 5

| Clip | Notes |
| --- | --- |
| `appear` | ≤400ms — Phase 1: **one** edge-style appear |
| `leave` | ≤320ms → fully gone |
| `walk` | Bounce squash/stretch; simple hop OK at 64px |
| `mouth_talk` | Additive loop while `talking` |
| `react` | ≤0.6s one-shot → return |

---

## 6. State Machine (Level 6)

Name state machine **`Companion`**.

### Inputs (exact Spec strings)

| Input | Type |
| --- | --- |
| `activity` | Number 0–6 |
| `talking` | Boolean |
| `walking` | Boolean |
| `appear` | Trigger |
| `leave` | Trigger |
| `react` | Trigger |

Do **not** add `TriggerWave`, `isSleeping`, etc. for the app API.

### Suggested layers

```text
Presence:   Off ──appear──► Appear ──► Active ──leave──► Off
Locomotion: Hold ↔ Walk (walking)
Activity:   idle/wave/peek/stretch/celebrate/nap/point (activity number)
Interrupt:  react → return
Mouth:      talking → mouth_talk (additive)
```

Celebrate: when `activity == 4`, pick A/B/C inside Rive (document which method you used in the `.rev`).

Graph detail: [`COMPANION_STATE_MACHINE.md`](./COMPANION_STATE_MACHINE.md).

---

## 7. Export QA (Level 6 → Phase 6)

1. Export `build/companion.riv` (or direct to `public/companion/companion.riv`)  
2. Run full [`COMPANION_TEST_PLAN.md`](./COMPANION_TEST_PLAN.md)  
3. Confirm file **&lt; 150 KB**  
4. Confirm artboard + SM names = `Companion`  
5. Keep `rive/companion.rev` as editable source  

---

## 8. React Integration (Level 7)

- Drop file at `public/companion/companion.riv`  
- Drive **only** Spec inputs from app code  
- Scarce appear/leave — do not force always-on  
- Reduced motion: app hides companion (Spec)  

---

## Anti-patterns

| Don’t | Do |
| --- | --- |
| Import turnaround sheet or 3D PNG | Import production SVG only |
| Multi-facing master in one Rive file | Right-facing only |
| IK / body mesh Day 1 | FK + scale breath |
| Invent new inputs | Spec inputs only |
| Export before Idle+Blink | Level 2 first export |
| Design colours in Rive | Character Bible |
