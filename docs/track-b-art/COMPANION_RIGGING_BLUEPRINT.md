# Companion — Rigging Blueprint

| Field | Value |
| --- | --- |
| Version | 1.0.0 |
| Phase | 3 — Production Documentation |
| Owner | Companion art / product |
| Last Updated | 2026-07-28 |
| Depends On | Character Bible 1.0.0, Vector Construction 1.0.0 |
| Status | Locked (Phase 3) |

**Purpose:** Layer hierarchy, pivots, and deform rules before opening Rive.  
**Contract names:** Artboard `Companion` · State machine `Companion` — [`COMPANION_SPEC.md`](./COMPANION_SPEC.md)

---

## 1. Layer hierarchy (back → front)

```text
shadow
body
  head                    (may be same mesh as body; transform pivot at head centre)
    leaf_L
    leaf_R
    brow_L
    brow_R
    eye_L
      glint_L
    eye_R
      glint_R
    cheek_L
    cheek_R
    mouth
      tongue              (optional child)
arm_L
  hand_L
arm_R
  hand_R
leg_L
  boot_L                  (Spec: foot_L)
leg_R
  boot_R                  (Spec: foot_R)
```

**Alias note:** Spec / Soul may say `foot_L` / `sprout`. Prefer `boot_L` / `boot_R` and `leaf_L` / `leaf_R` in SVG; map aliases in Rive if needed. Do not rename after Phase 5 without Spec 2.0.

FX / props (confetti, bottle, blanket) are **sibling groups**, never children of `body` fill.

---

## 2. Pivot table

| Layer | Pivot | Rotates | Scales | Notes |
| --- | --- | --- | --- | --- |
| `shadow` | centre | no | yes (walk squash) | Opacity only otherwise |
| `body` | centre of mass | yes (small) | yes | Breath / squash / stretch |
| `head` | neck / upper body centre | yes | soft | Lag behind body on walk |
| `leaf_L` | stem base | **yes** | no | Angle from Animation Bible |
| `leaf_R` | stem base | **yes** | no | May mirror offset |
| `brow_L` / `brow_R` | inner third | yes | no | Or shape-swap |
| `eye_L` / `eye_R` | centre | no | no | Swap components; Phase 2 look = glint/pupil move |
| `glint_L` / `glint_R` | centre | no | no | Translate for look |
| `mouth` | centre | no | no | Shape-swap |
| `tongue` | hinge at mouth | yes | no | Laugh only |
| `arm_L` / `arm_R` | **shoulder** | **yes** | no | Rubber-hose bend via bone |
| `hand_L` / `hand_R` | **wrist** | yes | no | Swap hand components |
| `leg_L` / `leg_R` | **hip** | yes | no | Bounce walk |
| `boot_L` / `boot_R` | **ankle** | yes | **sole only** | Vertical squash on land |

---

## 3. Bones (Rive)

Minimum bone chain:

```text
root
  spine (body)
    head
      leaf_L_bone
      leaf_R_bone
  shoulder_L → elbow_L → wrist_L
  shoulder_R → elbow_R → wrist_R
  hip_L → knee_L → ankle_L
  hip_R → knee_R → ankle_R
```

Elbows/knees exist as bones for bend; **artwork** stays rubber-hose (no joint drawings).

---

## 4. Deform rules

| Allowed | Forbidden |
| --- | --- |
| Body soft belly deform for breath | Warping boots into new silhouettes |
| Sole squash on land | Scaling gloves with emotion |
| Leaf rotation at stem | Remeshing leaf outline for mood |
| Arm stretch ≤ Animation Bible | Independent redesign of limb thickness |
| Mouth / eye **swaps** | Single bitmap mouth flap as only talk |

---

## 5. Naming checklist

- [ ] Artboard: `Companion`  
- [ ] State machine: `Companion`  
- [ ] Inputs: exactly Spec (`activity`, `talking`, `walking`, `appear`, `leave`, `react`)  
- [ ] Layer names match table above  
- [ ] No duplicate unnamed groups  

Transitions and clip list: [`COMPANION_STATE_MACHINE.md`](./COMPANION_STATE_MACHINE.md).
