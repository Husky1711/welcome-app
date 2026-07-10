import { expect, test } from '@playwright/test'

const CREDENTIALS = {
  email: 'admin@example.com',
  password: 'password123',
}

async function signIn(page: import('@playwright/test').Page) {
  await page.goto('/#/')
  await page.evaluate(() => localStorage.clear())
  await page.getByLabel('Email').fill(CREDENTIALS.email)
  await page.getByLabel('Password').fill(CREDENTIALS.password)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.getByRole('heading', { name: /Welcome, admin/i })).toBeVisible()
}

async function openTrackerTab(
  page: import('@playwright/test').Page,
  tab: 'Today' | 'Calendar' | 'Habits',
) {
  const routes = {
    Today: '/#/today',
    Calendar: '/#/calendar',
    Habits: '/#/habits',
  } as const

  await page.goto(routes[tab])
  await expect(page.getByRole('heading', { name: tab })).toBeVisible()
}

test.describe('Phase 2: Habits CRUD & Calendar', () => {
  test('creates, edits, and archives a habit', async ({ page }) => {
    await signIn(page)
    await openTrackerTab(page, 'Habits')

    await page.getByRole('button', { name: 'Add new habit' }).click()
    await page.getByLabel('Habit name').fill('Drink water')
    await page.getByRole('button', { name: 'Select 💧 icon' }).click()
    await page.getByRole('button', { name: 'Add habit' }).click()

    await expect(page.getByText('Drink water')).toBeVisible()

    await page.getByRole('button', { name: 'Edit habit Drink water' }).click()
    await page.getByLabel('Habit name').fill('Drink 8 glasses')
    await page.getByRole('button', { name: 'Save changes' }).click()

    await expect(page.getByText('Drink 8 glasses')).toBeVisible()

    await page.getByRole('button', { name: 'Archive habit Drink 8 glasses' }).click()
    const dialog = page.getByRole('alertdialog', { name: 'Archive habit?' })
    await expect(dialog).toBeVisible()
    await dialog.getByRole('button', { name: 'Archive' }).click()

    await expect(page.getByText('Drink 8 glasses')).toBeVisible()
    await expect(page.getByLabel('Active habits')).toContainText('No active habits yet')
  })

  test('calendar day sheet toggles habits and shows completion dot', async ({ page }) => {
    await signIn(page)
    await openTrackerTab(page, 'Habits')

    await page.getByRole('button', { name: 'Add new habit' }).click()
    await page.getByLabel('Habit name').fill('Evening walk')
    await page.getByRole('button', { name: 'Add habit' }).click()

    await openTrackerTab(page, 'Calendar')

    const todayDate = await page.evaluate(() => {
      const date = new Date()
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    })

    await page.getByRole('button', { name: new RegExp(`${todayDate},`) }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByRole('button', { name: /Evening walk, not completed/i }).click()
    await page.getByRole('button', { name: 'Close day details' }).click()

    await expect(
      page.getByRole('button', { name: new RegExp(`${todayDate}, full completion`) }),
    ).toBeVisible()
  })

  test('blocks editing habits older than 7 days', async ({ page }) => {
    await signIn(page)
    await openTrackerTab(page, 'Habits')

    await page.getByRole('button', { name: 'Add new habit' }).click()
    await page.getByLabel('Habit name').fill('Old day habit')
    await page.getByRole('button', { name: 'Add habit' }).click()

    const oldDate = await page.evaluate(() => {
      const date = new Date()
      date.setDate(date.getDate() - 8)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    })

    await openTrackerTab(page, 'Calendar')
    await page.getByRole('button', { name: `${oldDate},` }).click()

    await expect(page.getByText('Read-only — only the last 7 days can be edited.')).toBeVisible()
    await expect(page.getByRole('button', { name: /Old day habit/i })).toHaveCount(0)
  })

  test('blocks habits and calendar routes when logged out', async ({ page }) => {
    await page.goto('/#/habits')
    await expect(page.getByRole('heading', { name: 'Welcome App' })).toBeVisible()

    await page.goto('/#/calendar')
    await expect(page.getByRole('heading', { name: 'Welcome App' })).toBeVisible()
  })
})
