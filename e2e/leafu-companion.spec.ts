import { expect, test, type Page } from '@playwright/test'

const EMULATOR_PROJECT = 'demo-welcome-app'
const EMULATOR_AUTH_URL = `http://127.0.0.1:9099/emulator/v1/projects/${EMULATOR_PROJECT}/accounts`

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
  return `leafu.tester.${Date.now()}@example.com`
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

test.describe('Leafu companion — emulator user test', () => {
  test.beforeEach(async ({ page }) => {
    await clearFirebaseEmulator()
    await page.goto('/#/')
    await page.waitForLoadState('domcontentloaded')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
    await page.waitForLoadState('domcontentloaded')
  })

  test('consent, chat with habit context, receive Leafu reply', async ({ page }) => {
    const email = uniqueEmail()
    const password = 'leafupass123'

    await signUp(page, email, password)

    await page.evaluate(() => {
      const key = 'welcome_app_habits'
      const id = crypto.randomUUID()
      const today = new Date().toISOString().slice(0, 10)
      localStorage.setItem(
        key,
        JSON.stringify([
          {
            id,
            title: 'Drink water',
            icon: '💧',
            reminderEnabled: false,
            reminderTime: '09:00',
            sortOrder: 0,
            isArchived: false,
            createdAt: new Date().toISOString(),
          },
        ]),
      )
      localStorage.setItem(
        'welcome_app_habit_targets',
        JSON.stringify([
          {
            id: crypto.randomUUID(),
            habitId: id,
            period: 'daily',
            targetFrequency: 1,
            startDate: today,
            endDate: null,
          },
        ]),
      )
    })

    await page.goto('/#/companion')
    await expect(page.getByText('Leafu').first()).toBeVisible({ timeout: 10000 })

    const enable = page.getByRole('button', { name: /enable Leafu/i })
    await expect(enable).toBeVisible({ timeout: 10000 })
    await enable.click()

    await expect(page.getByText(/Hi — I’m Leafu/i)).toBeVisible()

    await page.getByLabel('Message Leafu').fill('How am I doing with my habits today?')
    await page.getByRole('button', { name: 'Send' }).click()

    // Greeting is already one assistant bubble; wait for the model reply.
    await expect(page.locator('.coach-bubble--assistant')).toHaveCount(2, { timeout: 60000 })

    const thread = await page.locator('.coach-thread').innerText()
    expect(thread).toMatch(/water|Drink water|incomplete|focus|habit/i)
    expect(thread.toLowerCase()).not.toContain('could not reach')

    await expect(page.locator('.companion-emotion').nth(1)).toBeVisible({ timeout: 10000 })
  })
})
