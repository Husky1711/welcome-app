# Companion — Character Bible

| Field | Value |
| --- | --- |
| Version | 1.0.0 |
| Phase | 3 — Production Documentation |
| Owner | Companion art / product |
| Last Updated | 2026-07-28 |
| Depends On | [`companion_turnaround.png`](./Expressions/companion_turnaround.png) |
| Status | **Locked** |

**Purpose:** Official visual identity. One place for colours, proportions, silhouette, accessories, and what may never change.  
**Law:** The approved turnaround is the source of truth. Soul personality stays in [`COMPANION_SOUL.md`](./COMPANION_SOUL.md); this file owns geometry and paint.

See pipeline: [`COMPANION_PIPELINE.md`](./COMPANION_PIPELINE.md).

---

## 0. Official Character Lock

[`Expressions/companion_turnaround.png`](./Expressions/companion_turnaround.png) is the **only** canonical visual reference.

Every SVG, Rive file, expression, animation, future accessory, and seasonal variant must derive from this turnaround.

**Never** use generated expression PNGs as geometry references.

Only this Character Bible and the turnaround may define production geometry. Changing geometry requires **2.0.0** (see Production Lock).

---

## 1. Production Lock

Changing any of the following requires **Character Bible 2.0.0** (breaking):

- Body shape (seed / egg silhouette)
- Eye size and placement
- Outline thickness / colour role
- Leaf shape (not just angle)
- Boot silhouette and scale
- Glove silhouette and scale
- Overall character silhouette at 64px

Do not redesign “just a little” in Figma. Open a 2.0 review instead.

---

## 2. Breaking vs non-breaking

### Breaking → `2.0.0`

Body shape · Eye placement / proportions · Outline · Leaf shape · Boots · Gloves · Silhouette · Layer names · SVG hierarchy

### Non-breaking → `1.x.0`

Blanket · Star / confetti FX · Water bottle · Holiday hat · Seasonal scarf · New Component Library variants that obey Expression Rules · Timing tweaks in Animation Bible that stay within caps

---

## 3. Expression Rules

### May change (per pose / emotion)

- Eyes (swap Component Library shapes)
- Eyebrows
- Mouth / tongue
- Leaf **angle** (rotation at stem — not reshaping)
- Pose / gesture (arms, legs, torso lean)
- Soft body squash within Animation Bible caps

### Never change

- Body shape
- Boot size / silhouette
- Arm / leg thickness
- Head / body proportion ratio
- Outline colour or weight
- Official palette tokens
- Facing convention for master art (**drawn facing right**; app mirrors for left)

---

## 4. Official colour palette

Locked from [`Expressions/companion_turnaround.png`](./Expressions/companion_turnaround.png):

| Token | Hex | Role |
| --- | --- | --- |
| Body | `#FFF2D8` | Cream seed fill |
| Outline | `#1F3D2A` | Dark botanical ink (all strokes) |
| Leaves | `#4EA353` | Medium green foliage |
| Limbs / Boots | `#3D7B3A` | Forest green rubber-hose + chunky boots |
| Cheeks | `#FFB8A8` | Soft pink blush (always on) |
| Mouth | `#FF7E5F` | Coral interior / tongue |
| Eyes | `#1A1A1A` | Near-black fill |
| Glint | `#FFFFFF` | Eye highlight |
| Gloves | `#FFFEFA` | Off-white cartoon gloves |

**Shade tone (optional, max one per part):** darken the fill toward Outline by ≤15% opacity overlay, or a second flat stop — never a long gradient. See Vector Construction.

**Theme rule:** Character colours never follow app theme. Same palette in light and dark UI.

**Boots are green** (match limbs). Brown boots from older Soul drafts are **void**.

---

## 5. Artboard & facing

| Spec | Value |
| --- | --- |
| Author artboard | **256 × 256** |
| App render sizes | 64 / 72 / 80 / 96 px |
| Master facing | **Right** (Spec); app mirrors for left |
| Background | Transparent only — never baked scenes |
| Silhouette test | Shrink to **64px** — must still read as “our sprout” |

---

## 6. Proportion grid

Percent of total height (leaves tip → boot sole), matching the turnaround guide:

| Guide | Approx % from top | Notes |
| --- | --- | --- |
| Top of leaves | 0% | Tallest point |
| Top of head / body | ~12–15% | Where leaves meet seed |
| Eye line | ~28–32% | Horizontal centre of both eyes |
| Bottom of body | ~72–78% | Seed oval ends |
| Bottom of boots | 100% | Ground contact |

**Body:** soft vertical egg / seed. Head and torso are one continuous oval (no neck seam).  
**Eyes:** large ovals; together dominate the face (~60% of personality read). Spacing ≈ one eye-width between inner corners.  
**Leaves:** two mirrored leaves on a short shared stem; readable “ears” at thumbnail.  
**Limbs:** thin rubber-hose; no hard elbow/knee joints in the drawing.  
**Gloves:** oversized four-finger cartoon mittens.  
**Boots:** chunky rounded; sole slightly darker shade allowed.

**Outline weight:** uniform medium stroke in `#1F3D2A` on all views. Target ≈ **2.5–3.5 px** at 256 artboard (keep constant; do not thicken for “emphasis” poses). Exact stroke must match turnaround when overlaid.

---

## 7. Face defaults (neutral idle)

| Part | Default |
| --- | --- |
| Eyes | Open (Component: `eye_open`) |
| Glints | Upper-left of each iris |
| Brows | Soft arches, relaxed |
| Mouth | Tiny smile or soft open smile |
| Blush | Always present (`#FFB8A8`) |
| Leaves | Neutral angle |

Smile shapes allowed: see [`COMPANION_COMPONENT_LIBRARY.md`](./COMPANION_COMPONENT_LIBRARY.md).

---

## 8. Accessories

### Allowed (separate layers only — never merged into body)

Blanket · Water bottle · Notebook / journal · Star / streak badge · Confetti / sparkles · Tiny hearts · Zzz · Checklist prop · Seasonal hat / scarf (Phase 8+)

### Forbidden

- Clock face, TVA, Miss Minutes / Disney likeness
- Guilt-drama tears, illness, wilt-as-punishment
- Baked backgrounds, photo plates, text in artwork
- Recolouring per app theme
- Redesigning proportions between expressions

---

## 9. Personality reminder (not owned here)

Role: *Your little growth companion.* Warm, cheeky, scarce, never a nag. Full voice and anti-persona: [`COMPANION_SOUL.md`](./COMPANION_SOUL.md). Acting: [`COMPANION_DIRECTING.md`](./COMPANION_DIRECTING.md).

---

## 10. Lock record

| Item | Result |
| --- | --- |
| Hex table matches turnaround | Accepted |
| Soul palette reconciled (green boots) | Done |
| Expression Rules | Accepted |
| Production Lock | Accepted |
| Official Character Lock | Accepted |
| Status | **Locked** 2026-07-28 |

Phase 3 complete. Next: [`COMPANION_ASSET_MANIFEST.md`](./COMPANION_ASSET_MANIFEST.md) → Phase 4 `master_companion.svg`.
