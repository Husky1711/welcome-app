# Companion — Vector Construction Guide

| Field | Value |
| --- | --- |
| Version | 1.0.0 |
| Phase | 3 — Production Documentation |
| Owner | Companion art / product |
| Last Updated | 2026-07-28 |
| Depends On | Character Bible 1.0.0, Component Library 1.0.0 |
| Status | Locked (Phase 3) |

**Purpose:** Rebuild the mascot from primitives so any artist gets the same sprout.  
**Master deliverable (Phase 4):** `master_companion.svg`  
**Lock:** [`COMPANION_CHARACTER_BIBLE.md`](./COMPANION_CHARACTER_BIBLE.md)

---

## 1. SVG Rules (Rive-friendly)

| Rule | Requirement |
| --- | --- |
| Masks | **No** |
| Clipping paths | **No** |
| Raster / embedded images | **No** |
| Text | **No** (bubbles are app UI) |
| Gradients | Max **2** stops; prefer flat |
| Shades per object | Max **2** (fill + optional shade) |
| Strokes | Uniform Outline `#1F3D2A`; no “expand stroke” tricks that change silhouette |
| Groups | Named to match Rigging Blueprint |
| Background | Transparent |
| Effects | No drop shadows as filters — shadow is a separate ellipse layer |

Violate any rule → fail Asset Checklist.

---

## 2. Performance budget

| Budget | Limit |
| --- | --- |
| Vector nodes (master) | **&lt; 500** |
| Gradients | **≤ 2** total preferred; never complex mesh |
| Logical layers / groups | **≤ 40** |
| Artboard | **256 × 256** |
| Target FPS (runtime) | **60** |
| Phase 1 `.riv` size | **&lt; 150 KB** ([`COMPANION_SPEC.md`](./COMPANION_SPEC.md)) |

If over node budget: simplify boots and gloves first; never break silhouette.

---

## 3. Construction recipes

All fills from Character Bible. Stroke = Outline on closed shapes unless noted.

### Body

```text
Body
  → 1 vertical ellipse (seed / egg)
  → optional 1 soft shade ellipse (≤15% darker, no hard edge)
```

### Leaves

```text
Stem
  → 1 short rounded rect or thick path
Leaf_L / Leaf_R
  → 2 mirrored leaf paths (or ellipses warped once then locked)
  → optional centre vein: 1 thin path each
```

Do not remodel leaf outline per emotion — rotate group only.

### Eyes

```text
Eye fill
  → 1 oval
Glint
  → 1 small circle (separate layer)
Lid / closed variants
  → 1 path or arc (Component Library swaps)
```

### Eyebrows

```text
Brow_L / Brow_R
  → 1 short thick stroke or stadium path each
```

### Mouth

```text
Closed smile
  → 1 stroke path
Open / laugh / O
  → 1 closed path fill (Mouth coral) + optional tongue path
```

### Cheeks

```text
Cheek_L / Cheek_R
  → 1 soft ellipse each (#FFB8A8), no stroke or hairline
```

### Arms & legs

```text
Arm / Leg
  → 1 thick stroke or rounded capsule path (rubber-hose)
  → no elbow/knee joint art
```

### Hands (gloves)

```text
Glove
  → 1 mitten path (palm) + 3–4 finger bumps
  → OR 1 rounded rect + finger ellipses grouped
```

Keep under ~20 nodes per hand.

### Boots

```text
Boot
  → 1 rounded rect / capsule for cuff
  → 1 larger rounded shape for toe box
  → 1 flattened ellipse for sole (may scale in anim)
```

### Shadow

```text
Shadow
  → 1 horizontal ellipse under boots (#1F3D2A at ~15–25% opacity)
  → never a filter shadow on the body group
```

---

## 4. Build order (Phase 4)

1. 256×256 frame, transparent  
2. Place turnaround as locked guide (delete before export)  
3. Body → leaves → face → limbs → gloves → boots → shadow  
4. Name groups per Rigging Blueprint  
5. Run Asset Checklist  
6. Export `master_companion.svg`

Facing: **right** (3/4-right preferred for walk readability; front OK for turnaround sheets only — production master follows Spec facing right).

---

## 5. Component parts as separate symbols (optional)

Figma / SVG symbols may mirror Component Library IDs (`eye_open`, `mouth_smile`, …). Final Rive import may flatten to groups; IDs must remain recoverable for swaps.
