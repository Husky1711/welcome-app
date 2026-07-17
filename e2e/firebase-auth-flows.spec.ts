import { expect, test } from '@playwright/test'

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
  return `firebase.tester.${Date.now()}@example.com`
}

async function expectSignedIn(
  page: import('@playwright/test').Page,
  email: string,
) {
  await expect(page.getByRole('heading', { name: /Welcome,/ })).toBeVisible({
    timeout: 15000,
  })
  await page.getByRole('button', { name: 'Open account menu' }).click()
  await expect(page.getByText(email)).toBeVisible()
  await page.getByRole('button', { name: 'Dismiss' }).click()
}

test.describe('Firebase auth flows — emulator', () => {
  test.beforeEach(async ({ page }) => {
    await clearFirebaseEmulator()
    await page.goto('/#/')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
  })

  test('sign-up creates a Firebase account and lands on dashboard', async ({ page }) => {
    const email = uniqueEmail()
    const password = 'firebasepass123'

    await page.goto('/#/sign-up')
    await expect(page.getByRole('heading', { name: 'Create account' })).toBeVisible()

    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Password', { exact: true }).fill(password)
    await page.getByLabel('Confirm password').fill(password)
    await page.getByRole('button', { name: 'Create account' }).click()

    await expectSignedIn(page, email)
  })

  test('sign-in works with an existing Firebase account', async ({ page }) => {
    const email = uniqueEmail()
    const password = 'firebasepass123'

    await page.goto('/#/sign-up')
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Password', { exact: true }).fill(password)
    await page.getByLabel('Confirm password').fill(password)
    await page.getByRole('button', { name: 'Create account' }).click()
    await expectSignedIn(page, email)

    await page.goto('/#/settings')
    await page.getByRole('button', { name: 'Log out of your account' }).click()
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()

    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Password').fill(password)
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expectSignedIn(page, email)
  })

  test('wrong password shows Firebase error on sign-in', async ({ page }) => {
    const email = uniqueEmail()
    const password = 'firebasepass123'

    await page.goto('/#/sign-up')
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Password', { exact: true }).fill(password)
    await page.getByLabel('Confirm password').fill(password)
    await page.getByRole('button', { name: 'Create account' }).click()
    await expectSignedIn(page, email)

    await page.goto('/#/settings')
    await page.getByRole('button', { name: 'Log out of your account' }).click()

    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Password').fill('wrongpassword999')
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page.getByRole('alert')).toContainText('Invalid email or password', {
      timeout: 10000,
    })
  })

  test('duplicate sign-up shows email already exists error', async ({ page }) => {
    const email = uniqueEmail()
    const password = 'firebasepass123'

    await page.goto('/#/sign-up')
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Password', { exact: true }).fill(password)
    await page.getByLabel('Confirm password').fill(password)
    await page.getByRole('button', { name: 'Create account' }).click()
    await expectSignedIn(page, email)

    await page.goto('/#/settings')
    await page.getByRole('button', { name: 'Log out of your account' }).click()
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible({ timeout: 10000 })

    await page.getByRole('link', { name: 'Create account' }).click()
    await expect(page.getByRole('heading', { name: 'Create account' })).toBeVisible()
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Password', { exact: true }).fill(password)
    await page.getByLabel('Confirm password').fill(password)
    await page.getByRole('button', { name: 'Create account' }).click()

    await expect(page.getByRole('alert')).toContainText('already exists', { timeout: 10000 })
  })

  test('forgot password shows success message via Firebase emulator', async ({ page }) => {
    const email = uniqueEmail()
    const password = 'firebasepass123'

    await page.goto('/#/sign-up')
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Password', { exact: true }).fill(password)
    await page.getByLabel('Confirm password').fill(password)
    await page.getByRole('button', { name: 'Create account' }).click()
    await expectSignedIn(page, email)

    await page.goto('/#/settings')
    await page.getByRole('button', { name: 'Log out of your account' }).click()
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible({ timeout: 10000 })

    await page.getByRole('link', { name: 'Forgot password?' }).click()
    await expect(page.getByRole('heading', { name: 'Reset password' })).toBeVisible()
    await page.getByLabel('Email').fill(email)
    await page.getByRole('button', { name: 'Send reset link' }).click()

    await expect(page.getByRole('status')).toContainText('reset instructions', { timeout: 10000 })
  })
})
