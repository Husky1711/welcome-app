import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../../hooks/useAuth'
import {
  ensureAssistantConsent,
  getAssistantAvailability,
  getAssistantLearningStartedAt,
} from '../../../utils/assistantAvailability'
import { buildAssistantContext } from '../../../utils/assistantContext'
import {
  AssistantServiceError,
  sendLeafuChat,
} from '../services/leafuChatService'
import {
  isLeafuSpeechRecognitionAvailable,
  isLeafuSpeechSynthesisAvailable,
  listenOnceLeafu,
  preloadLeafuVoices,
  speakLeafu,
  stopLeafuListening,
  stopLeafuSpeaking,
} from '../services/leafuVoice'
import {
  listSharedMomentTexts,
  maybeLearnFromUserMessage,
  maybeRecordHabitMoment,
  onLeafuSessionStart,
} from '../memory/sharedMoments'
import {
  LEAFU_HISTORY_LIMIT,
  type LeafuChatMessage,
} from '../types'

export function useLeafuChat() {
  const { user } = useAuth()
  const [consentTick, setConsentTick] = useState(0)
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [listening, setListening] = useState(false)
  const [speakReplies, setSpeakReplies] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [messages, setMessages] = useState<LeafuChatMessage[]>([])

  const voiceInputAvailable = isLeafuSpeechRecognitionAvailable()
  const voiceOutputAvailable = isLeafuSpeechSynthesisAvailable()

  useEffect(() => {
    preloadLeafuVoices()
    return () => {
      stopLeafuListening()
      stopLeafuSpeaking()
    }
  }, [])

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

  function enableConsent() {
    if (!user) return
    ensureAssistantConsent(user)
    const { welcomeBack } = onLeafuSessionStart()
    setConsentTick((tick) => tick + 1)
    setMessages([
      {
        id: crypto.randomUUID(),
        role: 'assistant',
        text: welcomeBack
          ? 'Welcome back — I’m Leafu. Glad you’re here again. Ask what’s left today, or just say how you’re feeling.'
          : 'Hi — I’m Leafu. Ask about today’s habits, what’s left, or what to focus on next. I’m here with you.',
        emotion: 'warm',
        animation: 'wave',
      },
    ])
  }

  async function send(text: string, options?: { speak?: boolean }) {
    const trimmed = text.trim()
    if (!trimmed || !user || !learningStartedAt || !context || busy || listening) return

    setError(null)
    setDraft('')
    stopLeafuSpeaking()

    const userMessage: LeafuChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text: trimmed,
    }
    const history = messages
      .filter((message) => message.role === 'user' || message.role === 'assistant')
      .slice(-LEAFU_HISTORY_LIMIT)
      .map((message) => ({
        role: message.role as 'user' | 'assistant',
        text: message.text,
      }))

    setMessages((current) => [...current, userMessage])
    setBusy(true)

    maybeLearnFromUserMessage(trimmed)
    const incompleteBefore = context.incompleteToday
    const shouldSpeak = options?.speak ?? speakReplies

    try {
      const liveContext = buildAssistantContext({
        learningStartedAt,
        email: user.email,
      })

      const response = await sendLeafuChat({
        message: trimmed,
        context: liveContext,
        history,
        sharedMoments: listSharedMomentTexts(),
        clientRequestId: crypto.randomUUID(),
      })

      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          text: response.reply,
          safetyCategory: response.safetyCategory,
          emotion: response.emotion,
          animation: response.animation,
        },
      ])

      if (shouldSpeak && voiceOutputAvailable && response.safetyCategory === 'none') {
        speakLeafu(response.reply, { emotion: response.emotion })
      }

      const refreshed = buildAssistantContext({
        learningStartedAt,
        email: user.email,
      })
      maybeRecordHabitMoment({
        incompleteBefore,
        incompleteAfter: refreshed.incompleteToday,
        habitCount: refreshed.habitCount,
      })
    } catch (err) {
      const message =
        err instanceof AssistantServiceError
          ? err.message
          : navigator.onLine === false
            ? 'You’re offline. Leafu needs a connection to reply.'
            : 'Could not reach Leafu right now.'
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

  async function startVoiceTurn() {
    if (!voiceInputAvailable || busy || listening) return
    setError(null)
    stopLeafuSpeaking()
    setListening(true)
    try {
      const transcript = await listenOnceLeafu()
      if (!transcript) {
        setError('Didn’t catch that — tap the mic and try again.')
        return
      }
      setDraft(transcript)
      await send(transcript, { speak: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Voice input failed.')
    } finally {
      setListening(false)
    }
  }

  function cancelVoiceTurn() {
    stopLeafuListening()
    setListening(false)
  }

  return {
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
  }
}
