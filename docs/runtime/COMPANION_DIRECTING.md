# Companion — Directing Notes

**For:** animators, product, and anyone deciding *how* the character performs in a moment  
**Not for:** wiring contracts ([`COMPANION_SPEC.md`](./COMPANION_SPEC.md)) or personality/growth ([`COMPANION_SOUL.md`](./COMPANION_SOUL.md))  
**Pairs with:** [`COMPANION_EVENT_BOOK.md`](./COMPANION_EVENT_BOOK.md) · numeric motion: [`COMPANION_ANIMATION_BIBLE.md`](./COMPANION_ANIMATION_BIBLE.md) · index: [`COMPANION_PIPELINE.md`](./COMPANION_PIPELINE.md)

> Think of this as Pixar-style character notes. Spec says *what inputs exist*. Soul says *who they are*. This says *how they act*.

---

## 1. Performance formula

```text
Performance = Emotion + Action + Mood
```

| Layer | Creates new animation? | Role |
| --- | --- | --- |
| Emotion | Face / posture bias | How they feel |
| Action | Body choreography | What they do |
| Mood | **Parameters only** | How big / fast / soft |

Mood must **never** invent a new clip. It scales the same Wave, Celebrate, Peek, etc.

### Mood parameter table

| Parameter | Calm | Playful | Sleepy | Energetic |
| --- | --- | --- | --- | --- |
| Animation speed | 0.9× | 1.2× | 0.7× | 1.3× |
| Gesture size | Small | Large | Tiny | Medium–large |
| Bounce | Low | High | Almost none | Medium |
| Blink frequency | Normal | Frequent | Slow | Normal |
| Head tilt | Rare | Frequent | Slow, lazy | Medium |
| Speech likelihood | Medium | High | Low | Medium |

Phase 1 may bake Calm as the default and approximate others inside Rive. Phase 2 exposes `mood` as a number the app sets.

---

## 2. Restraint (the most important acting rule)

The companion should **not** always react. Silence is part of the performance.

| Situation | Direction |
| --- | --- |
| User checks analytics / charts | Stay quiet. Do not appear. |
| User edits a habit / note | No interruption. |
| User opens Settings | Absent (or rare idle only). |
| User completes habits in a burst | React **once** for the burst, not once per tick. |
| User ignores a visit | Soft leave. No second attempt to get attention. |
| User is typing / in editor | Never appear. |
| Modal / sheet open | Never appear. |
| Rapid tab switching | Do not chase the user across every screen. |

**Rule of thumb:** if the appearance would feel like a notification, skip it.

Debounce: after any reaction tied to habit completion, wait at least **30–60 s** (or until the next natural scarcity window) before another celebration-class moment.

---

## 3. Eye contact

| Context | Direction |
| --- | --- |
| Speaking | Look toward user ~**70%** of the line; look away ~**30%** |
| Listening / idle hold | Soft gaze; break every 1.5–3 s |
| Never | Continuous stare for the full dwell |
| After user tap | Snap look toward tap, then settle |
| Peek | Eyes lead the body — look first, lean second |
| Nap | Eyes closed; no fake “peeking” mid-nap unless waking |

Double-blink is allowed as a beat before speaking or after a joke line.

---

## 4. Smile rules

Do **not** smile before every sentence.

Smile **after**:

- A compliment or streak callout  
- A light joke / cheeky line  
- A successful celebrate settle  

Stay soft / neutral:

- During “X left today” nudges  
- During “welcome back” after absence  
- While thinking / pointing  

A constant smile reads as a sticker, not a character.

---

## 5. Walking

Always bounce-based. Never puppet left-right march.

```
Walk
  → always bounce
  → lean slightly forward
  → hands swing opposite to the bounce phase
  → head lags ~2 frames behind the body
  → squash on land, stretch on rise
```

Mood modifiers:

- **Energetic** — taller bounce, quicker cycle  
- **Sleepy** — low bounce, longer hang in the air, droopy arms  
- **Playful** — occasional skip frame or extra arm flourish  
- **Calm** — small, even bounce  

---

## 6. Thinking

```
Look up (or aside)
  → head tilt
  → one eyebrow raised
  → tiny mouth movement (not full talk cycle)
  → hold 0.6–1.2 s
  → resolve into Action (point / wave / speak) or soft idle
```

Never hold “thinking” longer than ~1.5 s without a payoff — otherwise it looks stuck.

---

## 7. Curiosity / peek choreography

```
Peek (edge)
  → pause (eyes only)
  → blink
  → lean more
  → optional tiny wave
  → either settle or soft retreat
```

Peek is *investigation*, not *jump scare*. No sudden full-body pop unless `appear` from perch.

---

## 8. Celebration

- Anticipation squash → jump → arms up → settle with 2–3 frames overshoot  
- Use Celebrate A / B / C (random inside Rive) so streaks don’t clone  
- One celebration per “all done” or meaningful streak beat — not per habit in a burst  
- After celebrate, allow a short proud idle before leave — don’t smash-cut to exit  

---

## 9. Nudges (point / “X left”)

- Soft, not accusatory  
- Point with eyes first, arm second  
- No finger-wag, no hands-on-hips scold pose  
- Speech stays observational (“2 left today.”) — directing must match that tone  
- Prefer Calm or Playful mood; never Energetic for unfinished-habit nudges  

---

## 10. Return after absence

- Warm wave, Calm mood  
- No “where were you?” energy in face or body  
- Optional soft smile *after* “welcome back.” — not before  
- Growth stage unchanged (see Soul: growth is permanent)  

---

## 11. Growth-stage acting (Phase 3)

Same actions; different *confidence*.

| Stage | Acting bias |
| --- | --- |
| Seed | Smaller gestures, more peek, shy settle |
| Sprout | Clearer wave, slightly bigger bounce |
| Leaf | Confident idle, freer arm swing |
| Bloom | Proud chin on celebrate; flower accent can bob with breath |
| Companion+ | Accessory secondary motion (scarf / backpack lag) — never louder than the face |

Growth changes silhouette and confidence — **not** guilt intensity.

---

## 12. Prohibited performances

- Sick / damaged / wilting companion after missed days  
- Tears, injury, or “you hurt me” body language  
- Blocking taps or covering primary CTAs “as a joke”  
- Repeating the same celebrate clip back-to-back without variant  
- Staring + smiling through the entire 7 s dwell  
- Chasing the user after they dismiss / ignore  

---

## 13. Timing cheat sheet

| Beat | Duration |
| --- | --- |
| Appear | ≤ 400 ms |
| Leave | ≤ 320 ms |
| Full dwell (Phase 1) | ~7 s |
| Speech line on screen | ~2–3.5 s overlapping dwell |
| Blink interval | 2–5 s (mood-adjusted) |
| Head lag on walk | ~2 frames |
| Burst-celebration debounce | ≥ 30–60 s |

---

## 14. How to use this doc

1. Animator: bake restraint, eye breaks, bounce-walk, smile timing into the `.riv`  
2. Engineering: Event Book chooses Emotion / Action / Mood; Directing constrains *how often* and *how big*  
3. Writing: lines must fit smile / nudge / welcome rules — if copy scolds, directing cannot save it  
