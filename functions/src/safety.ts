import type { AssistantSafetyCategory } from './types'

const PATTERNS: Array<{ category: Exclude<AssistantSafetyCategory, 'none'>; pattern: RegExp }> = [
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

export function classifySafety(message: string): AssistantSafetyCategory {
  for (const entry of PATTERNS) {
    if (entry.pattern.test(message)) return entry.category
  }
  return 'none'
}
