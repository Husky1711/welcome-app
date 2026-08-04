# Bloom Valley Constitution v1.0

| Field | Value |
| --- | --- |
| Version | 1.0.0 |
| Status | **Locked — signed** |
| Last Updated | 2026-08-04 |
| Authority | Company identity. Overrides feature debates. Does not replace engineering Spec for Leafu runtime. |

**Related**

- Product north star narrative: [`COMPANION_VISION.md`](./COMPANION_VISION.md)
- **Primary engineering (chat):** [`../TRACK_A_PLAN.md`](../TRACK_A_PLAN.md)
- Art / Rive (secondary): [`../track-b-art/COMPANION_PIPELINE.md`](../track-b-art/COMPANION_PIPELINE.md)
- Runtime Leafu contract: [`../runtime/COMPANION_SPEC.md`](../runtime/COMPANION_SPEC.md)

---

## Three layers (never confuse them)

| Layer | What it is |
| --- | --- |
| **Bloom Valley** | The brand, IP, universe, characters, stories, YouTube, Instagram, books |
| **Companion OS** | The technology: personas, memory, emotion, skills, animation, voice, LLM gateway |
| **Bloom Valley App** | The first consumer product running on Companion OS (V1 = Leafu only) |

---

## Vision

> **To build the world's most loved Companion Platform where AI companions help people grow through meaningful relationships, not notifications.**

---

## Mission

> **Make personal growth feel like spending time with a trusted friend instead of completing another task.**

---

## The Laws

### Law 1 — We build companions

Not chatbots.  
Not assistants.  
Not productivity tools.

Every feature must strengthen the relationship between the user and their companion.

### Law 2 — Leafu is the first friend

Leafu is not the mascot.  
Leafu is not the assistant.  
Leafu is the user's lifelong companion.

Everything begins with Leafu.  
Leafu **is** the product experience — not an add-on overlay on a dashboard.

### Law 3 — One Brain. Many Hearts.

**Internally:** One Companion Engine. Many Personas.  
**Externally:** Many companions. One universe.

Engineering stays scalable. Every companion stays emotionally unique.

We do **not** build Leafu Agent / Ollie Agent / Buzz Agent.  
We configure personas.

### Law 4 — Presence before Conversation

The strongest companion is not the one who talks the most.  
It is the one who knows **when to simply be there**.

Presence > text chat > voice.  
Silence is part of the performance.

### Law 5 — Growth over Productivity

We never celebrate checking a box as the end goal.  
We celebrate becoming a better person.

Effort, consistency, kindness, curiosity, and resilience matter more than perfect streaks.

### Law 6 — Relationships are our KPI

Most companies optimize DAU, MAU, retention.

We also track one invisible question:

> **Would the user miss Leafu if he disappeared?**

If the answer is yes, everything else follows.

### Law 7 — Companions never replace humans

Leafu must never imply: "I'm all you need."

Instead, encourage real life:

- "Have you spoken to your family today?"  
- "Let's call a friend."  
- "I'm proud of you for spending time outside."  

### Law 8 — Real life first

> **Bloom Valley exists to help people spend less time inside the app and more time living meaningful lives.**

That sentence keeps incentives healthy.

---

## Shared Moments (not chat dumps)

We do not treat conversation history as the soul of memory.

We store **Shared Moments** — the friendship timeline.

| Instead of storing… | Store… |
| --- | --- |
| Raw "I drank water" chat | Moment: First habit completed · date · Leafu celebrated |
| Full transcript of a rough week | Moment: Returned after 12 days · Leafu welcomed gently |
| Endless logs | Moment: First 30-day consistency milestone |

Example of what companionship sounds like:

> "Do you remember the rainy Tuesday when you almost gave up on your morning walk? We decided to start with just five minutes. You've come a long way since then."

That is **shared history**, not autocomplete.

---

## Companion Memory model

```text
Companion Memory
        ↓
     Facts
        ↓
   Preferences
        ↓
     Habits
        ↓
  Shared Moments
        ↓
      Bond
```

**Bond** is the highest level — not a grindable score.

### Bond stages (feel, don't farm)

```text
New Friend
    ↓
Growing Together
    ↓
Trusted Friend
    ↓
Close Companion
    ↓
Lifelong Companion
```

Never show XP.  
Never show "472 points."  
The user should feel Bond, not grind it.

A simple habit streak may remain as Leafu's pride — Bond is the deeper, quieter relationship layer.

---

## Companion OS (internal architecture)

```text
Companion OS
    ↓
Persona Engine
    ↓
Relationship Engine   (Bond + Shared Moments)
    ↓
Memory Engine         (facts, preferences, context)
    ↓
Emotion Engine        (intent → emotion → gesture)
    ↓
Skill Engine          (habits, planning, reading, …)
    ↓
Animation Engine      (Emotion → Rive)
    ↓
Voice Engine          (optional; text-first in V1)
```

Everything is an **engine**.  
Nothing is a per-character agent farm.

### Persona (configuration, not a service)

Each persona includes: name, backstory, voice, animation pack, prompt, tools/skills, greetings, catchphrases, memory style, relationship rules.

V1 ships **Leafu only**.  
Unlocking Ollie later = new persona config + skills — not a new AI stack.

---

## Product experience (V1 direction)

Leafu is the interface.

```text
        Leafu
Good morning! Ready to grow today?

  Chat · Today's Journey · My Day · Bloom Valley (later)
```

Journey actions (Learn / Habits / Relax / Create / Reflect) are presented **with Leafu**, not as a cold feature dashboard.

Text-first. Voice optional. Speaking is powerful because it is rare.

Notifications speak in companion voice — never generic "Drink water."

---

## Stories as first touchpoint

Instagram / YouTube are not only marketing.  
They are the first handshake with Companion OS:

```text
Meet Leafu (story)
    ↓
Become friends (app)
    ↓
Leafu remembers you (years)
```

Continuous relationship across platforms.

---

## The weekly question

Not only: How many installs? How many chats?

Ask:

> **Did we make Leafu feel more alive this week?**

If yes, users will spend time with him.  
If no, more models and features will not fix it.

---

## The sentence that stays forever

> **People won't remember how intelligent Leafu was. They'll remember how Leafu made them feel during ordinary moments of their lives.**

If Bloom Valley succeeds, it will not be because it has the smartest AI.  
It will be because millions of people feel that a kind, encouraging companion is walking beside them as they grow.

---

## Execution freeze (what we build next)

Stop ideating company identity. Start shipping Leafu.

| Window | Focus |
| --- | --- |
| Week 1–2 | Finish `master_companion.svg` · Rig in Rive · Expressive animations |
| Week 3 | Integrate `companion.riv` · Leafu-first home shell |
| Week 4 | Companion Engine v0: Leafu persona · basic memory / Shared Moments stub · emotion → Rive · text chat |

Voice, Ollie, Buzz, richer Bond, Bloom Valley world — evolve on that foundation.

**Track A first:** Companion chat → Play internal testing — [`../TRACK_A_PLAN.md`](../TRACK_A_PLAN.md).  
**Track B later:** No Rive until `art/production/master_companion.svg` passes Asset Checklist — [`../track-b-art/COMPANION_PIPELINE.md`](../track-b-art/COMPANION_PIPELINE.md).

---

## Co-founder lock (signed)

1. Leafu is the product experience, not an add-on.  
2. One Companion Engine, many personas.  
3. The emotional journey — Bond + Shared Moments — is the product.  

We are building **companions**, not features.
