import { httpsCallable } from 'firebase/functions'
import { getFirebaseFunctions } from '../config/firebase'
import type {
  AssistantChatRequest,
  AssistantChatResponse,
  AssistantSafetyCategory,
} from '../types/assistant'
import { ASSISTANT_SAFE_REPLIES } from '../types/assistant'

export class AssistantServiceError extends Error {
  readonly code: 'UNAVAILABLE' | 'UNAUTHENTICATED' | 'QUOTA' | 'SAFETY' | 'UNKNOWN'

  constructor(
    message: string,
    code: 'UNAVAILABLE' | 'UNAUTHENTICATED' | 'QUOTA' | 'SAFETY' | 'UNKNOWN' = 'UNKNOWN',
  ) {
    super(message)
    this.name = 'AssistantServiceError'
    this.code = code
  }
}

const CLIENT_SAFETY_PATTERNS: Array<{ category: Exclude<AssistantSafetyCategory, 'none'>; pattern: RegExp }> =
  [
    {
      category: 'self_harm',
      pattern: /\b(kill myself|suicide|end my life|self[- ]?harm|want to die)\b/i,
    },
    {
      category: 'medical_emergency',
      pattern: /\b(heart attack|can'?t breathe|overdose|stroke|severe bleeding)\b/i,
    },
    {
      category: 'abuse',
      pattern: /\b(being abused|domestic violence|they hit me)\b/i,
    },
  ]

export function classifyClientSafety(message: string): AssistantSafetyCategory {
  for (const entry of CLIENT_SAFETY_PATTERNS) {
    if (entry.pattern.test(message)) return entry.category
  }
  return 'none'
}

export async function sendAssistantChat(
  request: AssistantChatRequest,
): Promise<AssistantChatResponse> {
  const localSafety = classifyClientSafety(request.message)
  if (localSafety !== 'none') {
    return {
      reply: ASSISTANT_SAFE_REPLIES[localSafety],
      safetyCategory: localSafety,
    }
  }

  try {
    const callable = httpsCallable<AssistantChatRequest, AssistantChatResponse>(
      getFirebaseFunctions(),
      'assistantChat',
    )
    const result = await callable(request)
    return result.data
  } catch (error) {
    const code =
      error && typeof error === 'object' && 'code' in error
        ? String((error as { code: string }).code)
        : ''

    if (code.includes('unauthenticated')) {
      throw new AssistantServiceError('Sign in with Firebase to use Leafu.', 'UNAUTHENTICATED')
    }
    if (code.includes('resource-exhausted')) {
      throw new AssistantServiceError('Daily Leafu limit reached. Try again tomorrow.', 'QUOTA')
    }
    if (code.includes('unavailable') || code.includes('not-found') || code.includes('failed-precondition')) {
      throw new AssistantServiceError(
        'Leafu backend is not available yet. Deploy the assistant function to enable replies.',
        'UNAVAILABLE',
      )
    }

    throw new AssistantServiceError(
      error instanceof Error ? error.message : 'Could not reach Leafu.',
      'UNKNOWN',
    )
  }
}
