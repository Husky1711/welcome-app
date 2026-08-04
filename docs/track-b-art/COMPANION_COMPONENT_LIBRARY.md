# Companion — Component Library

| Field | Value |
| --- | --- |
| Version | 1.0.0 |
| Phase | 3 — Production Documentation |
| Owner | Companion art / product |
| Last Updated | 2026-07-28 |
| Depends On | Character Bible 1.0.0 |
| Status | Locked (Phase 3) |

**Purpose:** Reusable face and hand parts. Every expression and animation swaps from this catalog — never invent a one-off eye or mouth that breaks the lock.

**Depends on:** [`COMPANION_CHARACTER_BIBLE.md`](./COMPANION_CHARACTER_BIBLE.md)  
**Motion numbers:** [`COMPANION_ANIMATION_BIBLE.md`](./COMPANION_ANIMATION_BIBLE.md)

---

## Rules

1. Parts keep Character Bible palette and outline.
2. Swap shapes; do not reshape the body to “sell” an emotion.
3. Phase 1 must ship at least: Open, Closed eyes · Smile, O mouths · Neutral leaves · Open + Fist hands.
4. Look L/R/Up/Down eyes are **Phase 2** (Spec `lookX` / `lookY`) unless baked as static idle accents.

---

## Eyes

| ID | File hint | Look | Phase |
| --- | --- | --- | --- |
| `eye_open` | `eye_open.svg` | Default oval + glint | 1 |
| `eye_half` | `eye_half.svg` | Soft lid; drowsy / blink mid | 1 |
| `eye_closed` | `eye_closed.svg` | Down-curve line or filled lid | 1 |
| `eye_sleepy` | `eye_sleepy.svg` | Heavy lids, slow | 1 |
| `eye_happy` | `eye_happy.svg` | Up-curve “∧” squint smile-eyes | 1 |
| `eye_surprised` | `eye_surprised.svg` | Larger oval, bigger glint | 1 |
| `eye_look_left` | `eye_look_left.svg` | Pupils / glints shifted left | 2 |
| `eye_look_right` | `eye_look_right.svg` | Shifted right | 2 |
| `eye_look_up` | `eye_look_up.svg` | Shifted up | 2 |
| `eye_look_down` | `eye_look_down.svg` | Shifted down | 2 |

Always pair L/R eyes. Glints stay on separate layers (`glint_L`, `glint_R`).

---

## Mouths

| ID | File hint | Look | Phase |
| --- | --- | --- | --- |
| `mouth_neutral` | `mouth_neutral.svg` | Soft flat or tiny curve | 1 |
| `mouth_tiny_smile` | `mouth_tiny_smile.svg` | Small closed smile | 1 |
| `mouth_smile` | `mouth_smile.svg` | Clear closed smile | 1 |
| `mouth_open` | `mouth_open.svg` | Open smile, coral fill | 1 |
| `mouth_laugh` | `mouth_laugh.svg` | Wider open + tongue | 1 |
| `mouth_o` | `mouth_o.svg` | Surprised O | 1 |
| `mouth_sad` | `mouth_sad.svg` | Soft downturn — rare, never guilt | 1+ |

Tongue uses Mouth `#FF7E5F` only when open/laugh. Talking cycle (Phase 1): swap Small → Medium → Smile → Closed on ~120–180 ms while `talking` (see Spec / State Machine).

---

## Leaves

Angles are rotations at the **stem base**. Shape stays locked.

| ID | Bias | Typical use | Phase |
| --- | --- | --- | --- |
| `leaf_neutral` | 0° | Idle | 1 |
| `leaf_happy` | +12° up | Happy, wave | 1 |
| `leaf_curious` | tip forward / toward look | Peek, investigate | 1 |
| `leaf_droopy` | −10° | Concern, soft sad | 1 |
| `leaf_sleep` | −20° | Nap, yawn | 1 |
| `leaf_forward` | tip toward viewer lean | Idea, coach | 1 |
| `leaf_backward` | tip back | Oops, recoil | 1 |

L/R may offset slightly for cheeky asymmetry; never change leaf silhouette.

---

## Eyebrows

| ID | Look | Phase |
| --- | --- | --- |
| `brow_neutral` | Soft arches | 1 |
| `brow_raised` | Both up | 1 |
| `brow_concern` | Inner corners up | 1 |
| `brow_cheeky` | One raised | 1 |

---

## Hands

| ID | File hint | Use | Phase |
| --- | --- | --- | --- |
| `hand_open` | `hand_open.svg` | Default, wave open, hug | 1 |
| `hand_fist` | `hand_fist.svg` | Celebrate, motivate | 1 |
| `hand_point` | `hand_point.svg` | Point / nudge / idea | 1 |
| `hand_wave` | `hand_wave.svg` | Optional wave-shaped open | 1 |
| `hand_thumbs_up` | `hand_thumbs_up.svg` | Encourage | 1+ |
| `hand_heart` | `hand_heart.svg` | Finger heart | 1+ |
| `hand_behind` | — | Pose only (hands hidden behind body) | 1 |

Gloves stay `#FFFEFA` with Outline stroke. Do not slim gloves to match mood.

---

## Phase 1 minimum kit (must exist before Rive)

```text
eye_open, eye_closed, eye_half, eye_happy, eye_surprised
mouth_tiny_smile, mouth_smile, mouth_open, mouth_o, mouth_laugh
leaf_neutral, leaf_happy, leaf_curious, leaf_sleep
brow_neutral, brow_raised, brow_concern
hand_open, hand_fist, hand_point
```

---

## Mapping to Spec activities

| Activity | Eyes | Mouth | Leaves | Hands (typical) |
| --- | --- | --- | --- | --- |
| idle | open / blink | tiny_smile | neutral | open / behind |
| wave | open or happy | open / smile | happy | wave + open |
| peek | open / look | tiny_smile | curious | open (hold edge) |
| stretch | closed / sleepy | open (yawn) | sleep | open (cover mouth) |
| celebrate | happy / open | laugh | happy | fist |
| nap | closed / sleepy | tiny_smile | sleep | open / rest |
| point | open | tiny_smile / smirk | forward | point |
| react | surprised | o | backward | open / up |
