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
Welcome App is a lightweight personal space for Android. Sign in once and access your private dashboard on your device.

Features:
• Daily habit tracker — checklist with progress ring and streaks
• Calendar view — review completion history for the last 7 days
• Habit reminders — optional daily notifications per habit (Android)
• Private notes — create, edit, and delete notes stored locally
• Profile — update your display name
• Settings — light/dark theme, privacy policy, and data controls
• Clean, modern design with bottom navigation built for mobile

All habits, notes, and session data stay on your device. No account server required.

Reviewer test account:
Email: admin@example.com
Password: password123
```

## Release notes (v2.0.0)

```
What's new in v2.0:
• Daily Tracker — habits checklist with progress ring and streaks
• Calendar — month view with completion dots and day review
• Reminders — optional daily notifications per habit on Android
• Bottom navigation — quick access to Home, Today, Calendar, and Habits
• Dashboard widget — today's habit progress at a glance
• Dark mode polish across the app
```

## Reviewer instructions (Play Console → App content → App access)

```
All functionality is available after sign-in.

Test credentials:
Email: admin@example.com
Password: password123

Flow: Login → Dashboard → Daily Tracker (Today tab) → add a habit → toggle complete → try Calendar and Habits tabs → Settings → Logout.

For reminders: enable a habit reminder on the Habits tab. Notifications require permission on a physical Android device.
```

## Data safety (Phase 1 — mock auth)

| Question | Answer |
|----------|--------|
| Collect/transmit data off-device? | No |
| Store data on device? | Yes — email for session, habits, notes, and settings |
| Purpose | App functionality |
| Encrypted in transit? | N/A |
| User can delete data? | Yes — Log out or Clear all app data |

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

Re-capture screenshots after v2.0 UI changes (Today, Calendar, Habits, dashboard widget). Run `npm run screenshots`.
