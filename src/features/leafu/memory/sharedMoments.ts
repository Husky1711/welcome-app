const MOMENTS_KEY = 'welcome.leafu.sharedMoments.v1'
const PREFS_KEY = 'welcome.leafu.prefs.v1'
const SESSION_KEY = 'welcome.leafu.session.v1'
const MAX_MOMENTS = 20
const RETURN_GAP_MS = 6 * 60 * 60 * 1000 // 6 hours

export interface SharedMoment {
  id: string
  text: string
  createdAt: string
}

export interface LeafuPreferences {
  prefersGentleTone: boolean
  notes: string[]
}

interface LeafuSessionMeta {
  lastVisitAt: string
  firstChatRecorded: boolean
}

function readAll(): SharedMoment[] {
  try {
    const raw = localStorage.getItem(MOMENTS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(
        (item): item is SharedMoment =>
          !!item &&
          typeof item === 'object' &&
          typeof (item as SharedMoment).id === 'string' &&
          typeof (item as SharedMoment).text === 'string' &&
          typeof (item as SharedMoment).createdAt === 'string',
      )
      .slice(0, MAX_MOMENTS)
  } catch {
    return []
  }
}

function writeAll(moments: SharedMoment[]): void {
  localStorage.setItem(MOMENTS_KEY, JSON.stringify(moments.slice(0, MAX_MOMENTS)))
}

function readPrefs(): LeafuPreferences {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    if (!raw) return { prefersGentleTone: false, notes: [] }
    const parsed = JSON.parse(raw) as Partial<LeafuPreferences>
    return {
      prefersGentleTone: Boolean(parsed.prefersGentleTone),
      notes: Array.isArray(parsed.notes)
        ? parsed.notes.filter((note): note is string => typeof note === 'string').slice(0, 8)
        : [],
    }
  } catch {
    return { prefersGentleTone: false, notes: [] }
  }
}

function writePrefs(prefs: LeafuPreferences): void {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
}

function readSession(): LeafuSessionMeta {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return { lastVisitAt: '', firstChatRecorded: false }
    const parsed = JSON.parse(raw) as Partial<LeafuSessionMeta>
    return {
      lastVisitAt: typeof parsed.lastVisitAt === 'string' ? parsed.lastVisitAt : '',
      firstChatRecorded: Boolean(parsed.firstChatRecorded),
    }
  } catch {
    return { lastVisitAt: '', firstChatRecorded: false }
  }
}

function writeSession(session: LeafuSessionMeta): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function listSharedMoments(): SharedMoment[] {
  return readAll()
}

export function listSharedMomentTexts(): string[] {
  const moments = readAll().map((moment) => moment.text)
  const prefs = readPrefs()
  const prefLines: string[] = []
  if (prefs.prefersGentleTone) {
    prefLines.push('User prefers a gentle, soft tone.')
  }
  for (const note of prefs.notes) {
    prefLines.push(note)
  }
  return [...prefLines, ...moments].slice(0, MAX_MOMENTS)
}

export function addSharedMoment(text: string): SharedMoment | null {
  const cleaned = text.trim().slice(0, 160)
  if (!cleaned) return null

  const existing = readAll()
  if (existing.some((moment) => moment.text.toLowerCase() === cleaned.toLowerCase())) {
    return null
  }

  const moment: SharedMoment = {
    id: crypto.randomUUID(),
    text: cleaned,
    createdAt: new Date().toISOString(),
  }
  writeAll([moment, ...existing].slice(0, MAX_MOMENTS))
  return moment
}

export function clearSharedMoments(): void {
  localStorage.removeItem(MOMENTS_KEY)
  localStorage.removeItem(PREFS_KEY)
  localStorage.removeItem(SESSION_KEY)
}

export function getLeafuPreferences(): LeafuPreferences {
  return readPrefs()
}

export function setPrefersGentleTone(value: boolean): void {
  const prefs = readPrefs()
  writePrefs({ ...prefs, prefersGentleTone: value })
}

export function addPreferenceNote(note: string): void {
  const cleaned = note.trim().slice(0, 120)
  if (!cleaned) return
  const prefs = readPrefs()
  if (prefs.notes.some((entry) => entry.toLowerCase() === cleaned.toLowerCase())) return
  writePrefs({
    ...prefs,
    notes: [cleaned, ...prefs.notes].slice(0, 8),
  })
}

/** Call when Leafu is enabled — records first-meet + welcome-back moments. */
export function onLeafuSessionStart(): { welcomeBack: boolean } {
  const session = readSession()
  const now = Date.now()
  let welcomeBack = false

  if (!session.firstChatRecorded) {
    addSharedMoment(`First chat with Leafu on ${new Date().toLocaleDateString()}.`)
    writeSession({ lastVisitAt: new Date().toISOString(), firstChatRecorded: true })
    return { welcomeBack: false }
  }

  if (session.lastVisitAt) {
    const gap = now - Date.parse(session.lastVisitAt)
    if (Number.isFinite(gap) && gap >= RETURN_GAP_MS) {
      welcomeBack = true
      addSharedMoment(`Returned after a break on ${new Date().toLocaleDateString()}.`)
    }
  }

  writeSession({
    lastVisitAt: new Date().toISOString(),
    firstChatRecorded: true,
  })
  return { welcomeBack }
}

/** Infer soft preferences from what the user typed. */
export function maybeLearnFromUserMessage(message: string): void {
  if (/\b(tired|overwhelm|gentle|soft|slow|anxious|stressed)\b/i.test(message)) {
    setPrefersGentleTone(true)
  }
  if (/\b(morning|early)\b/i.test(message) && /\b(prefer|like|best)\b/i.test(message)) {
    addPreferenceNote('Prefers morning check-ins.')
  }
  if (/\b(evening|night)\b/i.test(message) && /\b(prefer|like|best)\b/i.test(message)) {
    addPreferenceNote('Prefers evening check-ins.')
  }
}

/** Heuristic: celebrate finishing all habits, or note a newly completed title. */
export function maybeRecordHabitMoment(input: {
  incompleteBefore: string[]
  incompleteAfter: string[]
  habitCount: number
}): SharedMoment | null {
  if (input.habitCount === 0) return null

  const completedNow = input.incompleteBefore.filter(
    (title) => !input.incompleteAfter.includes(title),
  )
  if (completedNow.length > 0 && input.incompleteAfter.length > 0) {
    return addSharedMoment(
      `Completed “${completedNow[0]}” while chatting (${new Date().toLocaleDateString()}).`,
    )
  }

  if (input.incompleteBefore.length === 0) return null
  if (input.incompleteAfter.length > 0) return null
  return addSharedMoment(
    `Finished every tracked habit in one day (${new Date().toLocaleDateString()}).`,
  )
}
