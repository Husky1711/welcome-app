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
  reminderEnabled?: boolean
  reminderTime?: string | null
  reminderTimeLabel?: string | null
}

export interface AssistantContextPayload {
  learningStartedAt: string
  today: string
  habitCount: number
  habits: AssistantHabitSnapshot[]
  incompleteToday?: string[]
  sharedNoteTitles: string[]
}

export interface AssistantHistoryTurn {
  role: 'user' | 'assistant'
  text: string
}

export interface AssistantChatRequest {
  message: string
  context: AssistantContextPayload
  history?: AssistantHistoryTurn[]
  sharedMoments?: string[]
  clientRequestId: string
}

export interface AssistantChatResponse {
  reply: string
  safetyCategory: AssistantSafetyCategory
  emotion?: string
  animation?: string
  usageRemainingToday?: number
}

export interface LeafuGenerationResult {
  reply: string
  emotion: string
  animation: string
}
