import { expect, test } from '@playwright/test'

function uniqueEmail() {
  return `welcome.prod.${Date.now()}@example.com`
}

test.describe('Firebase auth flows — production', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
  })

  test('sign-up creates account on live Firebase', async ({ page }) => {
    const email = uniqueEmail()
    const password = 'WelcomeTest123'

    await page.goto('/#/sign-up')
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Password', { exact: true }).fill(password)
    await page.getByLabel('Confirm password').fill(password)
    await page.getByRole('button', { name: 'Create account' }).click()

    await expect(page.getByText('You are signed in to your personal space.')).toBeVisible({
      timeout: 20000,
    })
    await expect(page.getByText(email)).toBeVisible()
  })

  test('sign-in works after sign-up', async ({ page }) => {
    const email = uniqueEmail()
    const password = 'WelcomeTest123'

    await page.goto('/#/sign-up')
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Password', { exact: true }).fill(password)
    await page.getByLabel('Confirm password').fill(password)
    await page.getByRole('button', { name: 'Create account' }).click()
    await expect(page.getByText(email)).toBeVisible({ timeout: 20000 })

    await page.goto('/#/settings')
    await page.getByRole('button', { name: 'Log out of your account' }).click()
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible({ timeout: 10000 })

    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Password').fill(password)
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page.getByText('You are signed in to your personal space.')).toBeVisible({
      timeout: 20000,
    })
  })

  test('wrong password shows error', async ({ page }) => {
    const email = uniqueEmail()
    const password = 'WelcomeTest123'

    await page.goto('/#/sign-up')
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Password', { exact: true }).fill(password)
    await page.getByLabel('Confirm password').fill(password)
    await page.getByRole('button', { name: 'Create account' }).click()
    await expect(page.getByText(email)).toBeVisible({ timeout: 20000 })

    await page.goto('/#/settings')
    await page.getByRole('button', { name: 'Log out of your account' }).click()

    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Password').fill('WrongPassword999')
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page.getByRole('alert')).toContainText('Invalid email or password', {
      timeout: 10000,
    })
  })

  test('forgot password sends reset email', async ({ page }) => {
    const email = uniqueEmail()
    const password = 'WelcomeTest123'

    await page.goto('/#/sign-up')
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Password', { exact: true }).fill(password)
    await page.getByLabel('Confirm password').fill(password)
    await page.getByRole('button', { name: 'Create account' }).click()
    await expect(page.getByText(email)).toBeVisible({ timeout: 20000 })

    await page.goto('/#/settings')
    await page.getByRole('button', { name: 'Log out of your account' }).click()
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()

    await page.getByRole('link', { name: 'Forgot password?' }).click()
    await page.getByLabel('Email').fill(email)
    await page.getByRole('button', { name: 'Send reset link' }).click()

    await expect(page.getByRole('status')).toContainText('reset instructions', { timeout: 15000 })
  })
})
