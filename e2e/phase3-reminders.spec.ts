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

test.describe('Phase 3: Habit reminders', () => {
  test('saves per-habit reminder settings from the habits form', async ({ page }) => {
    await signIn(page)
    await page.goto('/#/habits')

    await page.getByRole('button', { name: 'Add new habit' }).click()
    await page.getByLabel('Habit name').fill('Morning stretch')
    await page.locator('label.habit-form__toggle').click()
    await page.getByLabel('Reminder time').fill('07:30')
    await page.getByRole('button', { name: 'Add habit' }).click()

    await expect(page.locator('.habit-card__reminder')).toBeVisible()
    await expect(page.getByText('Morning stretch')).toBeVisible()

    await page.getByRole('button', { name: 'Edit habit Morning stretch' }).click()
    await expect(page.getByRole('switch', { name: 'Daily reminder' })).toBeChecked()
    await expect(page.getByLabel('Reminder time')).toHaveValue('07:30')

    await page.locator('label.habit-form__toggle').click()
    await page.getByRole('button', { name: 'Save changes' }).click()

    await expect(page.locator('.habit-card__reminder')).toHaveCount(0)
  })

  test('persists reminder settings after reload', async ({ page }) => {
    await signIn(page)
    await page.goto('/#/habits')

    await page.getByRole('button', { name: 'Add new habit' }).click()
    await page.getByLabel('Habit name').fill('Drink water')
    await page.locator('label.habit-form__toggle').click()
    await page.getByLabel('Reminder time').fill('09:15')
    await page.getByRole('button', { name: 'Add habit' }).click()

    await page.reload()

    await expect(page.locator('.habit-card__reminder')).toBeVisible()
    await page.getByRole('button', { name: 'Edit habit Drink water' }).click()
    await expect(page.getByRole('switch', { name: 'Daily reminder' })).toBeChecked()
    await expect(page.getByLabel('Reminder time')).toHaveValue('09:15')
  })
})
