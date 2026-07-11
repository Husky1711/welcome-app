# Firebase setup — Welcome App

This guide walks through creating a Firebase project and enabling email/password auth for Welcome App v1.

## 1. Create a Firebase project

1. Open [Firebase Console](https://console.firebase.google.com/)
2. Click **Add project**
3. Name it (e.g. `welcome-app-prod`)
4. Disable Google Analytics if you do not need it (optional for auth-only v1)
5. Click **Create project**

## 2. Register the web app

1. In the project overview, click the **Web** icon (`</>`)
2. App nickname: `welcome-app-web`
3. Do **not** enable Firebase Hosting yet (optional later)
4. Click **Register app**
5. Copy the `firebaseConfig` values — you will paste them into `.env`

## 3. Enable Email/Password authentication

1. Go to **Build → Authentication**
2. Click **Get started**
3. Open the **Sign-in method** tab
4. Enable **Email/Password**
5. Leave **Email link (passwordless sign-in)** disabled for v1

## 4. Configure environment variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Set:

```env
VITE_AUTH_PROVIDER=firebase

VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

Restart the dev server after changing `.env`.

## 5. Create a Play Store reviewer account

1. In Firebase Console → **Authentication → Users**
2. Click **Add user**
3. Create a dedicated reviewer account, e.g. `reviewer@yourdomain.com`
4. Use a strong password and document it in Play Console → **App access**

Or let reviewers self-register via **Create account** in the app.

## 6. Password reset emails

Firebase sends reset links automatically when users submit **Forgot password?**.

Optional customization:

1. **Authentication → Templates → Password reset**
2. Customize sender name and email copy
3. For production, configure a custom email domain under **Authentication → Settings**

## 7. Authorized domains

Firebase Auth allows `localhost` by default for development.

For production web hosting, add your domain under **Authentication → Settings → Authorized domains**.

Capacitor Android builds use the Firebase web SDK; `localhost` is not required on device.

## 8. Local development modes

| Mode | Command | Use case |
|------|---------|----------|
| Mock | `npm run dev` | Offline dev, unit tests, Playwright E2E |
| Firebase Emulator | `npm run dev:firebase` | Real Firebase SDK against local Auth Emulator |
| Firebase Production | `VITE_AUTH_PROVIDER=firebase` in `.env` | Production builds, real accounts |

E2E mock tests always force `mock` via `playwright.config.ts`.

### Firebase Auth Emulator (recommended for testing)

No cloud project required. Uses the real Firebase Auth SDK locally.

```bash
npm run dev:firebase
```

This starts:
- Firebase Auth Emulator on `127.0.0.1:9099`
- Vite with `.env.firebase-emulator`

Run Firebase browser tests:

```bash
npm run test:e2e:firebase
npm run test:e2e:firebase:headed   # visible browser
```

## 9. Security checklist (v1)

- [ ] Never commit `.env` to git
- [ ] Use a separate Firebase project for dev vs production (recommended)
- [ ] Create a dedicated Play Store reviewer account
- [ ] Update privacy policy and Play Console data safety form
- [ ] Enable **App Check** before public launch (Phase 2)

## 10. Troubleshooting

| Issue | Fix |
|-------|-----|
| `Firebase is not configured` on startup | Fill all `VITE_FIREBASE_*` vars and restart dev server |
| `auth/invalid-api-key` | Copy API key again from Firebase project settings |
| Reset email not received | Check spam; verify email exists in Authentication → Users |
| E2E tests fail against Firebase | E2E should use `mock` — check `playwright.config.ts` |

## Architecture

```
SignInPage / SignUpPage / ForgotPasswordPage
        ↓
   AuthContext (useAuth)
        ↓
   getAuthService() → firebaseAuthService | mockAuthService
        ↓
   Firebase Auth SDK (email/password only in v1)
```

Habits, notes, and settings remain **local on device** in v1. Firebase is used for account authentication only.
