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

test.describe('Phase 4: Bottom nav & dashboard widget', () => {
  test('shows bottom nav on main tabs and on settings', async ({ page }) => {
    await signIn(page)

    const bottomNav = page.getByRole('navigation', { name: 'Main navigation' })
    await expect(bottomNav).toBeVisible()
    await expect(bottomNav.getByRole('tab', { name: 'Home' })).toHaveAttribute('aria-selected', 'true')

    await bottomNav.getByRole('tab', { name: 'Today' }).click()
    await expect(page.getByRole('heading', { name: 'Today' })).toBeVisible()
    await expect(bottomNav.getByRole('tab', { name: 'Today' })).toHaveAttribute('aria-selected', 'true')

    await bottomNav.getByRole('tab', { name: 'Calendar' }).click()
    await expect(page.getByRole('heading', { name: 'Calendar' })).toBeVisible()

    await bottomNav.getByRole('tab', { name: 'Habits' }).click()
    await expect(page.getByRole('heading', { name: 'Habits' })).toBeVisible()

    await bottomNav.getByRole('tab', { name: 'Home' }).click()
    await page.getByRole('link', { name: /Settings/i }).click()
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()
    await expect(bottomNav).toBeVisible()
  })

  test('dashboard widget shows today progress after adding a habit', async ({ page }) => {
    await signIn(page)

    await page.getByRole('link', { name: /Daily Tracker/i }).click()
    await page.getByRole('button', { name: /Meditate 10 min/i }).click()
    await page.getByRole('button', { name: /Meditate 10 min, not completed/i }).click()

    await page.getByRole('tab', { name: 'Home' }).click()
    await expect(page.getByRole('heading', { name: /Welcome, admin/i })).toBeVisible()
    await expect(page.getByLabel(/Daily Tracker — All habits done today/i)).toBeVisible()
    await expect(page.getByRole('img', { name: /1 of 1 habits completed/i })).toBeVisible()
  })

  test('settings shows version 2.0.0', async ({ page }) => {
    await signIn(page)

    await page.getByRole('link', { name: /Settings/i }).click()
    await expect(
      page.locator('.settings-panel__row', { hasText: 'Version' }).locator('.settings-panel__aside'),
    ).toHaveText('2.0.0')
  })
})
