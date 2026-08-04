# Companion — State Machine Contract

| Field | Value |
| --- | --- |
| Version | 1.0.0 |
| Phase | 3 — Production Documentation |
| Owner | Companion art / engineering |
| Last Updated | 2026-07-28 |
| Depends On | Spec (authoritative), Rigging Blueprint 1.0.0, Animation Bible 1.0.0 |
| Status | Locked (Phase 3) |

**Purpose:** Animator-facing view of inputs, clips, and legal transitions.  
**Authority:** If this file and [`COMPANION_SPEC.md`](./COMPANION_SPEC.md) disagree, **Spec wins** — update this file.

Artboard name: `Companion`  
State machine name: `Companion`

---

## 1. Phase 1 inputs (locked)

| Input | Type | Meaning |
| --- | --- | --- |
| `activity` | Number 0–6 | Which hold pose / loop |
| `talking` | Boolean | Speech bubble up → mouth cycle |
| `walking` | Boolean | Bounce-walk (cross entrance) |
| `appear` | Trigger | Entrance → settle into activity |
| `leave` | Trigger | Exit → fully gone |
| `react` | Trigger | One-shot tap reaction → return |

### `activity` map

| Value | Clip family |
| --- | --- |
| 0 | `idle` |
| 1 | `wave` |
| 2 | `peek` |
| 3 | `stretch` |
| 4 | `celebrate` (A/B/C random **inside** Rive) |
| 5 | `nap` |
| 6 | `point` |

---

## 2. Reserved inputs (Phase 2+ — do not invent in Phase 1 `.riv`)

| Input | Notes |
| --- | --- |
| `mood` | Scales speed / size (Directing) |
| `emotion` / `action` | Split replaces single activity |
| `lookX` / `lookY` | Eye aim |
| `eyeStyle` | Normal / smile / sleepy / half |
| `mouth` | Discrete mouth shape id |
| `coachState` | Future coach / habit context |

Document here so artists don’t bake fake controls that the app never sets.

---

## 3. Outputs / clips

| Clip | Kind | Notes |
| --- | --- | --- |
| `idle` | Loop | Always alive |
| `wave` | Loop / hold | |
| `peek` | Hold | |
| `stretch` | One-shot or short loop | |
| `celebrate_a` | One-shot | |
| `celebrate_b` | One-shot | |
| `celebrate_c` | One-shot | |
| `nap` | Loop | |
| `point` | Hold | |
| `walk` | Loop | While `walking` |
| `react` | One-shot | |
| `appear_edge` | One-shot | ≤ 400 ms |
| `appear_perch` | One-shot | ≤ 400 ms |
| `appear_cross` | One-shot | uses walk | ≤ 400 ms |
| `leave` | One-shot | ≤ 320 ms |
| `mouth_talk` | Additive / layered | While `talking` |

App may only fire Spec inputs; appear flavour can be chosen inside Rive or via future input — Phase 1 may pick one appear style if needed, but prefer three.

---

## 4. Transition graph (minimum)

```text
[Off / Exit]
     │ appear
     ▼
[Appear_*] ──► [Activity Hold]
                    │
        ┌───────────┼───────────┐
        │           │           │
        ▼           ▼           ▼
     walking?    react      leave
        │           │           │
        ▼           ▼           ▼
      [Walk]    [React]      [Leave] ──► [Off]
        │           │
        └────► Activity Hold
```

### Rules

1. **`appear`** always plays before settling on current `activity`.  
2. **`leave`** interrupts hold and finishes exit; then character is gone.  
3. **`react`** interrupts hold, plays once, returns to same `activity`.  
4. **`walking == true`** blends or replaces locomotion with `walk` (especially `appear_cross`).  
5. **`activity` changes** while on screen: cross-fade or cut to new hold (keep short).  
6. **`activity == 4`:** Rive picks celebrate_a/b/c at random; app does not choose.  
7. **`talking`:** layer `mouth_talk` without cancelling body clip.

---

## 5. Example sequences

| Product moment | Inputs |
| --- | --- |
| Friendly visit | `appear` → `activity=1` (wave) → `leave` |
| Morning | `appear` → `activity=3` (stretch) → `leave` |
| Habit done | `appear` → `activity=4` (celebrate) → `leave` |
| Nudge | `appear` → `activity=6` (point) → optional `talking` → `leave` |
| Late night | `appear` → `activity=5` (nap) → `leave` |
| User tap | `react` (anytime during hold) |
| Cross stage | `walking=true` + `appear` (cross) → activity → `leave` |

Events → performance intent: [`COMPANION_EVENT_BOOK.md`](./COMPANION_EVENT_BOOK.md).

---

## 6. Engineering sync checklist

- [ ] Input names/types match Spec exactly  
- [ ] No Phase 2 inputs required for Phase 1 ship  
- [ ] Celebrate variants internal  
- [ ] File export: `companion.riv` → app `public/` (see Spec / Rive DIY)
