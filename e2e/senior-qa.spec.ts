import { expect, test, type Page } from '@playwright/test'

const CREDENTIALS = {
  email: 'admin@example.com',
  password: 'password123',
}

async function login(page: Page) {
  await page.goto('/#/')
  await page.getByLabel('Email').fill(CREDENTIALS.email)
  await page.getByLabel('Password').fill(CREDENTIALS.password)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.getByRole('heading', { name: /Welcome,/i })).toBeVisible()
}

async function clearAppStorage(page: Page) {
  await page.goto('/#/')
  await page.evaluate(() => localStorage.clear())
}

test.describe('Senior QA — Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await clearAppStorage(page)
  })

  test('login form validation: empty submit shows field errors', async ({ page }) => {
    await page.goto('/#/')
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page.getByText('Email is required')).toBeVisible()
    await expect(page.getByText('Password is required')).toBeVisible()
  })

  test('login form validation: invalid email format', async ({ page }) => {
    await page.goto('/#/')
    await page.getByLabel('Email').fill('not-an-email')
    await page.getByLabel('Password').fill('password123')
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page.getByText('Enter a valid email address')).toBeVisible()
  })

  test('login form validation: wrong password stays on login', async ({ page }) => {
    await page.goto('/#/')
    await page.getByLabel('Email').fill(CREDENTIALS.email)
    await page.getByLabel('Password').fill('wrongpass')
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page.getByRole('alert')).toContainText('Invalid email or password')
    await expect(page).toHaveURL(/\/#\/?$/)
  })

  test('password show/hide toggle works', async ({ page }) => {
    await page.goto('/#/')
    const password = page.getByLabel('Password')

    await password.fill('password123')
    await expect(password).toHaveAttribute('type', 'password')

    await page.getByRole('button', { name: 'Show characters' }).click()
    await expect(password).toHaveAttribute('type', 'text')

    await page.getByRole('button', { name: 'Hide characters' }).click()
    await expect(password).toHaveAttribute('type', 'password')
  })

  test('session persists after page reload', async ({ page }) => {
    await login(page)
    await page.reload()

    await expect(page.getByRole('heading', { name: /Welcome,/i })).toBeVisible()
    await expect(page.getByText(CREDENTIALS.email)).toBeVisible()
  })

  test('all protected routes redirect to login when logged out', async ({ page }) => {
    const protectedRoutes = ['/#/welcome', '/#/today', '/#/notes', '/#/profile', '/#/settings']

    for (const route of protectedRoutes) {
      await page.goto(route)
      await expect(page.getByRole('heading', { name: 'Welcome App' })).toBeVisible()
    }
  })
})

test.describe('Senior QA — Dashboard & Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await clearAppStorage(page)
    await login(page)
  })

  test('dashboard shows all feature cards with correct counts', async ({ page }) => {
    await expect(page.getByRole('link', { name: /My Notes/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Profile/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Settings/i })).toBeVisible()
    await expect(page.getByText(/0 private notes/i)).toBeVisible()
  })

  test('back navigation returns to dashboard from each section', async ({ page }) => {
    const sections = [
      { link: /My Notes/i, heading: 'My Notes' },
      { link: /Profile/i, heading: 'Profile' },
      { link: /Settings/i, heading: 'Settings' },
    ]

    for (const section of sections) {
      await page.getByRole('link', { name: section.link }).click()
      await expect(page.getByRole('heading', { name: section.heading })).toBeVisible()
      await page.getByRole('link', { name: 'Go back' }).click()
      await expect(page.getByRole('heading', { name: /Welcome,/i })).toBeVisible()
    }
  })

  test('direct URL navigation works when authenticated', async ({ page }) => {
    await page.goto('/#/notes')
    await expect(page.getByRole('heading', { name: 'My Notes' })).toBeVisible()

    await page.goto('/#/profile')
    await expect(page.getByRole('heading', { name: 'Profile' })).toBeVisible()

    await page.goto('/#/settings')
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()
  })
})

test.describe('Senior QA — Notes CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await clearAppStorage(page)
    await login(page)
    await page.getByRole('link', { name: /My Notes/i }).click()
  })

  test('empty note form shows validation errors', async ({ page }) => {
    await page.getByRole('button', { name: 'Add new note' }).click()
    await page.getByRole('button', { name: 'Add note' }).click()

    await expect(page.getByText('Please enter a title for your note.')).toBeVisible()
  })

  test('cancel note creation returns to list view', async ({ page }) => {
    await page.getByRole('button', { name: 'Add new note' }).click()
    await page.getByRole('button', { name: 'Cancel' }).click()

    await expect(page.getByRole('button', { name: 'Add new note' })).toBeVisible()
    await expect(page.getByText('No notes yet')).toBeVisible()
  })

  test('create, edit, delete note lifecycle', async ({ page }) => {
    await page.getByRole('button', { name: 'Add new note' }).click()
    await page.getByLabel('Title').fill('Bug report')
    await page.getByLabel('Content').fill('Found during QA testing.')
    await page.getByRole('button', { name: 'Add note' }).click()

    await expect(page.getByRole('heading', { name: 'Bug report' })).toBeVisible()

    await page.getByRole('button', { name: 'Edit note Bug report' }).click()
    await page.getByLabel('Title').fill('Bug report — fixed')
    await page.getByRole('button', { name: 'Save changes' }).click()

    await expect(page.getByRole('heading', { name: 'Bug report — fixed' })).toBeVisible()

    await page.getByRole('button', { name: 'Delete note Bug report — fixed' }).click()
    await expect(page.getByRole('alertdialog', { name: 'Delete note?' })).toBeVisible()
    await page.getByRole('alertdialog').getByRole('button', { name: 'Delete' }).click()
    await expect(page.getByText('No notes yet')).toBeVisible()
  })

  test('notes persist after reload and count updates on dashboard', async ({ page }) => {
    await page.getByRole('button', { name: 'Add new note' }).click()
    await page.getByLabel('Title').fill('Persistent note')
    await page.getByLabel('Content').fill('Should survive reload.')
    await page.getByRole('button', { name: 'Add note' }).click()

    await page.reload()
    await expect(page.getByRole('heading', { name: 'Persistent note' })).toBeVisible()

    await page.getByRole('link', { name: 'Go back' }).click()
    await expect(page.getByText(/1 private note saved/i)).toBeVisible()
  })

  test('whitespace-only note title is rejected', async ({ page }) => {
    await page.getByRole('button', { name: 'Add new note' }).click()
    await page.getByLabel('Title').fill('   ')
    await page.getByLabel('Content').fill('Some content')
    await page.getByRole('button', { name: 'Add note' }).click()

    await expect(page.getByText('Please enter a title for your note.')).toBeVisible()
  })
})

test.describe('Senior QA — Profile', () => {
  test.beforeEach(async ({ page }) => {
    await clearAppStorage(page)
    await login(page)
    await page.getByRole('link', { name: /Profile/i }).click()
  })

  test('email field is read-only', async ({ page }) => {
    const emailField = page.getByLabel('Email')
    await expect(emailField).toBeDisabled()
    await expect(emailField).toHaveValue(CREDENTIALS.email)
  })

  test('empty display name shows validation error', async ({ page }) => {
    await page.getByLabel('Display name').fill('')
    await page.getByRole('button', { name: 'Save profile' }).click()

    await expect(page.getByText('Display name cannot be empty.')).toBeVisible()
  })

  test('profile name change reflects on dashboard after navigation', async ({ page }) => {
    await page.getByLabel('Display name').fill('QA Tester')
    await page.getByRole('button', { name: 'Save profile' }).click()
    await expect(page.getByText('Profile updated successfully.')).toBeVisible()

    await page.getByRole('link', { name: 'Go back' }).click()
    await expect(page.getByRole('heading', { name: 'Welcome, QA Tester' })).toBeVisible()

    await page.reload()
    await expect(page.getByRole('heading', { name: 'Welcome, QA Tester' })).toBeVisible()
  })
})

test.describe('Senior QA — Settings & Data', () => {
  test.beforeEach(async ({ page }) => {
    await clearAppStorage(page)
    await login(page)
    await page.getByRole('link', { name: /Settings/i }).click()
  })

  test('theme toggle switches light and dark', async ({ page }) => {
    await expect(page.getByText('Current theme: Light')).toBeVisible()

    await page.getByRole('button', { name: /Switch to dark mode/i }).click()
    await expect(page.getByText('Current theme: Dark')).toBeVisible()
    await expect(page.locator('html')).toHaveClass(/dark/)

    await page.getByRole('button', { name: /Switch to light mode/i }).click()
    await expect(page.getByText('Current theme: Light')).toBeVisible()
  })

  test('theme preference persists after reload', async ({ page }) => {
    await page.getByRole('button', { name: /Switch to dark mode/i }).click()
    await page.reload()

    await expect(page.getByText('Current theme: Dark')).toBeVisible()
    await expect(page.locator('html')).toHaveClass(/dark/)
  })

  test('privacy policy link is present and valid', async ({ page }) => {
    const link = page.getByRole('link', { name: 'Privacy policy' })
    await expect(link).toBeVisible()
    await expect(link).toHaveAttribute('href', 'https://husky1711.github.io/welcome-app/')
  })

  test('clear all data logs out and resets app', async ({ page }) => {
    await page.getByRole('link', { name: 'Go back' }).click()
    await page.getByRole('link', { name: /My Notes/i }).click()
    await page.getByRole('button', { name: 'Add new note' }).click()
    await page.getByLabel('Title').fill('Temp note')
    await page.getByLabel('Content').fill('Will be cleared')
    await page.getByRole('button', { name: 'Add note' }).click()

    await page.getByRole('link', { name: 'Go back' }).click()
    await page.getByRole('link', { name: /Settings/i }).click()
    await page.getByRole('button', { name: 'Clear all app data' }).click()
    await expect(page.getByRole('alertdialog', { name: 'Clear all app data?' })).toBeVisible()
    await page.getByRole('button', { name: 'Clear data' }).click()

    await expect(page.getByRole('heading', { name: 'Welcome App' })).toBeVisible()

    await page.getByLabel('Email').fill(CREDENTIALS.email)
    await page.getByLabel('Password').fill(CREDENTIALS.password)
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page.getByText(/0 private notes/i)).toBeVisible()
    await expect(page.getByRole('heading', { name: /Welcome, admin/i })).toBeVisible()
  })

  test('delete note confirmation can be cancelled', async ({ page }) => {
    await page.getByRole('link', { name: 'Go back' }).click()
    await page.getByRole('link', { name: /My Notes/i }).click()
    await page.getByRole('button', { name: 'Add new note' }).click()
    await page.getByLabel('Title').fill('Keep me')
    await page.getByLabel('Content').fill('Should not be deleted')
    await page.getByRole('button', { name: 'Add note' }).click()

    await page.getByRole('button', { name: 'Delete note Keep me' }).click()
    await page.getByRole('button', { name: 'Cancel' }).click()

    await expect(page.getByRole('heading', { name: 'Keep me' })).toBeVisible()
  })
})

test.describe('Senior QA — Logout & Security', () => {
  test('logout from dashboard clears session', async ({ page }) => {
    await clearAppStorage(page)
    await login(page)
    await page.getByRole('button', { name: 'Log out of your account' }).click()

    await expect(page.getByRole('heading', { name: 'Welcome App' })).toBeVisible()

    await page.goto('/#/welcome')
    await expect(page.getByRole('heading', { name: 'Welcome App' })).toBeVisible()
  })
})
