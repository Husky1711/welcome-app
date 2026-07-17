import { expect, test } from '@playwright/test'

const CREDENTIALS = {
  email: 'admin@example.com',
  password: 'password123',
}

async function signIn(page: import('@playwright/test').Page) {
  await page.goto('/#/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await page.getByLabel('Email').fill(CREDENTIALS.email)
  await page.getByLabel('Password').fill(CREDENTIALS.password)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.getByRole('heading', { name: /Welcome, admin/i })).toBeVisible()
}

async function openTrackerTab(
  page: import('@playwright/test').Page,
  tab: 'Today' | 'Insights' | 'Habits',
) {
  const routes = {
    Today: '/#/today',
    Insights: '/#/calendar',
    Habits: '/#/habits',
  } as const

  await page.goto(routes[tab])
  await expect(page.getByRole('heading', { name: tab }).first()).toBeVisible()
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

    await page.getByRole('button', { name: 'Edit habit Drink 8 glasses' }).click()
    await page.getByRole('button', { name: 'Archive habit Drink 8 glasses' }).click()
    const dialog = page.getByRole('alertdialog', { name: 'Archive habit?' })
    await expect(dialog).toBeVisible()
    await dialog.getByRole('button', { name: 'Archive' }).click()

    await expect(page.getByText('Drink 8 glasses')).toBeVisible()
    await expect(page.getByLabel('Active habits')).toContainText('No active habits yet')
  })

  test('insights stats shows after logging on Today', async ({ page }) => {
    await signIn(page)
    await openTrackerTab(page, 'Habits')

    await page.getByRole('button', { name: 'Add new habit' }).click()
    await page.getByLabel('Habit name').fill('Evening walk')
    await page.getByRole('button', { name: 'Add habit' }).click()

    await openTrackerTab(page, 'Today')
    const todayDate = await page.evaluate(() => {
      const date = new Date()
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    })
    await page
      .getByRole('button', { name: new RegExp(`Evening walk, ${todayDate}, not done`) })
      .click()

    await openTrackerTab(page, 'Insights')
    const insights = page.getByLabel('Insights')
    await expect(insights).toBeVisible()
    await expect(insights.getByText('Overall performance')).toBeVisible()
    await expect(insights.getByText('Completions')).toBeVisible()
    await expect(insights.getByText('Active habits')).toBeVisible()
    await expect(insights.getByText('Consistency map')).toBeVisible()
    await expect(insights.getByText('Your habits')).toBeVisible()
    await expect(insights.getByText('Evening walk')).toBeVisible()
    await expect(insights.getByRole('button', { name: 'This week' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  test('insights time period chips switch range', async ({ page }) => {
    await signIn(page)
    await openTrackerTab(page, 'Habits')
    await page.getByRole('button', { name: 'Add new habit' }).click()
    await page.getByLabel('Habit name').fill('Read')
    await page.getByRole('button', { name: 'Add habit' }).click()

    await openTrackerTab(page, 'Insights')
    const insights = page.getByLabel('Insights')
    await expect(insights).toBeVisible()
    await expect(insights.getByLabel('Consistency map')).toBeVisible()
    await insights.getByRole('button', { name: 'Last week' }).click()
    await expect(insights.getByRole('button', { name: 'Last week' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await expect(insights.getByText('Summary for last week')).toBeVisible()
    await insights.getByRole('button', { name: 'Last month' }).click()
    await expect(insights.getByRole('button', { name: 'Last month' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await expect(insights.getByText('Read')).toBeVisible()
  })

  test('blocks habits and calendar routes when logged out', async ({ page }) => {
    await page.goto('/#/habits')
    await expect(page.getByRole('heading', { name: 'Welcome App' })).toBeVisible()

    await page.goto('/#/calendar')
    await expect(page.getByRole('heading', { name: 'Welcome App' })).toBeVisible()
  })
})
