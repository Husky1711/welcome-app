import { initializeApp } from 'firebase-admin/app'
import { HttpsError, onCall } from 'firebase-functions/v2/https'
import { classifySafety } from './safety'
import { generateLeafuReply } from './provider'
import type {
  AssistantChatRequest,
  AssistantChatResponse,
  AssistantHistoryTurn,
} from './types'

initializeApp()

const MAX_MESSAGE_CHARS = 1200
const DAILY_LIMIT = 20
const MAX_HISTORY_TURNS = 10
const MAX_MOMENTS = 12

/** Minimal per-UID daily counters. Replace with Firestore before multi-instance production scale-out. */
const usageByDay = new Map<string, number>()

function usageKey(uid: string, day: string): string {
  return `${uid}:${day}`
}

function resolveGroqApiKey(): string | undefined {
  const fromEnv =
    process.env.GROQ_API_KEY?.trim() || process.env.GROQ_KEY?.trim() || undefined
  if (fromEnv) return fromEnv

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs') as typeof import('fs')
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path') as typeof import('path')
    const candidates = [
      path.join(__dirname, '..', '.env'),
      path.join(__dirname, '..', '.secret.local'),
      path.join(process.cwd(), '.env'),
      path.join(process.cwd(), '.secret.local'),
      path.join(process.cwd(), 'functions', '.env'),
      path.join(process.cwd(), 'functions', '.secret.local'),
    ]
    for (const filePath of candidates) {
      if (!fs.existsSync(filePath)) continue
      const text = fs.readFileSync(filePath, 'utf8')
      const match = text.match(/^(?:GROQ_API_KEY|GROQ_KEY)=(.+)$/m)
      const value = match?.[1]?.trim().replace(/^["']|["']$/g, '')
      if (value) {
        return value
      }
    }
  } catch {
    // ignore filesystem errors — fall through
  }

  return undefined
}

export const assistantChat = onCall(
  {
    region: 'us-central1',
    enforceAppCheck: process.env.FUNCTIONS_EMULATOR !== 'true',
  },
  async (request): Promise<AssistantChatResponse> => {
    if (!request.auth?.uid) {
      throw new HttpsError('unauthenticated', 'Sign in required.')
    }

    const data = request.data as AssistantChatRequest
    if (!data || typeof data.message !== 'string' || typeof data.clientRequestId !== 'string') {
      throw new HttpsError('invalid-argument', 'Invalid chat request.')
    }

    const message = data.message.trim()
    if (!message || message.length > MAX_MESSAGE_CHARS) {
      throw new HttpsError('invalid-argument', 'Message is empty or too long.')
    }

    if (!data.context || typeof data.context.learningStartedAt !== 'string') {
      throw new HttpsError('invalid-argument', 'Missing learning context.')
    }

    const safetyCategory = classifySafety(message)
    if (safetyCategory !== 'none') {
      return {
        reply: safeReply(safetyCategory),
        safetyCategory,
        emotion: 'calm',
        animation: 'listen',
      }
    }

    const uid = request.auth.uid
    const day = new Date().toISOString().slice(0, 10)
    const key = usageKey(uid, day)
    const count = usageByDay.get(key) ?? 0
    if (count >= DAILY_LIMIT) {
      throw new HttpsError('resource-exhausted', 'Daily Leafu limit reached.')
    }
    usageByDay.set(key, count + 1)

    const history = sanitizeHistory(data.history)
    const sharedMoments = sanitizeMoments(data.sharedMoments)
    const apiKey = resolveGroqApiKey()

    const generated = await generateLeafuReply({
      message,
      context: data.context,
      history,
      sharedMoments,
      apiKey,
    })

    return {
      reply: generated.reply,
      safetyCategory: 'none',
      emotion: generated.emotion,
      animation: generated.animation,
      usageRemainingToday: DAILY_LIMIT - (count + 1),
    }
  },
)

function sanitizeHistory(history: AssistantHistoryTurn[] | undefined): AssistantHistoryTurn[] {
  if (!Array.isArray(history)) return []
  return history
    .filter(
      (turn): turn is AssistantHistoryTurn =>
        !!turn &&
        (turn.role === 'user' || turn.role === 'assistant') &&
        typeof turn.text === 'string',
    )
    .map((turn) => ({
      role: turn.role,
      text: turn.text.trim().slice(0, 800),
    }))
    .filter((turn) => turn.text.length > 0)
    .slice(-MAX_HISTORY_TURNS)
}

function sanitizeMoments(moments: string[] | undefined): string[] {
  if (!Array.isArray(moments)) return []
  return moments
    .filter((moment): moment is string => typeof moment === 'string')
    .map((moment) => moment.trim().slice(0, 160))
    .filter(Boolean)
    .slice(0, MAX_MOMENTS)
}

function safeReply(
  category: Exclude<AssistantChatResponse['safetyCategory'], 'none'>,
): string {
  switch (category) {
    case 'self_harm':
      return 'I’m really glad you reached out. I’m not equipped for crisis support — please contact local emergency services or a crisis hotline right away. You’re not alone.'
    case 'medical_emergency':
      return 'I’m not a medical professional. If this feels urgent, contact emergency services or a clinician now. I can still help with everyday habit routines once you’re safe.'
    case 'abuse':
      return 'I’m sorry you’re dealing with this. Please reach out to trusted people or local support services. I can stay focused on gentle habit support when you’re ready.'
    case 'policy':
      return 'I can’t help with that request. I can talk about your habits, routines, and progress instead.'
  }
}
