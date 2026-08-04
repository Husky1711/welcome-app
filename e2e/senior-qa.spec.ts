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

/** Scoped so it does not also match the companion switch. */
function themeToggle(page: Page) {
  return page.locator('label.settings-toggle', {
    has: page.locator('input[aria-label$="mode"]'),
  })
}

function companionToggle(page: Page) {
  return page.locator('label.settings-toggle', {
    has: page.locator('input[aria-label$="companion"]'),
  })
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
    await page.getByRole('button', { name: 'Open account menu' }).click()
    await expect(page.getByText(CREDENTIALS.email)).toBeVisible()
  })

  test('all protected routes redirect to login when logged out', async ({ page }) => {
    const protectedRoutes = [
      '/#/welcome',
      '/#/today',
      '/#/calendar',
      '/#/habits',
      '/#/notes',
      '/#/profile',
      '/#/settings',
    ]

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
    await expect(page.getByRole('link', { name: /Notes/i })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Open account menu' })).toBeVisible()
    await expect(page.getByText(/0 private notes/i)).toBeVisible()
  })

  test('home tab returns to dashboard from each section', async ({ page }) => {
    await page.getByRole('link', { name: /Notes/i }).click()
    await expect(page.getByRole('heading', { name: 'My Notes' })).toBeVisible()
    await page.getByRole('tab', { name: 'Home' }).click()
    await expect(page.getByRole('heading', { name: /Welcome,/i })).toBeVisible()

    await page.getByRole('button', { name: 'Open account menu' }).click()
    await page.getByRole('link', { name: 'Profile' }).click()
    await expect(page.getByRole('heading', { name: 'Profile' })).toBeVisible()
    await page.getByRole('tab', { name: 'Home' }).click()
    await expect(page.getByRole('heading', { name: /Welcome,/i })).toBeVisible()

    await page.goto('/#/settings')
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()
    await page.getByRole('tab', { name: 'Home' }).click()
    await expect(page.getByRole('heading', { name: /Welcome,/i })).toBeVisible()
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
    await page.getByRole('link', { name: /Notes/i }).click()
  })

  test('add new opens autosaving editor', async ({ page }) => {
    await page.getByRole('button', { name: 'Add new' }).click()
    await expect(page.getByLabel('Title')).toBeVisible()
    await expect(page.getByText(/Autosaved/i)).toBeVisible()
  })

  test('create, edit, delete note lifecycle', async ({ page }) => {
    await page.getByRole('button', { name: 'Add new' }).click()
    await page.getByLabel('Title').fill('Bug report')
    await page.getByLabel('Note content').first().fill('Found during QA testing.')
    await page.getByRole('button', { name: 'Done' }).click()
    await page.getByRole('link', { name: 'Back to notes' }).click()

    await expect(page.getByRole('heading', { name: 'Bug report' })).toBeVisible()

    await page.getByRole('button', { name: 'Open Bug report' }).click()
    await page.getByLabel('Title').fill('Bug report — fixed')
    await page.getByRole('button', { name: 'Done' }).click()
    await page.getByRole('button', { name: 'More actions' }).click()
    await page.getByRole('menuitem', { name: 'Delete' }).click()
    await expect(page.getByRole('alertdialog', { name: 'Delete note?' })).toBeVisible()
    await page.getByRole('alertdialog').getByRole('button', { name: 'Delete' }).click()

    await expect(page.getByText('No notes yet')).toBeVisible()
  })

  test('notes persist after reload and count updates on dashboard', async ({ page }) => {
    await page.getByRole('button', { name: 'Add new' }).click()
    await page.getByLabel('Title').fill('Persistent note')
    await page.getByLabel('Note content').first().fill('Should survive reload.')
    await page.getByRole('button', { name: 'Done' }).click()
    await page.getByRole('link', { name: 'Back to notes' }).click()

    await page.reload()
    await expect(page.getByRole('heading', { name: 'Persistent note' })).toBeVisible()

    await page.getByRole('tab', { name: 'Home' }).click()
    await expect(page.getByText(/1 saved/i)).toBeVisible()
  })

  test('search filters notes', async ({ page }) => {
    await page.getByRole('button', { name: 'Add new' }).click()
    await page.getByLabel('Title').fill('Groceries')
    await page.getByLabel('Note content').first().fill('Milk')
    await page.getByRole('button', { name: 'Done' }).click()
    await page.getByRole('link', { name: 'Back to notes' }).click()

    await page.getByRole('button', { name: 'Add new' }).click()
    await page.getByLabel('Title').fill('Bills')
    await page.getByLabel('Note content').first().fill('Electric')
    await page.getByRole('button', { name: 'Done' }).click()
    await page.getByRole('link', { name: 'Back to notes' }).click()

    await page.getByLabel('Search notes and tasks').fill('Milk')
    await expect(page.getByRole('heading', { name: 'Groceries' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Bills' })).toHaveCount(0)
  })
})

test.describe('Senior QA — Profile', () => {
  test.beforeEach(async ({ page }) => {
    await clearAppStorage(page)
    await login(page)
    await page.getByRole('button', { name: 'Open account menu' }).click()
    await page.getByRole('link', { name: 'Profile' }).click()
  })

  test('email field is read-only', async ({ page }) => {
    const emailField = page.getByLabel('Email')
    await expect(emailField).toBeDisabled()
    await expect(emailField).toHaveValue(CREDENTIALS.email)
  })

  test('empty display name shows validation error', async ({ page }) => {
    await page.getByLabel('What should we call you?').fill('')
    await page.getByRole('button', { name: 'Save profile' }).click()

    await expect(page.getByText('Display name cannot be empty.')).toBeVisible()
  })

  test('profile name change reflects on dashboard after navigation', async ({ page }) => {
    await page.getByLabel('What should we call you?').fill('QA Tester')
    await page.getByRole('button', { name: 'Save profile' }).click()
    await expect(page.getByText('Profile updated successfully.')).toBeVisible()

    await page.getByRole('tab', { name: 'Home' }).click()
    await expect(page.getByRole('heading', { name: 'Welcome, QA Tester' })).toBeVisible()

    await page.reload()
    await expect(page.getByRole('heading', { name: 'Welcome, QA Tester' })).toBeVisible()
  })
})

test.describe('Senior QA — Settings & Data', () => {
  test.beforeEach(async ({ page }) => {
    await clearAppStorage(page)
    await login(page)
    await page.goto('/#/settings')
  })

  test('theme toggle switches light and dark', async ({ page }) => {
    await expect(page.getByText('Light mode')).toBeVisible()

    await themeToggle(page).click()
    await expect(page.getByText('Dark mode')).toBeVisible()
    await expect(page.locator('html')).toHaveClass(/dark/)

    await themeToggle(page).click()
    await expect(page.getByText('Light mode')).toBeVisible()
  })

  test('theme preference persists after reload', async ({ page }) => {
    await themeToggle(page).click()
    await page.reload()

    await expect(page.getByText('Dark mode')).toBeVisible()
    await expect(page.locator('html')).toHaveClass(/dark/)
  })

  test('companion is off by default and the preference survives reload', async ({ page }) => {
    await expect(page.getByText('Off')).toBeVisible()
    await expect(page.locator('.companion-stage[data-active="true"]')).toHaveCount(0)

    await companionToggle(page).click()
    await expect(page.getByText('Preview — placeholder artwork')).toBeVisible()

    await page.reload()
    await expect(page.getByText('Preview — placeholder artwork')).toBeVisible()
  })

  test('privacy policy link is present and valid', async ({ page }) => {
    const link = page.getByRole('link', { name: 'Privacy policy' })
    await expect(link).toBeVisible()
    await expect(link).toHaveAttribute('href', 'https://husky1711.github.io/welcome-app/')
  })

  test('clear all data logs out and resets app', async ({ page }) => {
    await page.getByRole('tab', { name: 'Home' }).click()
    await page.getByRole('link', { name: /Notes/i }).click()
    await page.getByRole('button', { name: 'Add new' }).click()
    await page.getByLabel('Title').fill('Temp note')
    await page.getByLabel('Note content').first().fill('Will be cleared')
    await page.getByRole('button', { name: 'Done' }).click()
    await page.evaluate(() => {
      localStorage.setItem(
        'welcome_app_avatars',
        JSON.stringify({ 'admin@example.com': 'data:image/png;base64,test-avatar' }),
      )
    })

    await page.getByRole('tab', { name: 'Home' }).click()
    await page.goto('/#/settings')
    await page.getByRole('button', { name: 'Clear all app data' }).click()
    await expect(page.getByRole('alertdialog', { name: 'Clear all app data?' })).toBeVisible()
    await page.getByRole('button', { name: 'Clear data' }).click()

    await expect(page.getByRole('heading', { name: 'Welcome App' })).toBeVisible()
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem('welcome_app_avatars')))
      .toBeNull()

    await page.getByLabel('Email').fill(CREDENTIALS.email)
    await page.getByLabel('Password').fill(CREDENTIALS.password)
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page.getByText(/0 private notes/i)).toBeVisible()
    await expect(page.getByRole('heading', { name: /Welcome, admin/i })).toBeVisible()
  })

  test('delete note confirmation can be cancelled', async ({ page }) => {
    await page.getByRole('tab', { name: 'Home' }).click()
    await page.getByRole('link', { name: /Notes/i }).click()
    await page.getByRole('button', { name: 'Add new' }).click()
    await page.getByLabel('Title').fill('Keep me')
    await page.getByLabel('Note content').first().fill('Should not be deleted')
    await page.getByRole('button', { name: 'Done' }).click()
    await page.getByRole('link', { name: 'Back to notes' }).click()

    await page.getByRole('button', { name: 'Open Keep me' }).click()
    await page.getByRole('button', { name: 'More actions' }).click()
    await page.getByRole('menuitem', { name: 'Delete' }).click()
    await page.getByRole('alertdialog').getByRole('button', { name: 'Cancel' }).click()
    await page.getByRole('link', { name: 'Back to notes' }).click()

    await expect(page.getByRole('heading', { name: 'Keep me' })).toBeVisible()
  })
})

test.describe('Senior QA — Logout & Security', () => {
  test('logout from settings clears session', async ({ page }) => {
    await clearAppStorage(page)
    await login(page)
    await page.getByRole('button', { name: 'Open account menu' }).click()
    await page.getByRole('button', { name: 'Log out of your account' }).click()

    await expect(page.getByRole('heading', { name: 'Welcome App' })).toBeVisible()

    await page.goto('/#/welcome')
    await expect(page.getByRole('heading', { name: 'Welcome App' })).toBeVisible()
  })
})
