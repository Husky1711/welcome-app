import { expect, test } from '@playwright/test'

const CREDENTIALS = {
  email: 'admin@example.com',
  password: 'password123',
}

async function signIn(page: import('@playwright/test').Page) {
  await page.goto('/#/')
  await page.getByLabel('Email').fill(CREDENTIALS.email)
  await page.getByLabel('Password').fill(CREDENTIALS.password)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.getByRole('heading', { name: /Welcome, admin/i })).toBeVisible()
}

test.describe('Phase 1: Daily Tracker Today', () => {
  test('adds a habit, toggles completion, and updates progress', async ({ page }) => {
    await signIn(page)

    await page.getByRole('link', { name: /Daily Tracker/i }).click()
    await expect(page.getByRole('heading', { name: 'Today' })).toBeVisible()

    await page.getByRole('button', { name: /Meditate 10 min/i }).click()
    await expect(page.getByRole('img', { name: /0 of 1 habits completed/i })).toBeVisible()

    await page.getByRole('button', { name: /Meditate 10 min, not completed/i }).click()
    await expect(page.getByRole('img', { name: /1 of 1 habits completed, 100 percent/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Meditate 10 min, completed/i })).toBeVisible()
  })

  test('persists habits after reload', async ({ page }) => {
    await signIn(page)

    await page.getByRole('link', { name: /Daily Tracker/i }).click()
    await page.getByRole('button', { name: /Workout 45 min/i }).click()
    await page.getByRole('button', { name: /Workout 45 min, not completed/i }).click()

    await page.reload()

    await expect(page.getByRole('heading', { name: 'Today' })).toBeVisible()
    await expect(page.getByRole('button', { name: /Workout 45 min, completed/i })).toBeVisible()
  })

  test('blocks today route when logged out', async ({ page }) => {
    await page.goto('/#/today')
    await expect(page.getByRole('heading', { name: 'Welcome App' })).toBeVisible()
  })
})
