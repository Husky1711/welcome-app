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

test.describe('Phase 1: Today week matrix', () => {
  test('adds a habit, toggles today cell, and shows completion', async ({ page }) => {
    await signIn(page)

    await page.getByRole('link', { name: /Daily Tracker/i }).click()
    await expect(page.getByRole('heading', { name: 'Today' })).toBeVisible()

    await page.getByRole('button', { name: /Meditate 10 min/i }).click()
    await expect(page.getByLabel("This week's habit grid")).toBeVisible()
    await expect(page.getByText(/Each row is a habit/i)).toBeVisible()

    const todayDate = await page.evaluate(() => {
      const date = new Date()
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    })

    await page
      .getByRole('button', { name: new RegExp(`Meditate 10 min, ${todayDate}, not (done|completed)`) })
      .click()
    await expect(
      page.getByRole('button', { name: new RegExp(`Meditate 10 min, ${todayDate}, (done|completed)`) }),
    ).toBeVisible()
  })

  test('persists matrix completion after reload', async ({ page }) => {
    await signIn(page)

    await page.getByRole('link', { name: /Daily Tracker/i }).click()
    await page.getByRole('button', { name: /Workout 45 min/i }).click()

    const todayDate = await page.evaluate(() => {
      const date = new Date()
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    })

    await page
      .getByRole('button', { name: new RegExp(`Workout 45 min, ${todayDate}, not (done|completed)`) })
      .click()
    await page.reload()

    await expect(page.getByRole('heading', { name: 'Today' })).toBeVisible()
    await expect(
      page.getByRole('button', { name: new RegExp(`Workout 45 min, ${todayDate}, (done|completed)`) }),
    ).toBeVisible()
  })

  test('blocks today route when logged out', async ({ page }) => {
    await page.goto('/#/today')
    await expect(page.getByRole('heading', { name: 'Welcome App' })).toBeVisible()
  })
})
