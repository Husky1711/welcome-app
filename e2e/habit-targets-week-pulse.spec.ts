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

test.describe('Habit targets & week matrix', () => {
  test('weekly habit shows goal cards and matrix progress on Today', async ({ page }) => {
    await signIn(page)

    await page.goto('/#/habits')
    await expect(page.getByRole('heading', { name: 'Habits' })).toBeVisible()

    await page.getByRole('button', { name: 'Add new habit' }).click()
    await page.getByLabel('Habit name').fill('Study Spanish')
    await page.getByRole('button', { name: 'Select 📖 icon' }).click()
    await page.getByRole('button', { name: 'Weekly' }).click()

    const increase = page.getByRole('button', { name: 'Increase frequency' })
    while (Number(await page.locator('.habit-form__stepper-value').textContent()) < 3) {
      await increase.click()
    }
    await page.getByRole('button', { name: 'Add habit' }).click()
    await expect(
      page.getByRole('button', { name: 'Edit habit Study Spanish' }),
    ).toContainText('Weekly · 3×')

    await page.goto('/#/today')
    await expect(page.getByRole('heading', { name: 'Today' })).toBeVisible()
    await expect(page.getByLabel("This week's habit grid")).toBeVisible()
    await expect(page.getByLabel('Weekly goals')).toBeVisible()
    await expect(page.getByLabel('Weekly goals').getByText('Study Spanish')).toBeVisible()
    await expect(page.getByLabel('Weekly goals').getByText('0/3')).toBeVisible()

    const todayDate = await page.evaluate(() => {
      const date = new Date()
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    })

    await page
      .getByRole('button', { name: new RegExp(`Study Spanish, ${todayDate}, not done`) })
      .click()
    await expect(page.getByLabel('Weekly goals').getByText('1/3')).toBeVisible()
  })

  test('calendar shows insights instead of week pulse', async ({ page }) => {
    await signIn(page)
    await page.goto('/#/habits')
    await page.getByRole('button', { name: 'Add new habit' }).click()
    await page.getByLabel('Habit name').fill('Meditate')
    await page.getByRole('button', { name: 'Add habit' }).click()

    await page.goto('/#/calendar')
    await expect(page.getByRole('heading', { name: 'Insights' }).first()).toBeVisible()
    await expect(page.getByLabel('Insights')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'This week' })).toHaveCount(0)
  })
})
