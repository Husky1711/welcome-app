# Track A — Final plan (PRIMARY)

| Field | Value |
| --- | --- |
| Status | **Locked** |
| Goal | Ship Leafu Companion **chat/voice page** to Play **internal testing** |
| Body / Rive | Track B — secondary; integrate later |
| App | Same Welcome App repo — not a new project |

---

## 1. Architect decision (what we are NOT doing)

| Idea | Decision |
| --- | --- |
| New git repo / separate app for chat | **No** — same Play listing, same auth, same habits |
| Rewrite all habit UI | **No** — habits stay; Companion **reads** them |
| Wait for Rive body before chat | **No** — headless Leafu first (name + chat + mic) |
| Eight AI agents | **No** — one engine, Leafu persona only |
| Build chat inside every habit file | **No** — isolate under `src/features/leafu/` |

---

## 2. What Track A delivers

User opens **Companion** (Leafu) page and can:

1. **Chat** with Leafu (text)  
2. **Talk** with Leafu (mic → STT → LLM → TTS) — phase A2 after text works  
3. Leafu **knows habits**: what’s done, what’s left, gentle nudge, celebrate  
4. Leafu **remembers** lightly: Shared Moments stubs + preferences (Bond later)  
5. Response includes `{ emotion, animation }` fields for **future Rive** (ignored in UI until Track B)

No character body on screen in Track A. Title / avatar placeholder “Leafu” is enough.

---

## 3. Reuse what Welcome App already has

You already built most of the spine:

| Existing | Track A use |
| --- | --- |
| `CoachPage` + `/coach` | Evolve → **Companion / Leafu page** (`/companion`) |
| `assistantChatService` + `functions/assistantChat` | Rename persona to Leafu; enrich habit context |
| `buildAssistantContext` / habit storage | “What’s left today”, streaks, titles |
| Auth (Firebase) | Same user |
| Settings / consent | Keep coach consent → Leafu consent |
| Bottom nav / Home entry | Add “Talk to Leafu” entry from Home |

**Do not invent a second chatbot stack.** Evolve Coach → Leafu.

---

## 4. Code layout (clarity for Cursor + humans)

```text
src/
  features/
    leafu/                    ← Track A ONLY (new)
      README.md
      pages/
        CompanionPage.tsx     ← UI (from CoachPage)
      hooks/
        useLeafuChat.ts
      services/
        leafuChatService.ts   ← thin wrapper over assistantChatService
      memory/
        sharedMoments.ts      ← local Shared Moments v0
      types.ts
  pages/
    CoachPage.tsx             ← keep until redirect, then deprecate
  components/
    habits/                   ← unchanged (habits product)
    companion/                ← Track B overlay sprite — don’t touch for Track A
  services/
    assistantChatService.ts   ← shared transport to Firebase
functions/
  src/                        ← Leafu system prompt + habit-aware replies
```

Docs:

```text
docs/
  README.md                   ← map
  TRACK_A_PLAN.md             ← this file
  bloom-valley/               ← constitution, vision
  track-b-art/                ← SVG/Rive (secondary)
  runtime/                    ← Spec/Soul/Directing/Events
  ops/                        ← Play Store / Firebase
```

---

## 5. Track A milestones (ship to internal testing)

### A0 — Housekeeping (1 session)
- Docs folders organized (done with this plan)
- Home entry: “Leafu” / Companion → chat page
- Route `/companion` (alias or replace `/coach`)

### A1 — Text Companion (must ship first)
- Companion page UI (Leafu branding, no body)
- Chat uses existing callable
- Context includes **incomplete habits today** + completed today
- Suggested chips: “What’s left?”, “I’m tired”, “Celebrate with me”
- Safety + quota unchanged

### A2 — Habit-aware memory v0
- Local Shared Moments: first chat, habit completed while chatting, returned after gap
- Leafu can say “you still have X left today” from live habit storage
- Persist short preference notes (e.g. prefers gentle tone)

### A3 — Voice turn (optional after A1 stable)
- Mic → STT → same chat API → TTS
- Not full duplex speech-to-speech yet

### A4 — Emotion contract (for Track B)
- Backend returns `emotion` + `animation` on every reply
- UI may show a small emoji/status; Rive ignored until body ready

### Done for internal testing when
- [x] Testers open Companion page and chat with Leafu  
- [x] Leafu correctly mentions leftover / done habits  
- [x] No crash offline / quota / safety paths  
- [ ] Build uploaded to Play **internal testing** (needs Firebase login + functions deploy + AAB upload)  

**Code complete (A0–A4):** Companion chat, voice turn, Shared Moments/prefs, emotion contract, Settings clear Leafu.

---

## 6. Track B (secondary — other team)

```text
art/production/master_companion.svg
  → Rive (docs/track-b-art/)
  → public/companion/companion.riv
  → CompanionPage shows body; same chat API drives animation field
```

No dependency for A1–A2 release.

---

## 7. API shape (keep stable for Rive later)

```json
{
  "reply": "Two left today — want to do the smaller one first?",
  "persona": "leafu",
  "emotion": "encourage",
  "animation": "point",
  "safetyCategory": "none"
}
```

Client today: show `reply`.  
Client later: map `animation` → Rive `activity`.

---

## 8. What “merged with previous features” means

Leafu does **not** replace Today / Habits / Calendar.  
Leafu **sits beside** them:

```text
Home / Today / Habits  →  user does life
         ↓
   Companion page      →  user talks to Leafu about that life
         ↓
   habitStorage         →  shared source of truth
```

Completing a habit on Today can later emit a Shared Moment Leafu can celebrate in chat — same data, two UIs.

---

## 9. Explicit non-goals (Track A)

- Bloom Valley world map  
- Ollie / Buzz / other personas  
- Full duplex realtime voice  
- Rewriting habit tracker IA  
- Blocking release on SVG/Rive  

---

## 10. Next concrete engineering step

1. Create `src/features/leafu/`  
2. Copy/adapt `CoachPage` → `CompanionPage` (Leafu copy)  
3. Enrich `buildAssistantContext` with “incomplete today” list prominently  
4. Update `functions` system prompt: you are Leafu, growth companion, habit-aware  
5. Internal test build → Play Console  

Body/Rive stays Track B.
