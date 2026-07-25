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
    await expect(page.getByRole('button', { name: 'Open account menu' })).toBeVisible()

    await page.getByRole('link', { name: /Notes/i }).click()
    await expect(page.getByRole('heading', { name: 'My Notes' })).toBeVisible()

    await page.getByRole('button', { name: 'Add new' }).click()
    await page.getByLabel('Title').fill('Play Store checklist')
    await page.getByLabel('Note content').first().fill('Upload AAB and complete Play Console forms.')
    await page.getByRole('button', { name: 'Done' }).click()
    await page.getByRole('link', { name: 'Back to notes' }).click()

    await expect(page.getByRole('heading', { name: 'Play Store checklist' })).toBeVisible()
    await expect(page.getByText('Upload AAB and complete Play Console forms.')).toBeVisible()

    await page.getByRole('tab', { name: 'Home' }).click()
    await page.getByRole('button', { name: 'Open account menu' }).click()
    await page.getByRole('link', { name: 'Profile' }).click()
    await expect(page.getByRole('heading', { name: 'Profile' })).toBeVisible()

    const displayName = page.getByLabel('What should we call you?')
    await displayName.fill('Sai Prasad')
    await page.getByRole('button', { name: 'Save profile' }).click()
    await expect(page.getByText('Profile updated successfully.')).toBeVisible()

    await page.getByRole('tab', { name: 'Home' }).click()
    await expect(page.getByRole('heading', { name: /Welcome, Sai Prasad/i })).toBeVisible()

    await page.goto('/#/settings')
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()
    await expect(page.getByText('About')).toBeVisible()
    await expect(
      page.locator('.settings-panel__row', { hasText: 'About' }).locator('.settings-panel__aside'),
    ).toHaveText('2.0.0')

    await page.locator('label.settings-toggle').click()
    await expect(page.getByText('Dark mode')).toBeVisible()

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
