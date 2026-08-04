# Companion — Phase 4 Asset Manifest

| Field | Value |
| --- | --- |
| Version | 1.0.0 |
| Phase | 4 — Master SVG |
| Owner | Companion art / product |
| Last Updated | 2026-07-28 |
| Depends On | Character Bible 1.0.0 (Locked), Component Library 1.0.0, Vector Construction 1.0.0 |
| Status | Active — Phase 4 NOW |

**Purpose:** Exact file list Phase 4 must produce. Phase 4 is not “draw something” — it is “deliver every row below.”  
**QA:** Every SVG must pass [`COMPANION_ASSET_CHECKLIST.md`](./COMPANION_ASSET_CHECKLIST.md).  
**Geometry:** Only turnaround + Character Bible — never expression PNGs.

Canonical folder (frozen pipeline):

```text
art/production/master_companion.svg
art/production/eyes/
art/production/mouths/
art/production/leaves/
```

---

## Required masters

| # | File | Notes | Done |
| --- | --- | --- | --- |
| 1 | `master_companion.svg` | Full assembled character, facing right, 256×256, named groups | ☐ |
| 2 | `master_companion.fig` | Optional Figma source (same geometry) | ☐ |
| 3 | `master_companion.ai` | Optional Illustrator source | ☐ |

At least **`master_companion.svg` is mandatory**. `.fig` / `.ai` are optional but recommended if that is your authoring tool.

---

## Required part exports (Phase 1 kit)

Export as separate SVGs **or** as named symbols/groups inside the master (both acceptable if Checklist passes). Prefer both master + parts for Rive flexibility.

### Structure

| # | File | Done |
| --- | --- | --- |
| 4 | `shadow.svg` | ☐ |
| 5 | `body.svg` | ☐ |
| 6 | `leaf_left.svg` | ☐ |
| 7 | `leaf_right.svg` | ☐ |
| 8 | `boot_left.svg` | ☐ |
| 9 | `boot_right.svg` | ☐ |

### Eyes

| # | File | Done |
| --- | --- | --- |
| 10 | `eye_open.svg` | ☐ |
| 11 | `eye_half.svg` | ☐ |
| 12 | `eye_closed.svg` | ☐ |
| 13 | `eye_happy.svg` | ☐ |
| 14 | `eye_surprised.svg` | ☐ |

### Mouths

| # | File | Done |
| --- | --- | --- |
| 15 | `mouth_tiny_smile.svg` | ☐ |
| 16 | `mouth_smile.svg` | ☐ |
| 17 | `mouth_open.svg` | ☐ |
| 18 | `mouth_o.svg` | ☐ |
| 19 | `mouth_laugh.svg` | ☐ |

### Hands

| # | File | Done |
| --- | --- | --- |
| 20 | `hand_open.svg` | ☐ |
| 21 | `hand_fist.svg` | ☐ |
| 22 | `hand_point.svg` | ☐ |

### Optional Phase 1+ (nice to have)

| # | File | Done |
| --- | --- | --- |
| 23 | `eye_sleepy.svg` | ☐ |
| 24 | `mouth_neutral.svg` | ☐ |
| 25 | `mouth_sad.svg` | ☐ |
| 26 | `hand_wave.svg` | ☐ |
| 27 | `hand_thumbs_up.svg` | ☐ |
| 28 | `brow_left.svg` / `brow_right.svg` | ☐ |

---

## Phase 4 Definition of Done

- [ ] All **required** rows (1, 4–22) exist or are represented as named groups inside `master_companion.svg`
- [ ] [`COMPANION_ASSET_CHECKLIST.md`](./COMPANION_ASSET_CHECKLIST.md) signed with **zero failures**
- [ ] Geometry derived only from turnaround + Character Bible
- [ ] Ready for Rive import (Phase 5)

When checked, mark Phase 4 **Complete** in [`COMPANION_PIPELINE.md`](./COMPANION_PIPELINE.md).
