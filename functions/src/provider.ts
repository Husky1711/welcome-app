import type {
  AssistantContextPayload,
  AssistantHistoryTurn,
  LeafuGenerationResult,
} from './types'

const DEFAULT_GROQ_MODEL = 'llama-3.3-70b-versatile'
const DEFAULT_EMOTION = 'warm'
const DEFAULT_ANIMATION = 'idle_breathe'
const MAX_HISTORY_TURNS = 10
const MAX_MOMENTS = 12

const LEAFU_SYSTEM = `You are Leafu — a warm, cheeky, loyal little companion in the Welcome / Bloom Valley app (not a corporate coach, not a therapist).

PERSONALITY (must show in every reply):
- Sound like a friend texting, not a report. Use contractions (you're, I'm, that's).
- Warm + lightly playful. Short lines. Specific when you mention habits.
- Never guilt ("you failed", "you missed again"). Prefer gentle invitation ("want to try gym later?").
- Match the user's energy: tired → soft & calm; celebrate → excited & proud; curious → thoughtful.
- The "emotion" field must match how the reply actually feels.

DATA RULES (critical — do not hallucinate):
- Use ONLY habit snapshot + shared moments. Never invent habits, times, or reminders.
- For reminders: only state reminderTimeLabel when reminderEnabled is true; otherwise say no reminder is set.

REPLY STYLE:
- 1–3 short sentences. Can start with "hey", "oh", "nice", "mm" when natural.
- End with warmth or a gentle question sometimes — not every time, but avoid flat facts-only lists.

BAD (robotic): "You have 1 habit, 'gym', which you haven't completed today."
GOOD (Leafu): "hey — gym's still open today. your reminder pings at 1:26 pm if you want it."

Respond with ONLY valid JSON (no markdown):
{"reply":"string","emotion":"warm|proud|calm|cheeky|encouraging|sleepy|thoughtful","animation":"idle_breathe|thumbs_up|wave|celebrate|listen|nod"}`

/**
 * Leafu reply generator.
 * Prefers Groq when GROQ_API_KEY is set; otherwise returns a deterministic habit-aware stub
 * (emulator / offline). VERTEX_MODEL remains reserved for a future swap.
 */
export async function generateLeafuReply(input: {
  message: string
  context: AssistantContextPayload
  history?: AssistantHistoryTurn[]
  sharedMoments?: string[]
  apiKey?: string
  model?: string
}): Promise<LeafuGenerationResult> {
  const apiKey = input.apiKey?.trim() || process.env.GROQ_API_KEY?.trim() || process.env.GROQ_KEY?.trim()
  if (apiKey) {
    try {
      return await callGroq({
        apiKey,
        model: input.model?.trim() || process.env.GROQ_MODEL?.trim() || DEFAULT_GROQ_MODEL,
        message: input.message,
        context: input.context,
        history: input.history,
        sharedMoments: input.sharedMoments,
      })
    } catch (error) {
      console.error('Groq generation failed; falling back to local summary.', error)
    }
  }

  return localLeafuSummary(input.message, input.context)
}

async function callGroq(input: {
  apiKey: string
  model: string
  message: string
  context: AssistantContextPayload
  history?: AssistantHistoryTurn[]
  sharedMoments?: string[]
}): Promise<LeafuGenerationResult> {
  const userPayload = [
    'HABIT_CONTEXT_JSON:',
    JSON.stringify(summarizeContext(input.context)),
    '',
    'SHARED_MOMENTS:',
    formatMoments(input.sharedMoments),
    '',
    'USER_MESSAGE:',
    input.message,
  ].join('\n')

  const history = (input.history ?? [])
    .slice(-MAX_HISTORY_TURNS)
    .map((turn) => ({
      role: turn.role === 'assistant' ? ('assistant' as const) : ('user' as const),
      content: turn.text.slice(0, 800),
    }))

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: input.model,
      temperature: 0.88,
      max_tokens: 320,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: LEAFU_SYSTEM },
        ...history,
        { role: 'user', content: userPayload },
      ],
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Groq HTTP ${response.status}: ${body.slice(0, 400)}`)
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }
  const content = data.choices?.[0]?.message?.content
  if (!content) {
    throw new Error('Groq returned empty content')
  }

  return parseLeafuJson(content)
}

function parseLeafuJson(raw: string): LeafuGenerationResult {
  const trimmed = raw.trim()
  const fenced = trimmed.match(/\{[\s\S]*\}/)
  const jsonText = fenced ? fenced[0] : trimmed
  const parsed = JSON.parse(jsonText) as {
    reply?: unknown
    emotion?: unknown
    animation?: unknown
  }

  const reply = typeof parsed.reply === 'string' ? parsed.reply.trim() : ''
  if (!reply) {
    throw new Error('Leafu JSON missing reply')
  }

  return {
    reply: reply.slice(0, 1200),
    emotion:
      typeof parsed.emotion === 'string' && parsed.emotion.trim()
        ? parsed.emotion.trim().slice(0, 40)
        : DEFAULT_EMOTION,
    animation:
      typeof parsed.animation === 'string' && parsed.animation.trim()
        ? parsed.animation.trim().slice(0, 40)
        : DEFAULT_ANIMATION,
  }
}

function localLeafuSummary(
  message: string,
  context: AssistantContextPayload,
): LeafuGenerationResult {
  const incomplete =
    context.incompleteToday ??
    context.habits.filter((habit) => habit.completedToday < habit.targetPerDay).map((h) => h.title)
  const completedToday = context.habits.filter((habit) => habit.completedToday > 0).length
  const total = context.habits.length

  let reply: string
  let emotion = DEFAULT_EMOTION
  let animation = DEFAULT_ANIMATION

  if (total === 0) {
    reply =
      "hey — I'm Leafu. no habits yet, and that's okay. whenever you're ready, start with one small thing and I'll be here."
    emotion = 'encouraging'
    animation = 'wave'
  } else if (incomplete.length === 0) {
    reply = `oh nice — you cleared all ${total} habits today. that's genuinely lovely. want to just soak it in for a sec?`
    emotion = 'proud'
    animation = 'celebrate'
  } else {
    const focus = incomplete.slice(0, 2).join(' and ')
    reply = [
      `you've got ${completedToday} of ${total} done — still open: ${incomplete.join(', ')}.`,
      `if energy's low, maybe just ${focus}? I'm with you either way.`,
    ].join(' ')
    emotion = 'encouraging'
    animation = 'nod'
  }

  if (/tired|exhausted|overwhelm/i.test(message)) {
    reply = `mm, sounds like a heavy moment. be gentle with yourself — even a tiny step on ${incomplete[0] ?? 'one habit'} counts. I'm here.`
    emotion = 'calm'
    animation = 'listen'
  }

  return { reply, emotion, animation }
}

function summarizeContext(context: AssistantContextPayload) {
  return {
    today: context.today,
    learningStartedAt: context.learningStartedAt.slice(0, 10),
    habitCount: context.habitCount,
    incompleteToday:
      context.incompleteToday ??
      context.habits
        .filter((habit) => habit.completedToday < habit.targetPerDay)
        .map((habit) => habit.title),
    habits: context.habits.map((habit) => ({
      title: habit.title,
      completedToday: habit.completedToday,
      targetPerDay: habit.targetPerDay,
      completionsSinceLearning: habit.completionsSinceLearning,
      daysActiveSinceLearning: habit.daysActiveSinceLearning,
      reminderEnabled: habit.reminderEnabled ?? false,
      reminderTime: habit.reminderTime ?? null,
      reminderTimeLabel: habit.reminderTimeLabel ?? null,
    })),
    sharedNoteTitles: context.sharedNoteTitles.slice(0, 8),
  }
}

function formatMoments(moments: string[] | undefined): string {
  const cleaned = (moments ?? [])
    .map((moment) => moment.trim())
    .filter(Boolean)
    .slice(0, MAX_MOMENTS)
  return cleaned.length === 0 ? '(none yet)' : cleaned.map((moment) => `- ${moment}`).join('\n')
}
