import { expect, test, type Page } from '@playwright/test'

const EMULATOR_PROJECT = 'demo-welcome-app'
const EMULATOR_AUTH_URL = `http://127.0.0.1:9099/emulator/v1/projects/${EMULATOR_PROJECT}/accounts`

/** Sample prompts to show Leafu tone + habit awareness across moods. */
const CHAT_PATTERNS: Array<{ label: string; message: string }> = [
  { label: 'identity', message: 'Who are you?' },
  { label: 'habit-list', message: 'What habits do I have?' },
  { label: 'today-check', message: 'How am I doing with my habits today?' },
  { label: 'focus', message: 'What should I focus on next?' },
  { label: 'tired', message: "I'm tired and overwhelmed. Be gentle with me." },
  { label: 'celebrate', message: 'I just finished my morning walk!' },
  { label: 'evening', message: 'Give me a gentle evening check-in.' },
]

async function clearFirebaseEmulator() {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    try {
      const response = await fetch(EMULATOR_AUTH_URL, { method: 'DELETE' })
      if (response.ok) return
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 500))
    }
  }
}

function uniqueEmail() {
  return `leafu.patterns.${Date.now()}@example.com`
}

async function signUp(page: Page, email: string, password: string) {
  await page.goto('/#/sign-up')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password', { exact: true }).fill(password)
  await page.getByLabel('Confirm password').fill(password)
  await page.getByRole('button', { name: 'Create account' }).click()
  await expect(page.getByRole('heading', { name: /Welcome,/ })).toBeVisible({
    timeout: 15000,
  })
}

async function seedHabitGarden(page: Page) {
  await page.evaluate(() => {
    const today = new Date().toISOString().slice(0, 10)
    const now = new Date().toISOString()

    const waterId = crypto.randomUUID()
    const walkId = crypto.randomUUID()
    const readId = crypto.randomUUID()
    const meditateId = crypto.randomUUID()

    const habits = [
      {
        id: waterId,
        title: 'Drink water',
        icon: '💧',
        reminderEnabled: false,
        reminderTime: '09:00',
        sortOrder: 0,
        isArchived: false,
        createdAt: now,
      },
      {
        id: walkId,
        title: 'Morning walk',
        icon: '🚶',
        reminderEnabled: false,
        reminderTime: '07:00',
        sortOrder: 1,
        isArchived: false,
        createdAt: now,
      },
      {
        id: readId,
        title: 'Read 10 pages',
        icon: '📖',
        reminderEnabled: false,
        reminderTime: '20:00',
        sortOrder: 2,
        isArchived: false,
        createdAt: now,
      },
      {
        id: meditateId,
        title: 'Meditate',
        icon: '🧘',
        reminderEnabled: false,
        reminderTime: '06:30',
        sortOrder: 3,
        isArchived: false,
        createdAt: now,
      },
    ]

    const targets = habits.map((habit) => ({
      id: crypto.randomUUID(),
      habitId: habit.id,
      period: 'daily' as const,
      targetFrequency: 1,
      startDate: today,
      endDate: null,
    }))

    const logs = [
      {
        id: crypto.randomUUID(),
        habitId: waterId,
        date: today,
        completed: true,
        completedAt: now,
      },
    ]

    localStorage.setItem('welcome_app_habits', JSON.stringify(habits))
    localStorage.setItem('welcome_app_habit_targets', JSON.stringify(targets))
    localStorage.setItem('welcome_app_habit_logs', JSON.stringify(logs))
  })
}

async function enableLeafu(page: Page) {
  await page.goto('/#/companion')
  await expect(page.getByText('Leafu').first()).toBeVisible({ timeout: 10000 })

  const enable = page.getByRole('button', { name: /enable Leafu/i })
  if (await enable.isVisible().catch(() => false)) {
    await enable.click()
    await expect(page.getByText(/Hi — I’m Leafu/i)).toBeVisible()
  }
}

async function sendAndWaitForReply(page: Page, message: string) {
  const before = await page.locator('.coach-bubble--assistant').count()

  await page.getByLabel('Message Leafu').fill(message)
  await page.getByRole('button', { name: 'Send' }).click()

  await expect(page.locator('.coach-bubble--assistant')).toHaveCount(before + 1, {
    timeout: 60000,
  })

  const bubbles = page.locator('.coach-bubble--assistant')
  const last = bubbles.nth(before)
  const emotion = (await last.locator('.companion-emotion').textContent())?.trim() ?? '(none)'
  const text = (await last.locator('p').textContent())?.trim() ?? ''

  return { emotion, text }
}

test.describe('Leafu — multi-pattern chat demo', () => {
  test.beforeEach(async ({ page }) => {
    await clearFirebaseEmulator()
    await page.goto('/#/')
    await page.waitForLoadState('domcontentloaded')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
    await page.waitForLoadState('domcontentloaded')
  })

  test('habits seeded + 7 chat patterns with emotions', async ({ page }) => {
    const email = uniqueEmail()
    const password = 'leafupass123'

    await signUp(page, email, password)
    await seedHabitGarden(page)
    await enableLeafu(page)

    const results: Array<{ label: string; user: string; emotion: string; reply: string }> = []

    for (const pattern of CHAT_PATTERNS) {
      const { emotion, text } = await sendAndWaitForReply(page, pattern.message)
      results.push({
        label: pattern.label,
        user: pattern.message,
        emotion,
        reply: text,
      })
      console.log(`\n--- ${pattern.label} ---`)
      console.log(`You: ${pattern.message}`)
      console.log(`Leafu [${emotion}]: ${text}`)
    }

    expect(results.length).toBe(CHAT_PATTERNS.length)
    expect(results.some((r) => /water|walk|read|meditat|habit/i.test(r.reply))).toBe(true)
    expect(results.every((r) => r.reply.length > 0)).toBe(true)
  })
})
