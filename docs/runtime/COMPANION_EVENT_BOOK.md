# Companion — Event Book

**For:** engineering, product, writing, and animation — shared source of truth for *when* the companion performs  
**Reads:** [`COMPANION_PIPELINE.md`](./COMPANION_PIPELINE.md) · [`COMPANION_SPEC.md`](./COMPANION_SPEC.md) · [`COMPANION_SOUL.md`](./COMPANION_SOUL.md) · [`COMPANION_DIRECTING.md`](./COMPANION_DIRECTING.md) · [`COMPANION_STATE_MACHINE.md`](./COMPANION_STATE_MACHINE.md)

> This is not an animation doc. It maps **product moments → performance**.  
> Phase 1 implements a subset via `pickMoment()` + scarcity timers. Phase 2+ fills the rest without changing the philosophy.

---

## 1. How to read a row

| Column | Meaning |
| --- | --- |
| Event | Meaningful product moment |
| Emotion | Face / posture bias (Phase 2; Phase 1 ≈ nearest `activity`) |
| Action | Body choreography |
| Mood | Speed / size modifier — not a new clip |
| Speech | Bubble copy (≤ ~24 chars). `—` = silent visit OK |
| Phase | When we wire it |
| Notes | Restraint / debounce / special rules |

**Global filters (always apply before any row):**

- Companion enabled in Settings  
- Not typing / not in note editor  
- No modal / sheet open  
- Not on auth routes  
- Reduced-motion → companion off  
- Directing restraint: if it would feel like spam, skip  

---

## 2. Phase 1 — ship with first real `.riv`

These map to today’s `activity` values in Spec / `pickMoment()`.

| Event | Emotion | Action | Mood | Speech | Phase | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| First peek after cold start | Happy | Wave or Peek | Calm | "Hey there." / — | 1 | Scarcity: ~1 s first delay |
| Casual roam (no special context) | Neutral | Idle / Wave / Peek | Calm | "Just passing by." / — | 1 | 45–90 s gaps; often silent |
| Morning open (hour &lt; 10) | Happy | Stretch | Calm | "Morning!" / — | 1 | Prefer stretch over wave |
| Late night (hour ≥ 21 or &lt; 5) | Sleepy | Nap | Sleepy | "Winding down?" / — | 1 | Low energy; short visit OK |
| All habits complete today | Excited | Celebrate | Energetic | "All done today!" / streak line | 1 | Celebrate A/B/C inside Rive |
| Streak ≥ 2 on all-done | Proud | Celebrate | Playful | "{n} day streak!" | 1 | Same action; proud face bias later |
| Nothing completed, afternoon+ | Curious | Point | Calm | "Nothing ticked yet." | 1 | Soft nudge — never scold face |
| Some left today | Curious | Point | Calm | "{n} left today." | 1 | ≤35% of casual rolls |
| User taps companion (1st) | Happy | React | Playful | "Tap again for Coach" | 1 | One-shot; then hold |
| User taps companion (2nd) | — | Leave → open Coach | Calm | — | 1 | Exit before navigation |
| User scrolls meaningfully | — | Leave | Calm | — | 1 | After settle grace; no re-chase |
| User ignores visit | Neutral | Leave | Calm | — | 1 | Soft exit; no second plea |

### Phase 1 `activity` bridge

| Event book Action | Spec `activity` |
| --- | --- |
| Idle | 0 |
| Wave | 1 |
| Peek | 2 |
| Stretch | 3 |
| Celebrate | 4 |
| Nap | 5 |
| Point | 6 |
| React | `react` trigger |

---

## 3. Phase 2 — richer moments (Emotion × Action × Mood)

| Event | Emotion | Action | Mood | Speech | Phase | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| App opens (morning, habits pending) | Happy | Wave | Calm | "morning!" | 2 | Not every open — max 1 / session morning |
| App opens (evening, habits pending) | Curious | Peek | Calm | "still time." | 2 | Optional; low frequency |
| First habit complete today | Proud | Small celebrate* | Playful | "nice start!" | 2 | *Use Jump or Celebrate-small variant |
| Midday progress (≈ half done) | Happy | Clap or Wave | Playful | "halfway!" | 2 | Once per day max |
| Last habit complete | Excited | Celebrate | Energetic | "you did it!" | 2 | Debounce burst completes → one fire |
| Return after several days | Happy | Wave | Calm | "welcome back." | 2 | No guilt face; growth unchanged |
| Return after 1 missed day | Warm / Happy | Wave | Calm | "good to see you." | 2 | Prefer this over any “missed” copy |
| Long idle on Home (user present) | Curious | Peek | Calm | — | 2 | Silent OK; respect scarcity |
| Open Coach from companion | Thinking → Happy | Listen → Wave | Calm | — | 2 | Hand off; don’t compete with Coach UI |
| Coach speaking (companion visible) | Neutral | Listen | Calm | — | 2 | Mouth shapes follow Coach audio if wired |
| User finishes a note (not habit) | Happy | Tiny wave | Calm | — | 2 | Rare; Notes is deep work — usually silent |
| Streak milestone 7 / 30 / 100 | Proud | Celebrate | Energetic | milestone line | 2–3 | Pair with growth unlock when ready |

\* “Small celebrate” = Jump or Celebrate variant with smaller gesture size via Mood, not a guilt of separate assets if budget is tight.

---

## 4. Phase 3 — bond & memory

| Event | Emotion | Action | Mood | Speech | Phase | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Growth stage unlock (Seed→Sprout…) | Proud | Celebrate | Playful | "new leaf!" / stage line | 3 | Show silhouette change after settle |
| Yesterday all-done (next morning) | Proud | Wave | Calm | "you finished yesterday!" | 3 | Memory line; once |
| Seasonal / holiday (opt-in) | Happy | Wave | Playful | short seasonal | 3 | Outfit only; never paywall guilt |
| Birthday (if known / opt-in) | Excited | Celebrate | Energetic | "happy day!" | 3 | Optional; easy to skip |
| User hits personal best streak | Proud | Celebrate | Energetic | "new best!" | 3 | Distinct from daily all-done |

---

## 5. Explicit non-events (do not map)

These must **not** get companion rows:

| Non-event | Why |
| --- | --- |
| Opening analytics / insights | Directing: stay quiet |
| Editing habit definition | Deep work; no interruption |
| Typing in Notes editor | Hard no-go |
| Deleting a habit / note | Too sensitive; no commentary |
| Failed reminder / missed notification | Never shame |
| Every single habit tick in a rapid batch | Collapse to one celebration / progress beat |
| Settings toggles (except companion on) | Stay out of the way |
| Auth / onboarding critical steps | Never compete with focus |

---

## 6. Speech inventory (canonical short lines)

Keep in sync with `src/utils/companion.ts` when shipping copy changes.

| Line | Typical event |
| --- | --- |
| "Hey there." | First / casual wave |
| "Just passing by." | Silent-leaning roam |
| "Morning!" | Morning stretch |
| "Winding down?" | Late nap |
| "All done today!" | All habits complete |
| "{n} day streak!" | Streak on all-done |
| "Nothing ticked yet." | Afternoon empty |
| "{n} left today." | Partial progress nudge |
| "Tap again for Coach" | First tap react |
| "welcome back." | Return after absence (P2) |
| "good to see you." | Soft return (P2) |
| "nice start!" | First habit (P2) |
| "you did it!" | Last habit (P2) |

**Banned patterns:** "you failed", "you neglected me", "I'm sad you left", wilt / sick metaphors in copy or staging notes.

---

## 7. Implementation notes for engineering

### Phase 1 (current)

- Timer scarcity + `pickMoment(context)` ≈ Event Book §2  
- No separate Mood channel yet — bake Calm / Sleepy via activity choice (`nap` vs `wave`)  
- Burst debounce for celebrate: track `lastCelebrateAt`  

### Phase 2 target payload (illustrative)

```json
{
  "emotion": "proud",
  "action": "celebrate",
  "mood": "playful",
  "speech": "nice start!",
  "mouth": "smile"
}
```

App resolves Event Book row → this payload → Rive inputs. Writers edit the book; engineers don’t hardcode one-off faces in random components.

### Cooldown keys (suggested)

| Key | Default |
| --- | --- |
| `appear` | 45–90 s (existing) |
| `celebrate` | ≥ 60 s |
| `nudge` | ≥ 1 per afternoon session |
| `welcome_back` | once per return episode |
| `morning_hello` | once per calendar morning |

---

## 8. Ownership

| Change type | Owner | Updates |
| --- | --- | --- |
| New product moment | Product | This Event Book |
| How it should be acted | Design / directing | Directing + this row’s Notes |
| Copy | Product + eng | This inventory + `companion.ts` |
| Rive inputs | Eng + animator | Spec |
| Growth unlock thresholds | Product | Soul § Phase 3 + this §4 |

When in doubt: **add a row here before adding a one-off `if` in UI code.**
