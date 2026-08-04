/** Browser Web Speech helpers for Leafu voice turns (STT + TTS). */

export type LeafuSpeechEmotion =
  | 'warm'
  | 'proud'
  | 'calm'
  | 'cheeky'
  | 'encouraging'
  | 'sleepy'
  | 'thoughtful'
  | string

type SpeechRecognitionResultLike = {
  readonly isFinal: boolean
  readonly 0: { transcript: string }
}

type SpeechRecognitionEventLike = {
  readonly resultIndex: number
  readonly results: ArrayLike<SpeechRecognitionResultLike>
}

type SpeechRecognitionLike = {
  lang: string
  interimResults: boolean
  continuous: boolean
  maxAlternatives: number
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: ((event: { error?: string }) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike

/** Soft, warm, companion-like — not deep adult narrator, not baby voice. */
const LEAFU_VOICE_PREFER = [
  'google uk english female',
  'google us english',
  'samantha',
  'karen',
  'victoria',
  'tessa',
  'fiona',
  'moira',
  'zira',
  'aria',
  'jenny',
  'female',
  'natural',
]

const LEAFU_VOICE_AVOID = [
  'david',
  'daniel',
  'james',
  'guy',
  'mark',
  'richard',
  'male',
  'deep',
  'news',
  'narrator',
]

let cachedVoices: SpeechSynthesisVoice[] = []
let voicesReady = false

function getSpeechRecognitionCtor(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export function isLeafuSpeechRecognitionAvailable(): boolean {
  return getSpeechRecognitionCtor() !== null
}

export function isLeafuSpeechSynthesisAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.speechSynthesis !== 'undefined'
}

/** Call once on Companion mount so voices load before first reply. */
export function preloadLeafuVoices(): void {
  if (!isLeafuSpeechSynthesisAvailable()) return

  const refresh = () => {
    cachedVoices = window.speechSynthesis.getVoices()
    voicesReady = cachedVoices.length > 0
  }

  refresh()
  window.speechSynthesis.addEventListener('voiceschanged', refresh)
}

function scoreVoice(voice: SpeechSynthesisVoice): number {
  const label = `${voice.name} ${voice.lang}`.toLowerCase()
  let score = 0

  for (const token of LEAFU_VOICE_PREFER) {
    if (label.includes(token)) score += 12
  }
  for (const token of LEAFU_VOICE_AVOID) {
    if (label.includes(token)) score -= 20
  }

  if (voice.lang.toLowerCase().startsWith('en')) score += 5
  if (voice.default) score += 2
  // Slightly favor non-local voices on Chrome — often clearer (still free).
  if (!voice.localService) score += 3

  return score
}

export function pickLeafuVoice(): SpeechSynthesisVoice | null {
  if (!isLeafuSpeechSynthesisAvailable()) return null

  const voices = voicesReady ? cachedVoices : window.speechSynthesis.getVoices()
  const english = voices.filter((voice) => voice.lang.toLowerCase().startsWith('en'))
  const pool = english.length > 0 ? english : voices
  if (pool.length === 0) return null

  return [...pool].sort((a, b) => scoreVoice(b) - scoreVoice(a))[0] ?? null
}

function prosodyForEmotion(emotion?: LeafuSpeechEmotion): { rate: number; pitch: number } {
  switch (emotion) {
    case 'proud':
    case 'celebrate':
      return { rate: 1.06, pitch: 1.22 }
    case 'cheeky':
      return { rate: 1.1, pitch: 1.24 }
    case 'encouraging':
      return { rate: 1.05, pitch: 1.2 }
    case 'calm':
    case 'sleepy':
      return { rate: 0.94, pitch: 1.12 }
    case 'thoughtful':
      return { rate: 0.98, pitch: 1.14 }
    case 'warm':
    default:
      return { rate: 1.02, pitch: 1.18 }
  }
}

let activeRecognition: SpeechRecognitionLike | null = null

export function stopLeafuListening(): void {
  if (!activeRecognition) return
  try {
    activeRecognition.onresult = null
    activeRecognition.onerror = null
    activeRecognition.onend = null
    activeRecognition.abort()
  } catch {
    // ignore
  }
  activeRecognition = null
}

export function listenOnceLeafu(options?: {
  lang?: string
  timeoutMs?: number
}): Promise<string> {
  const Ctor = getSpeechRecognitionCtor()
  if (!Ctor) {
    return Promise.reject(new Error('Voice input is not supported in this browser.'))
  }

  stopLeafuSpeaking()
  stopLeafuListening()

  const timeoutMs = options?.timeoutMs ?? 12000

  return new Promise((resolve, reject) => {
    const recognition = new Ctor()
    activeRecognition = recognition
    recognition.lang = options?.lang ?? 'en-US'
    recognition.interimResults = false
    recognition.continuous = false
    recognition.maxAlternatives = 1

    let settled = false
    const timer = window.setTimeout(() => {
      if (settled) return
      settled = true
      try {
        recognition.stop()
      } catch {
        // ignore
      }
      activeRecognition = null
      reject(new Error('Listening timed out — try again.'))
    }, timeoutMs)

    recognition.onresult = (event) => {
      let transcript = ''
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i]
        if (result?.isFinal) {
          transcript += result[0]?.transcript ?? ''
        }
      }
      if (!settled) {
        settled = true
        window.clearTimeout(timer)
        activeRecognition = null
        resolve(transcript.trim())
      }
    }

    recognition.onerror = (event) => {
      if (settled) return
      settled = true
      window.clearTimeout(timer)
      activeRecognition = null
      const code = event.error ?? 'unknown'
      if (code === 'aborted' || code === 'no-speech') {
        resolve('')
        return
      }
      reject(new Error(humanizeSpeechError(code)))
    }

    recognition.onend = () => {
      if (settled) return
      settled = true
      window.clearTimeout(timer)
      activeRecognition = null
      resolve('')
    }

    try {
      recognition.start()
    } catch (error) {
      settled = true
      window.clearTimeout(timer)
      activeRecognition = null
      reject(error instanceof Error ? error : new Error('Could not start microphone.'))
    }
  })
}

function humanizeSpeechError(code: string): string {
  switch (code) {
    case 'not-allowed':
      return 'Microphone permission is blocked. Allow mic access in the browser address bar, then try again.'
    case 'network':
      return 'Mic needs an internet connection (Chrome speech is online). Check Wi‑Fi, then try again — or type your message.'
    case 'service-not-allowed':
      return 'Speech recognition is blocked on this device. Type your message instead.'
    case 'audio-capture':
      return 'No microphone found. Plug in a mic or type your message.'
    case 'language-not-supported':
      return 'This language isn’t supported for voice. Type your message instead.'
    default:
      return `Voice input failed (${code}). You can still type to Leafu.`
  }
}

export function stopLeafuSpeaking(): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
}

/**
 * Speak Leafu’s reply with companion-like prosody (lighter pitch, soft rate).
 * Uses best available system voice — custom Leafu TTS comes in a later milestone.
 */
export function speakLeafu(
  text: string,
  options?: { rate?: number; pitch?: number; emotion?: LeafuSpeechEmotion },
): void {
  if (!isLeafuSpeechSynthesisAvailable()) return
  const cleaned = text.trim()
  if (!cleaned) return

  stopLeafuSpeaking()

  const base = prosodyForEmotion(options?.emotion)
  const utterance = new SpeechSynthesisUtterance(cleaned)
  utterance.rate = options?.rate ?? base.rate
  utterance.pitch = options?.pitch ?? base.pitch
  utterance.lang = 'en-US'

  const voice = pickLeafuVoice()
  if (voice) utterance.voice = voice

  window.speechSynthesis.speak(utterance)
}
