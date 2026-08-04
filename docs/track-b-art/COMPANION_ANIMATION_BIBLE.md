# Companion — Animation Bible

| Field | Value |
| --- | --- |
| Version | 1.0.0 |
| Phase | 3 — Production Documentation |
| Owner | Companion art / product |
| Last Updated | 2026-07-28 |
| Depends On | Character Bible 1.0.0, Component Library 1.0.0, Directing |
| Status | Locked (Phase 3) |

**Purpose:** Numeric motion rules so idle, emotions, and Phase 1 activities stay reproducible.  
**Acting intent:** [`COMPANION_DIRECTING.md`](./COMPANION_DIRECTING.md)  
**Wiring:** [`COMPANION_STATE_MACHINE.md`](./COMPANION_STATE_MACHINE.md)

Mood (Calm / Playful / Sleepy / Energetic) **scales** speed and gesture size — it never invents new clips.

---

## 1. Hard caps

| Parameter | Min | Max |
| --- | --- | --- |
| Body scale bias | 95% | 105% |
| Leaf rotation from neutral | −25° | +20° |
| Idle bounce amplitude | 0 | 5 px |
| Walk vertical bounce | — | ~8–12% of body height |
| Enter duration | — | ≤ 400 ms |
| Exit duration | — | ≤ 320 ms |

Exceeding caps = break Character Bible feel. Fix the clip, don’t raise the cap casually (`1.x` only with review).

---

## 2. Emotion → body / leaf / bounce

| Emotion | Leaf rot | Body scale | Bounce (idle amp) | Notes |
| --- | --- | --- | --- | --- |
| Neutral | 0° | 100% | 2 px | Default hold |
| Happy | +12° | 102% | 3 px | Soft lift |
| Excited | +18° | 105% | 5 px | Cap; don’t go higher |
| Curious | tip forward ~+8° asym | 100% | 2 px | Head tilt ±8° |
| Proud | +10° | 102% | 2 px | Chin up via head bone |
| Concern | −8° | 99% | 1 px | Never guilt |
| Sad (rare) | −10° | 98% | 0 | Soft only |
| Sleepy / Sleep | −20° | 99% | 0 | Slow blink |
| Surprised | +5° back | 103% | 0 | Brief |

---

## 3. Idle life (baked — Spec §4)

| Behaviour | Timing | Detail |
| --- | --- | --- |
| Blink | every **2–5 s** random | `eye_open` → `eye_half` → `eye_closed` → open; occasional double-blink |
| Breath | ~**4 s** cycle | Body scale 100% ↔ 101.5%; leaves float ±2° |
| Weight shift | every **6–10 s** | Hip ± few degrees; shadow scales slightly |
| Head tilt | rare | ±6°; return to centre |

Never freeze on a still frame during `activity = idle`.

---

## 4. Walk

- Bounce + squash on land + stretch on rise  
- **Not** left-right puppet march  
- Arms oppose legs lightly; head lags 1–2 frames  
- `walking = true` for full cross entrance  

---

## 5. Phase 1 activity clips

| Clip | Duration hint | Key poses |
| --- | --- | --- |
| `idle` | loop | Breath + blink + weight shift |
| `wave` | 1.0–1.4 s loop/hold | One arm rotate from shoulder; leaf_happy; mouth_smile/open |
| `peek` | hold | Lean; eyes lead; leaf_curious; partial hide OK |
| `stretch` | 1.2–1.6 s | Arms up; eye_closed; mouth open yawn; leaf_sleep |
| `celebrate_a/b/c` | 0.8–1.2 s | Arms up / jump; fist; laugh; random pick inside Rive |
| `nap` | loop | Eyes closed; sway; leaf_sleep |
| `point` | hold | Arm point; leaf_forward; focused eyes |
| `react` | ≤ 0.6 s one-shot | mouth_o; hands up; return to prior activity |
| `appear_*` | ≤ 400 ms | Edge / perch / cross |
| `leave` | ≤ 320 ms | Fade + settle out |
| `mouth_talk` | while talking | Cycle shapes; don’t fight celebrate mouth |

---

## 6. Mood multipliers (from Directing)

| Mood | Speed | Gesture size | Bounce |
| --- | --- | --- | --- |
| Calm | 0.9× | Small | Low |
| Playful | 1.2× | Large | High |
| Sleepy | 0.7× | Tiny | Almost none |
| Energetic | 1.3× | Medium–large | Medium |

Phase 1 may bake **Calm** as default and approximate others inside clips. Expose `mood` only when Spec adds it (Phase 2).

---

## 7. Anticipation & follow-through

- Tiny squash before jump / celebrate / wave start  
- 2–3 frames overshoot on appear land  
- Hands and head lag body on walk and celebrate  

---

## 8. Out of scope for v1.0.0

Full 80+ expression library motion sheets — stay in concept prompts until Phase 9. This bible only guarantees Phase 1 Spec activities + emotion caps above.
