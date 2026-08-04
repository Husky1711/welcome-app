# Companion — Asset Production Checklist

| Field | Value |
| --- | --- |
| Version | 1.0.0 |
| Phase | 3 — Production Documentation |
| Owner | Companion art / product |
| Last Updated | 2026-07-28 |
| Depends On | Character Bible, Component Library, Vector Construction, Rigging Blueprint, Animation Bible, State Machine |
| Status | Locked (Phase 3) |

**Purpose:** Pass/fail gate before importing SVG into Rive (Phase 4 → 5).  
**Fail any row → fix asset; do not “fix in Rive.”**

---

## Pre-flight

| # | Check | Pass? |
| --- | --- | --- |
| 0 | Character Bible Status is **Locked** | ☐ |
| 1 | Working from turnaround + Character Bible only (no expression PNGs as geometry) | ☐ |
| 1b | Deliverables match [`COMPANION_ASSET_MANIFEST.md`](./COMPANION_ASSET_MANIFEST.md) | ☐ |

---

## Artboard & export

| # | Check | Pass? |
| --- | --- | --- |
| 2 | Artboard **256 × 256** | ☐ |
| 3 | Transparent background (no scene, no checker baked in) | ☐ |
| 4 | Master facing **right** (Spec) | ☐ |
| 5 | Filename `master_companion.svg` (or documented equivalent) | ☐ |
| 6 | No embedded raster / PNG / JPEG | ☐ |

---

## Palette & stroke

| # | Check | Pass? |
| --- | --- | --- |
| 7 | Body `#FFF2D8` | ☐ |
| 8 | Outline `#1F3D2A` uniform weight | ☐ |
| 9 | Leaves `#4EA353` | ☐ |
| 10 | Limbs/boots `#3D7B3A` (not brown) | ☐ |
| 11 | Cheeks `#FFB8A8` present | ☐ |
| 12 | Mouth interior `#FF7E5F` when open | ☐ |
| 13 | Gloves `#FFFEFA` | ☐ |
| 14 | ≤ 2 shades per object; ≤ 2 gradient stops | ☐ |

---

## Silhouette & Expression Rules

| # | Check | Pass? |
| --- | --- | --- |
| 15 | Readable at **64px** | ☐ |
| 16 | Body / boot / glove / leaf **shapes** match turnaround | ☐ |
| 17 | No Miss Minutes / clock / Disney likeness | ☐ |
| 18 | No text in artwork | ☐ |
| 19 | Props/FX (if any) on **separate** groups | ☐ |

---

## SVG Rules

| # | Check | Pass? |
| --- | --- | --- |
| 20 | No masks | ☐ |
| 21 | No clipping paths | ☐ |
| 22 | No filter drop-shadows on body (shadow layer ellipse only) | ☐ |
| 23 | Groups named per Rigging Blueprint | ☐ |
| 24 | Node count **&lt; 500** | ☐ |
| 25 | Logical layers **≤ 40** | ☐ |

---

## Rig readiness

| # | Check | Pass? |
| --- | --- | --- |
| 26 | `eye_L` / `eye_R` / glints separate | ☐ |
| 27 | `mouth` separate (swappable) | ☐ |
| 28 | `leaf_L` / `leaf_R` separate groups | ☐ |
| 29 | Arms/hands/legs/boots separable | ☐ |
| 30 | Face parts not merged into single flat body bitmap | ☐ |
| 31 | Pivot-friendly: leaves at stem, boots at ankle | ☐ |

---

## Component kit (Phase 1)

| # | Check | Pass? |
| --- | --- | --- |
| 32 | Minimum eyes present (open, closed, half, happy, surprised) | ☐ |
| 33 | Minimum mouths present (tiny_smile, smile, open, o, laugh) | ☐ |
| 34 | Neutral + happy + sleep leaf angles possible | ☐ |

---

## Sign-off

| Field | Value |
| --- | --- |
| Reviewed by | |
| Date | |
| Version stamp | Character Bible __ · Checklist 1.0.0 |
| Ready for Rive import | ☐ Yes |

Only when **Ready for Rive import** is checked: start Phase 5 per [`COMPANION_RIVE_DIY.md`](./COMPANION_RIVE_DIY.md) and [`COMPANION_STATE_MACHINE.md`](./COMPANION_STATE_MACHINE.md).
