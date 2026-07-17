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

test.describe('Recent features — account, settings, and sharing', () => {
  test('account sheet changes theme and opens Settings', async ({ page }) => {
    await signIn(page)

    await page.getByRole('button', { name: 'Open account menu' }).click()
    await page.getByRole('button', { name: 'Dark mode' }).click()
    await expect(page.locator('html')).toHaveClass(/dark/)

    await page.getByRole('link', { name: 'Settings' }).click()
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()
  })

  test('Settings exposes Rate app, Give feedback, and About', async ({ page }) => {
    await signIn(page)
    await page.goto('/#/settings')

    await expect(page.getByRole('link', { name: 'Rate app' })).toHaveAttribute(
      'href',
      /play\.google\.com\/store\/apps\/details/,
    )
    await expect(page.getByRole('link', { name: 'Give feedback' })).toHaveAttribute(
      'href',
      /^mailto:/,
    )

    await page.getByRole('button', { name: 'About' }).click()
    const about = page.getByRole('alertdialog', { name: 'About Welcome App' })
    await expect(about).toBeVisible()
    await expect(about).toContainText('Version 2.0.0')
  })

  test('completed habit exports a branded streak PNG', async ({ page }) => {
    await signIn(page)
    await page.getByRole('link', { name: /Daily Tracker/i }).click()
    await page.getByRole('button', { name: /Meditate 10 min/i }).click()

    await page.getByRole('tab', { name: 'Habits' }).click()
    await page.getByRole('button', { name: 'Edit habit Meditate 10 min' }).click()
    await page.getByRole('button', { name: 'Share streak for Meditate 10 min' }).click()
    await expect(
      page.getByText('Complete this habit at least once to unlock a shareable card.'),
    ).toBeVisible()
    await page.getByRole('dialog', { name: 'Share streak' }).getByRole('button', {
      name: 'Close',
    }).click()

    await page.getByRole('tab', { name: 'Today' }).click()

    const todayDate = await page.evaluate(() => {
      const date = new Date()
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    })

    await page
      .getByRole('button', {
        name: new RegExp(`Meditate 10 min, ${todayDate}, not (done|completed)`),
      })
      .click()

    await page.getByRole('tab', { name: 'Habits' }).click()
    await page.getByRole('button', { name: 'Edit habit Meditate 10 min' }).click()
    await page.getByRole('button', { name: 'Share streak for Meditate 10 min' }).click()

    const shareDialog = page.getByRole('dialog', { name: 'Share streak' })
    await expect(shareDialog).toBeVisible()
    await expect(shareDialog.getByTestId('habit-share-card')).toContainText('1-day streak')
    await expect(shareDialog.getByTestId('habit-share-card')).toContainText('Welcome')

    const downloadPromise = page.waitForEvent('download')
    await shareDialog.getByRole('button', { name: 'Share', exact: true }).click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(/^welcome-streak-\d+\.png$/)
  })
})
