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
}

export interface AssistantContextPayload {
  learningStartedAt: string
  today: string
  habitCount: number
  habits: AssistantHabitSnapshot[]
  sharedNoteTitles: string[]
}

export interface AssistantChatRequest {
  message: string
  context: AssistantContextPayload
  clientRequestId: string
}

export interface AssistantChatResponse {
  reply: string
  safetyCategory: AssistantSafetyCategory
  usageRemainingToday?: number
}
