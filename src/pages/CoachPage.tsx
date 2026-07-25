import { useMemo, useState, type FormEvent, type KeyboardEvent } from 'react'
import { AppLayout } from '../layouts/AppLayout'
import { useAuth } from '../hooks/useAuth'
import {
  ensureAssistantConsent,
  getAssistantAvailability,
  getAssistantLearningStartedAt,
} from '../utils/assistantAvailability'
import { buildAssistantContext } from '../utils/assistantContext'
import {
  AssistantServiceError,
  sendAssistantChat,
} from '../services/assistantChatService'
import type { AssistantSafetyCategory } from '../types/assistant'
import '../styles/coach-page.css'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  text: string
  safetyCategory?: AssistantSafetyCategory
}

const SUGGESTED_PROMPTS = [
  'How am I doing with my habits today?',
  'What should I focus on next?',
  'Give me a gentle evening check-in.',
]

export function CoachPage() {
  const { user } = useAuth()
  const [consentTick, setConsentTick] = useState(0)
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showContext, setShowContext] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])

  const availability = useMemo(() => {
    void consentTick
    return getAssistantAvailability(user)
  }, [user, consentTick])

  const learningStartedAt = useMemo(() => {
    void consentTick
    return getAssistantLearningStartedAt(user)
  }, [user, consentTick])

  const context = useMemo(() => {
    if (!learningStartedAt || !user) return null
    return buildAssistantContext({
      learningStartedAt,
      email: user.email,
    })
  }, [learningStartedAt, user])

  async function handleSend(text: string) {
    const trimmed = text.trim()
    if (!trimmed || !user || !learningStartedAt || !context || busy) return

    setError(null)
    setDraft('')
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text: trimmed,
    }
    setMessages((current) => [...current, userMessage])
    setBusy(true)

    try {
      const response = await sendAssistantChat({
        message: trimmed,
        context,
        clientRequestId: crypto.randomUUID(),
      })
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          text: response.reply,
          safetyCategory: response.safetyCategory,
        },
      ])
    } catch (err) {
      const message =
        err instanceof AssistantServiceError
          ? err.message
          : 'Could not reach Coach right now.'
      setError(message)
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: 'system',
          text: message,
        },
      ])
    } finally {
      setBusy(false)
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    void handleSend(draft)
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void handleSend(draft)
    }
  }

  return (
    <AppLayout
      title="Welcome Coach"
      subtitle="Supportive habit partner"
      showBrand
      align="top"
    >
      <div className="coach-page">
        {availability === 'unavailable_mock_auth' ? (
          <UnavailableCard
            title="Coach needs Firebase sign-in"
            body="Mock authentication is active. Switch to Firebase Auth (or the Auth emulator) to enable Coach. This keeps API access behind real identity and App Check."
          />
        ) : null}

        {availability === 'unavailable_no_uid' ? (
          <UnavailableCard
            title="Coach is unavailable"
            body="Sign in again with Firebase so Coach can bind to your account UID."
          />
        ) : null}

        {availability === 'needs_consent' && user ? (
          <section className="coach-consent" aria-label="Coach consent">
            <h2 className="coach-consent__title">Before we begin</h2>
            <p className="coach-consent__body">
              Coach sends your current message and a small snapshot of selected habit
              progress to Google Cloud (Vertex AI) to generate a reply. Approved memories
              stay on this device later — this first version does not keep a chat history.
            </p>
            <ul className="coach-consent__list">
              <li>Only genuine activity after you accept is used for learning.</li>
              <li>Private notes are excluded unless you mark “Share with Coach”.</li>
              <li>Coach is not a doctor, therapist, or crisis service.</li>
              <li>You can clear Coach data anytime from Settings.</li>
            </ul>
            <button
              type="button"
              className="app-btn-primary"
              onClick={() => {
                ensureAssistantConsent(user)
                setConsentTick((tick) => tick + 1)
                setMessages([
                  {
                    id: crypto.randomUUID(),
                    role: 'assistant',
                    text: 'Hi — I’m your Welcome Coach. Ask about today’s habits, streaks after activation, or what to focus on next.',
                  },
                ])
              }}
            >
              I understand — enable Coach
            </button>
          </section>
        ) : null}

        {availability === 'ready' && context ? (
          <>
            <div className="coach-disclosure">
              <button
                type="button"
                className="coach-disclosure__toggle"
                aria-expanded={showContext}
                onClick={() => setShowContext((open) => !open)}
              >
                {showContext ? 'Hide' : 'Show'} what Coach can see
              </button>
              {showContext ? (
                <div className="coach-disclosure__panel">
                  <p>
                    Learning since {new Date(context.learningStartedAt).toLocaleString()} ·{' '}
                    {context.habitCount} habit{context.habitCount === 1 ? '' : 's'}
                  </p>
                  <ul>
                    {context.habits.map((habit) => (
                      <li key={habit.id}>
                        {habit.title}: {habit.completedToday}/{habit.targetPerDay} today ·{' '}
                        {habit.completionsSinceLearning} since activation
                      </li>
                    ))}
                    {context.habits.length === 0 ? <li>No habits yet.</li> : null}
                  </ul>
                  {context.sharedNoteTitles.length > 0 ? (
                    <p>Shared note titles: {context.sharedNoteTitles.join(', ')}</p>
                  ) : (
                    <p>No notes shared with Coach.</p>
                  )}
                </div>
              ) : null}
            </div>

            <div className="coach-thread" aria-live="polite">
              {messages.length === 0 ? (
                <p className="coach-thread__empty">Ask Coach about your habits after activation.</p>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`coach-bubble coach-bubble--${message.role}`}
                  >
                    <p>{message.text}</p>
                  </div>
                ))
              )}
            </div>

            {messages.length === 0 ? (
              <div className="coach-suggestions" aria-label="Suggested prompts">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    className="coach-suggestions__chip"
                    disabled={busy}
                    onClick={() => void handleSend(prompt)}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            ) : null}

            {error ? (
              <p className="coach-error" role="alert">
                {error}
              </p>
            ) : null}

            <form className="coach-composer" onSubmit={handleSubmit}>
              <label className="sr-only" htmlFor="coach-message">
                Message Coach
              </label>
              <textarea
                id="coach-message"
                value={draft}
                rows={2}
                placeholder="Ask about your habits…"
                disabled={busy}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={handleComposerKeyDown}
              />
              <button type="submit" className="app-btn-primary" disabled={busy || !draft.trim()}>
                {busy ? 'Thinking…' : 'Send'}
              </button>
            </form>
          </>
        ) : null}
      </div>
    </AppLayout>
  )
}

function UnavailableCard({ title, body }: { title: string; body: string }) {
  return (
    <section className="coach-unavailable" aria-label={title}>
      <h2>{title}</h2>
      <p>{body}</p>
    </section>
  )
}
