export type AssistantAvailability =
  | 'ready'
  | 'needs_consent'
  | 'unavailable_mock_auth'
  | 'unavailable_no_uid'
  | 'unavailable_backend'

export type AssistantSafetyCategory =
  | 'none'
  | 'self_harm'
  | 'medical_emergency'
  | 'abuse'
  | 'policy'

export interface AssistantHabitSnapshot {
  id: string
  title: string
  targetPerDay: number
  completedToday: number
  completionsSinceLearning: number
  daysActiveSinceLearning: number
  reminderEnabled: boolean
  /** HH:MM (24h) when reminderEnabled; null otherwise */
  reminderTime: string | null
  /** Human label e.g. "1:26 PM" for Leafu replies */
  reminderTimeLabel: string | null
}

export interface AssistantContextPayload {
  learningStartedAt: string
  today: string
  habitCount: number
  habits: AssistantHabitSnapshot[]
  /** Habit titles not yet completed for today (gentle nudge list). */
  incompleteToday: string[]
  sharedNoteTitles: string[]
}

export interface AssistantHistoryTurn {
  role: 'user' | 'assistant'
  text: string
}

export interface AssistantChatRequest {
  message: string
  context: AssistantContextPayload
  /** Recent conversation turns (oldest → newest), excluding the current message. */
  history?: AssistantHistoryTurn[]
  /** Short durable moments the user/companion share (device-owned). */
  sharedMoments?: string[]
  clientRequestId: string
}

export interface AssistantChatResponse {
  reply: string
  safetyCategory: AssistantSafetyCategory
  /** Soft emotion label for future Rive (e.g. proud, calm, cheeky). */
  emotion?: string
  /** Animation hint for future Rive (e.g. thumbs_up, wave). */
  animation?: string
  usageRemainingToday?: number
}

export interface AssistantConsentState {
  ownerKey: string
  consentedAt: string
  learningStartedAt: string
  schemaVersion: 1
}

export const ASSISTANT_SAFE_REPLIES: Record<Exclude<AssistantSafetyCategory, 'none'>, string> =
  {
    self_harm:
      'I’m really glad you reached out. I’m not equipped for crisis support — please contact local emergency services or a crisis hotline right away. You’re not alone.',
    medical_emergency:
      'I’m not a medical professional. If this feels urgent, contact emergency services or a clinician now. I can still help with everyday habit routines once you’re safe.',
    abuse:
      'I’m sorry you’re dealing with this. Please reach out to trusted people or local support services. I can stay focused on gentle habit support when you’re ready.',
    policy:
      'I can’t help with that request. I can talk about your habits, routines, and progress instead.',
  }
