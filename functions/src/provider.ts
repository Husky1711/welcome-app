import type { AssistantContextPayload } from './types'

/**
 * Provider-neutral coach reply generator.
 * Uses a deterministic local summary when Vertex is not configured (emulator/dev).
 * Wire Vertex AI Flash-Lite here for production by setting VERTEX_MODEL.
 */
export async function generateCoachReply(input: {
  message: string
  context: AssistantContextPayload
}): Promise<string> {
  const vertexModel = process.env.VERTEX_MODEL
  if (vertexModel) {
    // Production path: implement Vertex generateContent via service-account IAM.
    // Kept as an explicit stub so deploys fail closed until Vertex is wired.
    throw new Error(
      `VERTEX_MODEL=${vertexModel} is set but Vertex generation is not wired yet.`,
    )
  }

  const completedToday = input.context.habits.filter((habit) => habit.completedToday > 0).length
  const total = input.context.habits.length
  const top = input.context.habits
    .slice(0, 3)
    .map((habit) => `${habit.title} (${habit.completionsSinceLearning} since activation)`)
    .join(', ')

  return [
    `Thanks for checking in. Since activation on ${input.context.learningStartedAt.slice(0, 10)}, I’m only using progress after that date.`,
    total === 0
      ? 'You don’t have active habits yet — start with one small habit when you’re ready.'
      : `Today you’ve completed ${completedToday} of ${total} tracked habits${top ? `. Recent focus: ${top}.` : '.'}`,
    'I’m a supportive habit partner, not a medical adviser. What would help most right now — encouragement, a focus pick, or a gentler pace?',
  ].join(' ')
}
