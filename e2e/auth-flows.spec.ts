import { expect, test } from '@playwright/test'

const ADMIN = {
  email: 'admin@example.com',
  password: 'password123',
}

test.describe('Auth flows — user testing', () => {
  test('sign-in page shows links and logs in with mock credentials', async ({ page }) => {
    await page.goto('/#/')

    await expect(page.getByRole('heading', { name: 'Welcome App' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Forgot password?' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Create account' })).toBeVisible()

    await page.getByLabel('Email').fill(ADMIN.email)
    await page.getByLabel('Password').fill(ADMIN.password)
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page.getByText('You are signed in to your personal space.')).toBeVisible()
    await expect(page.getByText(ADMIN.email)).toBeVisible()
  })

  test('sign-up creates a new account and lands on dashboard', async ({ page }) => {
    const uniqueEmail = `tester.${Date.now()}@example.com`
    const password = 'testpass123'

    await page.goto('/#/sign-up')

    await expect(page.getByRole('heading', { name: 'Create account' })).toBeVisible()
    await page.getByLabel('Email').fill(uniqueEmail)
    await page.getByLabel('Password', { exact: true }).fill(password)
    await page.getByLabel('Confirm password').fill(password)
    await page.getByRole('button', { name: 'Create account' }).click()

    await expect(page.getByText('You are signed in to your personal space.')).toBeVisible()
    await expect(page.getByText(uniqueEmail)).toBeVisible()
  })

  test('sign-up shows error when passwords do not match', async ({ page }) => {
    await page.goto('/#/sign-up')

    await page.getByLabel('Email').fill('mismatch@example.com')
    await page.getByLabel('Password', { exact: true }).fill('password123')
    await page.getByLabel('Confirm password').fill('different123')
    await expect(page.getByText('Passwords do not match')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Create account' })).toBeDisabled()
  })

  test('forgot password sends reset confirmation (mock)', async ({ page }) => {
    await page.goto('/#/forgot-password')

    await expect(page.getByRole('heading', { name: 'Reset password' })).toBeVisible()
    await page.getByLabel('Email').fill(ADMIN.email)
    await page.getByRole('button', { name: 'Send reset link' }).click()

    await expect(page.getByRole('status')).toContainText('reset instructions')
    await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible()
  })

  test('navigation between auth screens works', async ({ page }) => {
    await page.goto('/#/')
    await page.getByRole('link', { name: 'Create account' }).click()
    await expect(page).toHaveURL(/#\/sign-up/)

    await page.getByRole('link', { name: 'Sign in' }).click()
    await expect(page).toHaveURL(/#\/$/)

    await page.getByRole('link', { name: 'Forgot password?' }).click()
    await expect(page).toHaveURL(/#\/forgot-password/)

    await page.getByRole('link', { name: 'Sign in' }).click()
    await expect(page).toHaveURL(/#\/$/)
  })

  test('legacy OTP routes redirect to simplified auth pages', async ({ page }) => {
    await page.goto('/#/sign-up/verify')
    await expect(page).toHaveURL(/#\/sign-up/)
    await expect(page.getByRole('heading', { name: 'Create account' })).toBeVisible()

    await page.goto('/#/forgot-password/reset')
    await expect(page).toHaveURL(/#\/forgot-password/)
    await expect(page.getByRole('heading', { name: 'Reset password' })).toBeVisible()
  })

  test('wrong password shows error on sign-in', async ({ page }) => {
    await page.goto('/#/')
    await page.getByLabel('Email').fill(ADMIN.email)
    await page.getByLabel('Password').fill('wrongpassword')
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page.getByRole('alert')).toContainText('Invalid email or password')
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
  })
})
