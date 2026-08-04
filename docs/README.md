# Docs map — start here

Confused by many markdown files? Use this map.

| Priority | Folder / file | What it is |
| --- | --- | --- |
| **1 — DO THIS** | [`TRACK_A_PLAN.md`](./TRACK_A_PLAN.md) | **Primary:** Leafu Companion chat page + habit memory + AI → Play internal testing |
| **2 — company** | [`bloom-valley/`](./bloom-valley/) | Constitution + vision (why we exist) |
| **3 — later art** | [`track-b-art/`](./track-b-art/) | SVG / Rive / expressions (**secondary** until Track A ships) |
| **4 — runtime contracts** | [`runtime/`](./runtime/) | Spec, Soul, Directing, Event Book (for Rive + persona later) |
| **5 — ops** | [`ops/`](./ops/) | Play Store, Firebase, privacy |

## Two tracks (final)

```text
Track A (PRIMARY)     Companion page: chat / mic / habit-aware Leafu
                      Reuse existing Coach + habits + Firebase functions
                      Ship to Play internal testing

Track B (SECONDARY)   Body: SVG → Rive → companion.riv
                      Freelancer / other team
                      Integrate when ready
```

## App code (not docs)

| Path | Role |
| --- | --- |
| `src/pages/CoachPage.tsx` | Existing chat UI → evolve into Leafu Companion page |
| `src/services/assistantChatService.ts` | Existing AI callable |
| `functions/` | Existing `assistantChat` backend |
| `src/features/leafu/` | **New home** for Track A companion-chat code |
| `src/components/companion/` | Overlay sprite (Track B / later) — leave alone for now |
| `art/production/` | Track B SVG only |

Habit tracker UI stays in `src/pages/*`, `src/components/habits/*`. Do not mix Leafu chat into every habit file.
