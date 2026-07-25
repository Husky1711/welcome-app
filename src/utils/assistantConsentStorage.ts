import type { AssistantConsentState } from '../types/assistant'

const CONSENT_PREFIX = 'welcome_app.assistant.consent.v1.'

function consentKey(ownerKey: string): string {
  return `${CONSENT_PREFIX}${ownerKey}`
}

export function assistantOwnerKey(uid?: string | null, email?: string | null): string {
  if (uid?.trim()) return `uid:${uid.trim()}`
  if (email?.trim()) return `email:${email.trim().toLowerCase()}`
  return 'local'
}

export function getAssistantConsent(ownerKey: string): AssistantConsentState | null {
  if (typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem(consentKey(ownerKey))
    if (!raw) return null
    const parsed = JSON.parse(raw) as AssistantConsentState
    if (
      parsed?.schemaVersion !== 1 ||
      typeof parsed.consentedAt !== 'string' ||
      typeof parsed.learningStartedAt !== 'string' ||
      parsed.ownerKey !== ownerKey
    ) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function acceptAssistantConsent(ownerKey: string, at: string = new Date().toISOString()): AssistantConsentState {
  const state: AssistantConsentState = {
    ownerKey,
    consentedAt: at,
    learningStartedAt: at,
    schemaVersion: 1,
  }
  localStorage.setItem(consentKey(ownerKey), JSON.stringify(state))
  return state
}

export function clearAssistantConsent(ownerKey: string): void {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(consentKey(ownerKey))
}

export function clearAllAssistantConsent(): void {
  if (typeof localStorage === 'undefined') return
  const keys: string[] = []
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i)
    if (key?.startsWith(CONSENT_PREFIX)) keys.push(key)
  }
  keys.forEach((key) => localStorage.removeItem(key))
}
