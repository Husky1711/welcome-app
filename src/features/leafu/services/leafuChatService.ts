import {
  AssistantServiceError,
  sendAssistantChat,
} from '../../../services/assistantChatService'
import type {
  AssistantChatRequest,
  AssistantChatResponse,
} from '../../../types/assistant'

export { AssistantServiceError }

/** Thin Leafu transport — same Firebase callable as Coach. */
export async function sendLeafuChat(
  request: AssistantChatRequest,
): Promise<AssistantChatResponse> {
  return sendAssistantChat(request)
}
