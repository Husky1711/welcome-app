import { initializeApp } from 'firebase-admin/app'
import { HttpsError, onCall } from 'firebase-functions/v2/https'
import { classifySafety } from './safety'
import { generateCoachReply } from './provider'
import type { AssistantChatRequest, AssistantChatResponse } from './types'

initializeApp()

const MAX_MESSAGE_CHARS = 1200
const DAILY_LIMIT = 20

/** Minimal per-UID daily counters. Replace with Firestore before multi-instance production scale-out. */
const usageByDay = new Map<string, number>()

function usageKey(uid: string, day: string): string {
  return `${uid}:${day}`
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
      }
    }

    const uid = request.auth.uid
    const day = new Date().toISOString().slice(0, 10)
    const key = usageKey(uid, day)
    const count = usageByDay.get(key) ?? 0
    if (count >= DAILY_LIMIT) {
      throw new HttpsError('resource-exhausted', 'Daily Coach limit reached.')
    }
    usageByDay.set(key, count + 1)

    const reply = await generateCoachReply({
      message,
      context: data.context,
    })

    return {
      reply,
      safetyCategory: 'none',
      usageRemainingToday: DAILY_LIMIT - (count + 1),
    }
  },
)

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
