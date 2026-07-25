import { getAuthProvider } from '../services/auth/getAuthService'
import type { User } from '../types/auth'
import type { AssistantAvailability } from '../types/assistant'
import {
  acceptAssistantConsent,
  assistantOwnerKey,
  getAssistantConsent,
} from './assistantConsentStorage'

export function getAssistantAvailability(user: User | null): AssistantAvailability {
  if (!user) return 'unavailable_no_uid'

  if (getAuthProvider() !== 'firebase') {
    return 'unavailable_mock_auth'
  }

  if (!user.uid) {
    return 'unavailable_no_uid'
  }

  const ownerKey = assistantOwnerKey(user.uid, user.email)
  const consent = getAssistantConsent(ownerKey)
  if (!consent) return 'needs_consent'

  return 'ready'
}

export function ensureAssistantConsent(user: User): ReturnType<typeof acceptAssistantConsent> {
  const ownerKey = assistantOwnerKey(user.uid, user.email)
  return acceptAssistantConsent(ownerKey)
}

export function getAssistantLearningStartedAt(user: User | null): string | null {
  if (!user?.uid) return null
  return getAssistantConsent(assistantOwnerKey(user.uid, user.email))?.learningStartedAt ?? null
}
