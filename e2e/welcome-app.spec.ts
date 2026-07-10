import { expect, test } from '@playwright/test'

const CREDENTIALS = {
  email: 'admin@example.com',
  password: 'password123',
}

test.describe('Welcome App E2E', () => {
  test('full user journey: login, notes, profile, settings, logout', async ({ page }) => {
    await page.goto('/#/')

    await expect(page.getByRole('heading', { name: 'Welcome App' })).toBeVisible()
    await page.getByLabel('Email').fill(CREDENTIALS.email)
    await page.getByLabel('Password').fill(CREDENTIALS.password)
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page.getByRole('heading', { name: /Welcome, admin/i })).toBeVisible()
    await expect(page.getByText('You are signed in to your personal space.')).toBeVisible()

    await page.getByRole('link', { name: /My Notes/i }).click()
    await expect(page.getByRole('heading', { name: 'My Notes' })).toBeVisible()

    await page.getByRole('button', { name: 'Add new note' }).click()
    await page.getByLabel('Title').fill('Play Store checklist')
    await page.getByLabel('Content').fill('Upload AAB and complete Play Console forms.')
    await page.getByRole('button', { name: 'Add note' }).click()

    await expect(page.getByRole('heading', { name: 'Play Store checklist' })).toBeVisible()
    await expect(page.getByText('Upload AAB and complete Play Console forms.')).toBeVisible()

    await page.getByRole('link', { name: 'Go back' }).click()
    await page.getByRole('link', { name: /Profile/i }).click()
    await expect(page.getByRole('heading', { name: 'Profile' })).toBeVisible()

    const displayName = page.getByLabel('Display name')
    await displayName.fill('Sai Prasad')
    await page.getByRole('button', { name: 'Save profile' }).click()
    await expect(page.getByText('Profile updated successfully.')).toBeVisible()

    await page.getByRole('link', { name: 'Go back' }).click()
    await expect(page.getByRole('heading', { name: /Welcome, Sai Prasad/i })).toBeVisible()

    await page.getByRole('link', { name: /Settings/i }).click()
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()
    await expect(page.getByText('Version')).toBeVisible()
    await expect(page.getByText('2.0.0')).toBeVisible()

    await page.getByRole('button', { name: /Switch to dark mode/i }).click()
    await expect(page.getByText('Current theme: Dark')).toBeVisible()

    await page.getByRole('link', { name: 'Go back' }).click()
    await page.getByRole('button', { name: 'Log out of your account' }).click()

    await expect(page.getByRole('heading', { name: 'Welcome App' })).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
  })

  test('rejects invalid login credentials', async ({ page }) => {
    await page.goto('/#/')
    await page.getByLabel('Email').fill('wrong@example.com')
    await page.getByLabel('Password').fill('wrongpassword')
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page.getByRole('alert')).toContainText('Invalid email or password')
  })

  test('blocks protected routes when logged out', async ({ page }) => {
    await page.goto('/#/notes')
    await expect(page.getByRole('heading', { name: 'Welcome App' })).toBeVisible()
  })
})
