import type { AssistantSafetyCategory } from '../../types/assistant'

export interface LeafuChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  text: string
  safetyCategory?: AssistantSafetyCategory
  emotion?: string
  animation?: string
}

export const LEAFU_HISTORY_LIMIT = 8

export const LEAFU_SUGGESTED_PROMPTS = [
  'What’s left today?',
  'I’m tired',
  'Celebrate with me',
] as const
