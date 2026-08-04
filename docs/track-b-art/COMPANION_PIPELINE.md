# Companion — Production Pipeline

| Field | Value |
| --- | --- |
| Version | 2.0.0 |
| Phase | 4 — Master SVG |
| Owner | Companion art / product |
| Last Updated | 2026-08-03 |
| Depends On | Phase 3 Locked |
| Status | **Frozen (Production Pipeline v1.0)** |

**Purpose:** Single status board. Stop redesigning process. Execute the current phase only.

**Hard gate:** No one opens Rive until `art/production/master_companion.svg` passes [`COMPANION_ASSET_CHECKLIST.md`](./COMPANION_ASSET_CHECKLIST.md) with zero failures.

---

## Official Character Lock

[`Expressions/companion_turnaround.png`](./Expressions/companion_turnaround.png) is the **only** canonical visual reference for production geometry.

- 3D / AI renders = marketing & inspiration only — **never** Rive geometry  
- Expression PNGs in `Expressions/` = acting reference only  
- Production master = **right-facing only** (no Front/3⁄4 packs inside the Rive SVG)

---

## Frozen phase map (v1.0)

```text
Phase 0  Vision & Product                ✅
Phase 1  Character Design                ✅
Phase 2  Expression Planning             ✅
Phase 3  Production Documentation        ✅
────────────────────────────────────────
Phase 4  master_companion.svg            ← NOW
Phase 5  Rive Build (.rev)
Phase 6  companion.riv (export)
Phase 7  React Integration
Phase 8+ Growth / Bond                   later
```

| Phase | Name | Status | Definition of Done |
| --- | --- | --- | --- |
| 0–3 | Docs & design | Complete | Locked docs + turnaround |
| **4** | **Master SVG** | **NOW** | Right-facing `master_companion.svg`; Asset Checklist = 0 fails |
| 5 | Rive Build | Blocked on 4 | `.rev` with layers, pivots, bones (Levels 1–6) |
| 6 | Export | Blocked on 5 | `companion.riv` &lt; 150 KB; Test Plan pass |
| 7 | React | Blocked on 6 | Spec inputs drive companion in app |
| 8+ | Growth | Later | Separate Growth System doc |

---

## Build levels (frozen)

Do not skip. Do not combine “finish everything.”

| Level | Deliverable | App export? |
| --- | --- | --- |
| **0** | `master_companion.svg` passes Asset Checklist | No |
| **1** | Import → rename → pivots → bones → save `companion.rev` | **No** |
| **2** | Idle + Blink | **First** `.riv` allowed |
| **3** | Wave + Stretch + Point | Yes |
| **4** | Celebrate A/B/C + Peek + Nap | Yes |
| **5** | Appear + Leave + Walk + Mouth Talk + React | Yes |
| **6** | State Machine wired to Spec inputs | Yes |
| **7** | React integration (`public/companion/companion.riv`) | Ship |

Phase 1 appear: **one** flavour (edge) is enough to ship; perch/cross can follow.

---

## Repo folder structure (frozen)

```text
docs/                          # contracts & guides (existing COMPANION_*.md names)
  Expressions/                 # turnaround PNG + concept expression PNGs
  COMPANION_*.md

art/
  turnaround/                  # reference only — NEVER import into Rive
    README.md
  production/                  # Phase 4 deliverables
    master_companion.svg       # ← required
    eyes/ mouths/ leaves/ …    # optional part exports
    README.md

rive/
  companion.rev                # Phase 5 editable source

build/                         # or public/companion/ for ship
  companion.riv                # Phase 6 export → copy to public/companion/
```

Canonical ship path remains: `public/companion/companion.riv` ([`COMPANION_SPEC.md`](./COMPANION_SPEC.md)).

---

## Character platform (index)

### Vision & product identity

| Doc | Responsibility |
| --- | --- |
| [`BLOOM_VALLEY_CONSTITUTION.md`](./BLOOM_VALLEY_CONSTITUTION.md) | **Locked** company constitution — Laws, Bond, Shared Moments, Companion OS |
| [`COMPANION_VISION.md`](./COMPANION_VISION.md) | Companion Platform narrative, cast, Bloom Valley story |
| [`COMPANION_SPEC.md`](./COMPANION_SPEC.md) | App ↔ Rive wiring contract (MVP wedge) |
| [`COMPANION_SOUL.md`](./COMPANION_SOUL.md) | Leafu personality, voice (runtime) |
| [`COMPANION_DIRECTING.md`](./COMPANION_DIRECTING.md) | Acting, mood, restraint |
| [`COMPANION_EVENT_BOOK.md`](./COMPANION_EVENT_BOOK.md) | Product moments → performance |
| [`COMPANION_EXPRESSION_PROMPTS.md`](./COMPANION_EXPRESSION_PROMPTS.md) | AI concept prompts (not production art) |

### Production documentation (Phase 3)

| Doc | Responsibility |
| --- | --- |
| **This file** | Frozen pipeline, levels, folders |
| [`COMPANION_CHARACTER_BIBLE.md`](./COMPANION_CHARACTER_BIBLE.md) | Visual identity, Production Lock |
| [`COMPANION_COMPONENT_LIBRARY.md`](./COMPANION_COMPONENT_LIBRARY.md) | Eyes / mouths / leaves / hands |
| [`COMPANION_VECTOR_CONSTRUCTION.md`](./COMPANION_VECTOR_CONSTRUCTION.md) | Shape recipes, SVG Rules |
| [`COMPANION_RIGGING_BLUEPRINT.md`](./COMPANION_RIGGING_BLUEPRINT.md) | Layers, pivots, deform |
| [`COMPANION_ANIMATION_BIBLE.md`](./COMPANION_ANIMATION_BIBLE.md) | Numeric motion rules |
| [`COMPANION_STATE_MACHINE.md`](./COMPANION_STATE_MACHINE.md) | Inputs, clips, transitions |
| [`COMPANION_ASSET_CHECKLIST.md`](./COMPANION_ASSET_CHECKLIST.md) | Pre-Rive SVG gate |
| [`COMPANION_ASSET_MANIFEST.md`](./COMPANION_ASSET_MANIFEST.md) | Phase 4 file list |

### Implementation (Phase 4+)

| Doc | Responsibility |
| --- | --- |
| [`COMPANION_RIVE_BUILD_GUIDE.md`](./COMPANION_RIVE_BUILD_GUIDE.md) | Editor playbook — no design decisions |
| [`COMPANION_TEST_PLAN.md`](./COMPANION_TEST_PLAN.md) | QA before every `.riv` / release |
| [`COMPANION_RIVE_DIY.md`](./COMPANION_RIVE_DIY.md) | Weekend DIY notes (obey Build Guide + Spec) |

### Art lock

| Asset | Path |
| --- | --- |
| Turnaround (law) | [`Expressions/companion_turnaround.png`](./Expressions/companion_turnaround.png) |
| Production SVG | `art/production/master_companion.svg` |
| Concept expressions | [`Expressions/`](./Expressions/) — not production |

---

## Phase 4 requirements (only artifact that matters now)

`art/production/master_companion.svg` must be:

- Right-facing only  
- Layered & named per Rigging Blueprint (include `stem`)  
- Flat vector, SVG Rules  
- Matches Character Bible palette / proportions  
- Passes Asset Checklist — **zero failures**  

No animations. No bones. No Rive until that passes.

**Authoring tools:** Inkscape or Illustrator preferred for named groups. Avoid Figma boolean soup for the master export.

---

## Semantic versioning

| Bump | When |
| --- | --- |
| `1.0.x` | Typos, clarifications |
| `1.x.0` | Non-breaking accessories / variants |
| `2.0.0` | Breaking geometry, layer names, SVG hierarchy, or this pipeline freeze change |

---

## File naming

See Asset Manifest + Spec. Shipped runtime file: **`companion.riv`** (not `leafu.riv`). Product nickname “Leafu” is fine in copy; files stay Spec names.

---

## Hard rules

1. Changing Production Lock geometry → Character Bible **2.0.0**.  
2. No Rive until Phase 4 Checklist passes.  
3. No always-on companion — scarce visits per Spec / Directing.  
4. Spec inputs only — no parallel TriggerCelebrate API.  
5. 3D AI art = marketing only.
