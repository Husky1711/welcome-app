# Welcome App

A personal wellness app — habits, notes, and daily tracking — built with React and packaged for Android with Capacitor.

**Tagline:** *Your day. Your work. Your space.*

## Tech stack

- React 19 + Vite + TypeScript
- Tailwind CSS v4
- React Router (HashRouter for Capacitor)
- Capacitor 8 (Android)
- Firebase Auth (optional, production)
- Playwright (E2E) + Vitest (unit)

## Features

- **Auth** — mock credentials for dev/E2E, or Firebase email/password (sign-up, sign-in, forgot password)
- **Home** — dashboard with feature cards and daily tracker widget
- **Today** — habit checklist with progress ring and streak-aware copy
- **Habits** — CRUD, icons (emoji or cropped photo), per-habit Android reminders
- **Calendar** — month view with day sheet for past completions
- **Notes** — private notes stored locally on device
- **Profile** — display name, avatar (circular crop), member since, today snapshot
- **Settings** — theme toggle, app info, privacy link, clear data, sign out
- **Navigation** — floating bottom tabs (Home, Today, Calendar, Habits); Notes, Profile, and Settings keep the tab bar

## Mock credentials (local dev / E2E)

When `VITE_AUTH_PROVIDER=mock` (default):

| Field | Value |
|-------|-------|
| Email | `admin@example.com` |
| Password | `password123` |

## Firebase authentication (production)

Email/password auth via Firebase. See [`docs/FIREBASE_SETUP.md`](docs/FIREBASE_SETUP.md).

```bash
cp .env.example .env
# Set VITE_AUTH_PROVIDER=firebase and VITE_FIREBASE_* values
```

| Provider | Env | Use case |
|----------|-----|----------|
| `mock` | `VITE_AUTH_PROVIDER=mock` | Local dev, unit tests, Playwright E2E |
| `firebase` | `VITE_AUTH_PROVIDER=firebase` | Production builds, real accounts |

### Firebase emulator (optional)

```bash
npm run dev:firebase
npm run test:e2e:firebase
```

Uses `.env.firebase-emulator` (local only, not committed).

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

### Routes

| Route | Screen |
|-------|--------|
| `/#/` | Sign in |
| `/#/sign-up` | Create account |
| `/#/forgot-password` | Password reset |
| `/#/welcome` | Home dashboard |
| `/#/today` | Daily tracker |
| `/#/habits` | Manage habits |
| `/#/calendar` | Habit calendar |
| `/#/notes` | Private notes |
| `/#/profile` | Profile |
| `/#/settings` | Settings |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server (mock auth) |
| `npm run dev:firebase` | Dev server + Firebase Auth emulator |
| `npm run build` | Production web build |
| `npm run test` | Unit tests (Vitest) |
| `npm run test:e2e` | E2E tests (mock auth, Chromium) |
| `npm run test:e2e:firebase` | E2E against Firebase emulator |
| `npm run test:qa` | Senior QA suite (headed) |
| `npm run screenshots` | Regenerate Play Store screenshots |
| `npm run build:android` | Build web + Capacitor sync |
| `npm run bundle:release` | Signed Android App Bundle |

## Testing

```bash
# Unit tests
npm test

# Full E2E (starts dev server with mock auth)
npm run test:e2e

# QA-focused suite
npm run test:e2e -- e2e/senior-qa.spec.ts
```

E2E expects `VITE_AUTH_PROVIDER=mock` (set automatically by `playwright.config.ts` when it starts the dev server).

## Android

### Prerequisites

- Node.js 20+
- Android Studio
- JDK (bundled with Android Studio)

### Run on emulator or device

```bash
npm run build:android
npx cap open android
```

## Play Store

| Doc | Purpose |
|-----|---------|
| [`docs/PLAY_CONSOLE_GUIDE.md`](docs/PLAY_CONSOLE_GUIDE.md) | Full submission walkthrough |
| [`docs/PLAY_STORE_CHECKLIST.md`](docs/PLAY_STORE_CHECKLIST.md) | Step-by-step checklist |
| [`docs/play-store-listing.md`](docs/play-store-listing.md) | Store copy |
| [`docs/GITHUB_PAGES_SETUP.md`](docs/GITHUB_PAGES_SETUP.md) | Host privacy policy |

Privacy policy: `https://husky1711.github.io/welcome-app/`

Store screenshots: `assets/store/01-login-screen.png` … `05-settings-screen.png`

## Project structure

```
src/
  components/   # UI, habits, notes, profile, settings, layout
  config/       # Firebase init
  constants/    # Routes, navigation tabs, app info
  contexts/     # Auth, settings
  hooks/        # useAuth, useHabits, useNotes, useProfileAvatar, …
  layouts/      # AppLayout, AuthLayout
  pages/        # Route screens
  routes/       # Router and protected routes
  services/     # Auth (mock + Firebase), habit reminders
  styles/       # Page-level CSS (habits, today, profile, settings, …)
  utils/        # Storage, validation, image crop, wellness copy
e2e/            # Playwright specs
docs/           # Firebase, Play Store, privacy policy
```

## Design

Forest green (`#1b4332`) and cream (`#f7f6f3`) palette, Playfair Display + DM Sans typography, shared card chrome across Habits, Today, Notes, Profile, and Settings.
