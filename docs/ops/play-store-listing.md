# Play Store Listing — Welcome App

## App details

| Field | Value |
|-------|-------|
| App name | Welcome App |
| Package ID | `com.rupa.welcomeapp` |
| Category | Tools (or Productivity) |
| Price | Free |

## Short description (80 chars max)

```
Daily habits, calendar, reminders & private notes — your personal space.
```

## Full description

```
Welcome App is a lightweight personal space for Android. Create an account and access your private dashboard.

Features:
• Daily habit tracker — checklist with progress ring and streaks
• Calendar view — review completion history for the last 7 days
• Habit reminders — optional daily notifications per habit (Android)
• Private notes — create, edit, and delete notes stored locally on your device
• Profile — update your display name
• Settings — light/dark theme, privacy policy, and data controls
• Clean, modern design with bottom navigation built for mobile

Account sign-in is powered by Firebase. Habits, notes, and settings stay on your device.

Reviewer test account:
Email: reviewer@yourdomain.com
Password: (create in Firebase Console — see docs/FIREBASE_SETUP.md)
```

## Release notes (v2.1.0)

```
What's new:
• Email sign-up and sign-in with Firebase Authentication
• Forgot password via email reset link
• Account security improvements
```

## Reviewer instructions (Play Console → App content → App access)

```
All functionality is available after sign-in.

Create a test account in the app via "Create account", or use the dedicated reviewer account configured in Firebase.

Flow: Sign in → Dashboard → Daily Tracker (Today tab) → add a habit → toggle complete → try Calendar and Habits tabs → Settings → Logout.

For reminders: enable a habit reminder on the Habits tab. Notifications require permission on a physical Android device.
```

## Data safety (Firebase auth v1)

| Question | Answer |
|----------|--------|
| Collect/transmit data off-device? | **Yes** — email address for account authentication via Firebase |
| Store data on device? | **Yes** — habits, notes, settings, session cache |
| Purpose | App functionality, account management |
| Encrypted in transit? | **Yes** — Firebase uses HTTPS/TLS |
| User can delete data? | **Yes** — Log out clears local session; uninstall removes local data; contact developer for account deletion |
| Third-party processors | Google Firebase Authentication |

## Privacy policy URL

```
https://husky1711.github.io/welcome-app/
```

Enable GitHub Pages from the `main` branch `/docs` folder — see `docs/GITHUB_PAGES_SETUP.md`.

## Store listing assets

| Asset | File |
|-------|------|
| App icon | `assets/store/icon-512.png` |
| Feature graphic | `assets/store/feature-graphic.png` |
| Phone screenshots | `assets/store/screenshot-*.png` |

Re-capture screenshots after auth UI changes. Run `npm run screenshots`.

## Firebase setup

See `docs/FIREBASE_SETUP.md` for creating the Firebase project, enabling Email/Password auth, and configuring `.env`.
