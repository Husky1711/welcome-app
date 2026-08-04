import type { FormEvent, KeyboardEvent } from 'react'
import { AppLayout } from '../../../layouts/AppLayout'
import { useLeafuChat } from '../hooks/useLeafuChat'
import { LEAFU_SUGGESTED_PROMPTS } from '../types'
import '../../../styles/coach-page.css'
import './companion-page.css'

export function CompanionPage() {
  const {
    user,
    availability,
    context,
    draft,
    setDraft,
    busy,
    listening,
    speakReplies,
    setSpeakReplies,
    voiceInputAvailable,
    voiceOutputAvailable,
    error,
    messages,
    enableConsent,
    send,
    startVoiceTurn,
    cancelVoiceTurn,
  } = useLeafuChat()

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    void send(draft)
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void send(draft)
    }
  }

  return (
    <AppLayout title="Leafu" subtitle="Your habit companion" showBrand align="top">
      <div className="coach-page companion-page">
        {availability === 'unavailable_mock_auth' ? (
          <UnavailableCard
            title="Leafu needs Firebase sign-in"
            body="Mock authentication is active. Switch to Firebase Auth (or the Auth emulator) to enable Leafu. This keeps API access behind real identity and App Check."
          />
        ) : null}

        {availability === 'unavailable_no_uid' ? (
          <UnavailableCard
            title="Leafu is unavailable"
            body="Sign in again with Firebase so Leafu can bind to your account UID."
          />
        ) : null}

        {availability === 'needs_consent' && user ? (
          <section className="coach-consent" aria-label="Leafu consent">
            <h2 className="coach-consent__title">Before we begin</h2>
            <p className="coach-consent__body">
              Leafu sends your current message, recent chat turns, and a small snapshot of
              selected habit progress to our secure backend (Groq via Firebase) to generate a
              reply. Shared Moments stay on this device in this version. You can also talk with
              the mic when your browser supports it.
            </p>
            <ul className="coach-consent__list">
              <li>Only genuine activity after you accept is used for learning.</li>
              <li>Private notes are excluded unless you mark “Share with Coach”.</li>
              <li>Leafu is not a doctor, therapist, or crisis service.</li>
              <li>You can clear Leafu data anytime from Settings.</li>
            </ul>
            <button type="button" className="app-btn-primary" onClick={enableConsent}>
              I understand — enable Leafu
            </button>
          </section>
        ) : null}

        {availability === 'ready' && context ? (
          <>
            <div className="coach-disclosure companion-toolbar">
              <DisclosurePanel context={context} />
              {voiceOutputAvailable ? (
                <label className="companion-speak-toggle">
                  <input
                    type="checkbox"
                    checked={speakReplies}
                    onChange={(event) => setSpeakReplies(event.target.checked)}
                  />
                  <span>Speak replies (preview voice)</span>
                </label>
              ) : null}
            </div>

            <div className="coach-thread" aria-live="polite">
              {messages.length === 0 ? (
                <p className="coach-thread__empty">
                  Ask Leafu about your habits after activation.
                </p>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`coach-bubble coach-bubble--${message.role}`}
                    data-emotion={
                      message.role === 'assistant' && message.emotion
                        ? message.emotion
                        : undefined
                    }
                  >
                    {message.role === 'assistant' && message.emotion ? (
                      <span
                        className="companion-emotion"
                        data-emotion={message.emotion}
                        aria-label={`Feeling ${message.emotion}`}
                      >
                        {message.emotion}
                      </span>
                    ) : null}
                    <p>{message.text}</p>
                  </div>
                ))
              )}
            </div>

            {messages.length <= 1 ? (
              <div className="coach-suggestions" aria-label="Suggested prompts">
                {LEAFU_SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    className="coach-suggestions__chip"
                    disabled={busy || listening}
                    onClick={() => void send(prompt)}
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

            <form className="coach-composer companion-composer" onSubmit={handleSubmit}>
              <label className="sr-only" htmlFor="leafu-message">
                Message Leafu
              </label>
              <textarea
                id="leafu-message"
                value={draft}
                rows={2}
                placeholder={listening ? 'Listening…' : 'Ask Leafu about your habits…'}
                disabled={busy || listening}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={handleComposerKeyDown}
              />
              <div className="companion-composer__actions">
                {voiceInputAvailable ? (
                  <button
                    type="button"
                    className={`companion-mic ${listening ? 'companion-mic--active' : ''}`}
                    aria-pressed={listening}
                    aria-label={listening ? 'Stop listening' : 'Talk to Leafu'}
                    disabled={busy}
                    onClick={() => {
                      if (listening) cancelVoiceTurn()
                      else void startVoiceTurn()
                    }}
                  >
                    {listening ? 'Listening…' : 'Mic'}
                  </button>
                ) : null}
                <button
                  type="submit"
                  className="app-btn-primary"
                  disabled={busy || listening || !draft.trim()}
                >
                  {busy ? 'Thinking…' : 'Send'}
                </button>
              </div>
            </form>
          </>
        ) : null}
      </div>
    </AppLayout>
  )
}

function DisclosurePanel({
  context,
}: {
  context: NonNullable<ReturnType<typeof useLeafuChat>['context']>
}) {
  return (
    <details className="companion-disclosure">
      <summary>What Leafu can see</summary>
      <div className="coach-disclosure__panel">
        <p>
          Learning since {new Date(context.learningStartedAt).toLocaleString()} ·{' '}
          {context.habitCount} habit{context.habitCount === 1 ? '' : 's'}
        </p>
        {context.incompleteToday.length > 0 ? (
          <p>Still open today: {context.incompleteToday.join(', ')}</p>
        ) : (
          <p>Nothing left incomplete today (or no habits yet).</p>
        )}
        <ul>
          {context.habits.map((habit) => (
            <li key={habit.id}>
              {habit.title}: {habit.completedToday}/{habit.targetPerDay} today ·{' '}
              {habit.completionsSinceLearning} since activation
              {habit.reminderEnabled && habit.reminderTimeLabel
                ? ` · reminder ${habit.reminderTimeLabel}`
                : ''}
            </li>
          ))}
          {context.habits.length === 0 ? <li>No habits yet.</li> : null}
        </ul>
        {context.sharedNoteTitles.length > 0 ? (
          <p>Shared note titles: {context.sharedNoteTitles.join(', ')}</p>
        ) : (
          <p>No notes shared with Leafu.</p>
        )}
      </div>
    </details>
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
