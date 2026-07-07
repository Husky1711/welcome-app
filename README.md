# Welcome App

A simple React SPA with login, welcome, and logout — wrapped with Capacitor for Google Play Store distribution.

## Tech stack

- React + Vite + TypeScript
- Tailwind CSS
- React Router (HashRouter for Capacitor)
- Capacitor (Android)

## Mock credentials

- **Email:** `admin@example.com`
- **Password:** `password123`

## Development (browser)

```bash
npm install
npm run dev
```

Open `http://localhost:5173` and use the routes:

- `/#/` — Login
- `/#/welcome` — Welcome (protected)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production web build |
| `npm run test` | Run unit tests |
| `npm run build:android` | Build web app and sync to Android |

## Android development

### Prerequisites

- Node.js 20+
- Android Studio (latest) — **already installed on your machine**
- JDK — bundled with Android Studio at `C:\Program Files\Android\Android Studio\jbr`

### Environment variables (configured)

| Variable | Value |
|----------|-------|
| `JAVA_HOME` | `C:\Program Files\Android\Android Studio\jbr` |
| `ANDROID_HOME` | `C:\Users\Rupa\AppData\Local\Android\Sdk` |

**Note:** Restart your terminal (or Cursor) for PATH changes to take effect in new sessions.

### Run on emulator or device

```bash
npm run build:android
npx cap open android
```

In Android Studio, run the app on an emulator or connected device.

## Play Store

Full walkthrough: `docs/PLAY_CONSOLE_GUIDE.md`

Privacy policy URL: `https://husky1711.github.io/welcome-app/` (enable Pages first — `docs/GITHUB_PAGES_SETUP.md`)

## Project structure

```
src/
  components/   # UI and auth components
  contexts/     # AuthContext
  hooks/        # useAuth
  layouts/      # Page layouts
  pages/        # Login and Welcome screens
  routes/       # Router and guards
  services/     # Mock auth (Firebase-ready interface)
  utils/        # Storage and validation helpers
```

## Future: Firebase auth

Swap `mockAuthService` with `firebaseAuthService` implementing `IAuthService`, then set `VITE_AUTH_PROVIDER=firebase` in `.env`.
