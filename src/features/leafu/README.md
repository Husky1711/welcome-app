# Leafu feature (Track A)

Primary product work: **Companion chat page** with habit-aware Leafu.

- Plan: [`docs/TRACK_A_PLAN.md`](../../../../docs/TRACK_A_PLAN.md)
- Evolve from: `src/pages/CoachPage.tsx` + `src/services/assistantChatService.ts`
- Do **not** put habit-tracker UI rewrites here
- Rive body lands later (Track B) — keep API fields `emotion` / `animation` ready

## Files

```text
pages/CompanionPage.tsx
pages/companion-page.css
hooks/useLeafuChat.ts
services/leafuChatService.ts
services/leafuVoice.ts          ← mic STT + TTS
memory/sharedMoments.ts
types.ts
```

Route: `/companion` (legacy `/coach` redirects here).

Features: text chat, mic voice turn, Shared Moments + prefs, emotion chips, habit snapshot.

Backend: Firebase callable `assistantChat` → Groq when `GROQ_API_KEY` is available.
