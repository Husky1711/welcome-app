# Companion — Test Plan

| Field | Value |
| --- | --- |
| Version | 1.0.0 |
| Phase | 4–7 QA |
| Owner | Companion art / engineering |
| Last Updated | 2026-08-03 |
| Depends On | Spec, Animation Bible, State Machine, Asset Checklist, Rive Build Guide |
| Status | Locked |

**Purpose:** Pass/fail QA before promoting any `companion.riv` (and before release).  
**Fail any required row → do not ship.**

---

## A. Phase 4 — SVG (Level 0)

| # | Check | Pass |
| --- | --- | --- |
| A1 | `art/production/master_companion.svg` exists | ☐ |
| A2 | Right-facing only (no Front/3⁄4 character packs) | ☐ |
| A3 | [`COMPANION_ASSET_CHECKLIST.md`](./COMPANION_ASSET_CHECKLIST.md) = **zero** failures | ☐ |
| A4 | SVG imports to Rive with no critical warnings / no raster | ☐ |
| A5 | Layer names match Rigging Blueprint (incl. `stem`) | ☐ |

**Level 0 exit:** all A* pass → Rive allowed.

---

## B. Level 1 — Rig only (no app export required)

| # | Check | Pass |
| --- | --- | --- |
| B1 | Artboard named `Companion` | ☐ |
| B2 | Bones FK chain complete; scrub without tearing | ☐ |
| B3 | Pivots: shoulder, stem base, ankle correct | ☐ |
| B4 | `rive/companion.rev` saved | ☐ |
| B5 | No `.riv` published to app yet | ☐ |

---

## C. Level 2 — Idle + Blink (first `.riv`)

| # | Check | Pass |
| --- | --- | --- |
| C1 | Idle loops forever (never frozen) | ☐ |
| C2 | Blink every ~2–5 s (or acceptable baked cadence) | ☐ |
| C3 | Body scale breath ≤ **101.5%** | ☐ |
| C4 | Leaves do not intersect body unnaturally | ☐ |
| C5 | Boots do not squash into bad silhouettes | ☐ |
| C6 | Exported `.riv` **&lt; 150 KB** | ☐ |
| C7 | Plays at target **60 FPS** on mid device / editor preview | ☐ |

---

## D. Levels 3–5 — Clips

| # | Check | Pass |
| --- | --- | --- |
| D1 | Wave reads clearly at 64px | ☐ |
| D2 | Stretch (activity 3) | ☐ |
| D3 | Point (activity 6) | ☐ |
| D4 | Celebrate A, B, C all distinct (activity 4) | ☐ |
| D5 | Peek (activity 2) | ☐ |
| D6 | Nap (activity 5) | ☐ |
| D7 | Appear ≤ 400 ms | ☐ |
| D8 | Leave ≤ 320 ms → fully gone | ☐ |
| D9 | Walk = bounce (not march) | ☐ |
| D10 | React one-shot then returns | ☐ |
| D11 | Motion stays within Animation Bible caps | ☐ |

---

## E. Level 6 — State Machine (Spec inputs)

| # | Check | Pass |
| --- | --- | --- |
| E1 | SM named `Companion` | ☐ |
| E2 | Inputs: `activity`, `talking`, `walking`, `appear`, `leave`, `react` only (Phase 1) | ☐ |
| E3 | `activity=0` → idle | ☐ |
| E4 | `activity=1` → wave | ☐ |
| E5 | `activity=2` → peek | ☐ |
| E6 | `activity=3` → stretch | ☐ |
| E7 | `activity=4` → celebrate (A/B/C random inside Rive) | ☐ |
| E8 | `activity=5` → nap | ☐ |
| E9 | `activity=6` → point | ☐ |
| E10 | `talking=true` → mouth_talk without killing body clip | ☐ |
| E11 | `walking=true` → walk | ☐ |
| E12 | `appear` trigger → appear then activity | ☐ |
| E13 | `leave` trigger → leave → off | ☐ |
| E14 | `react` trigger → react → return | ☐ |

---

## F. Level 7 — React integration

| # | Check | Pass |
| --- | --- | --- |
| F1 | File at `public/companion/companion.riv` | ☐ |
| F2 | Companion off by default / Settings respects toggle | ☐ |
| F3 | Scarce visit: appears, performs, leaves (not always-on) | ☐ |
| F4 | App `activity=4` shows celebrate | ☐ |
| F5 | App `talking` drives mouth | ☐ |
| F6 | App `walking` drives walk when used | ☐ |
| F7 | Appear / leave triggers work from app | ☐ |
| F8 | React on tap works | ☐ |
| F9 | Reduced motion hides companion | ☐ |
| F10 | Readable over light/dark busy UI | ☐ |

---

## Sign-off

| Field | Value |
| --- | --- |
| Build / commit | |
| Level reached | |
| Reviewer | |
| Date | |
| Ship? | ☐ Yes / ☐ No |

Promote to release only when **required checks for that level** are all Pass.
