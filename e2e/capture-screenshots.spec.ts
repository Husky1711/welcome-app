import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { test } from '@playwright/test'

const CREDENTIALS = {
  email: 'admin@example.com',
  password: 'password123',
}

const OUTPUT_DIR = join(process.cwd(), 'assets', 'store')

test('capture Play Store screenshots', async ({ page }) => {
  mkdirSync(OUTPUT_DIR, { recursive: true })

  await page.setViewportSize({ width: 412, height: 915 })
  await page.goto('/#/')
  await page.evaluate(() => localStorage.clear())

  await page.screenshot({
    path: join(OUTPUT_DIR, '01-login-screen.png'),
    fullPage: false,
  })

  await page.getByLabel('Email').fill(CREDENTIALS.email)
  await page.getByLabel('Password').fill(CREDENTIALS.password)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await page.waitForURL('**/#/welcome')

  await page.screenshot({
    path: join(OUTPUT_DIR, '02-dashboard.png'),
    fullPage: false,
  })

  await page.getByRole('link', { name: /Notes/i }).click()
  await page.getByRole('button', { name: 'Add new' }).click()
  await page.getByLabel('Title').fill('Grocery list')
  await page.getByLabel('Note content').first().fill('Milk, eggs, bread, and coffee.')
  await page.getByRole('button', { name: 'Done' }).click()
  await page.getByRole('link', { name: 'Back to notes' }).click()

  await page.screenshot({
    path: join(OUTPUT_DIR, '03-notes-screen.png'),
    fullPage: false,
  })

  await page.getByRole('tab', { name: 'Home' }).click()
  await page.getByRole('button', { name: 'Open account menu' }).click()
  await page.getByRole('link', { name: 'Profile' }).click()

  await page.screenshot({
    path: join(OUTPUT_DIR, '04-profile-screen.png'),
    fullPage: false,
  })

  await page.getByRole('tab', { name: 'Home' }).click()
  await page.goto('/#/settings')

  await page.screenshot({
    path: join(OUTPUT_DIR, '05-settings-screen.png'),
    fullPage: false,
  })
})
